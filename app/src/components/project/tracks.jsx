import React from 'react';
import ReactDOM from 'react-dom';
import Dropzone from 'react-dropzone';
import update from 'react/lib/update';
import { DragDropContext } from 'react-dnd';
import HTML5Backend from 'react-dnd-html5-backend';
import { connect } from 'react-redux';
import cookie from 'react-cookie';
import ReactTimeout from 'react-timeout';
import R from 'ramda';
import * as filestack from 'filestack-js';
import {
  Row,
  Col,
  Button,
  Alert,
  Progress
} from '@sketchpixy/rubix';
import { FILEPICKER_KEY } from '../../constants';
import actions from '../../redux/actions';
import { getArrayIndex } from '../../utils';
import { getQuotas, getQuotaValueByCode, checkMaxProjectTracks, checkMaxAudioUploadSize } from '../../services/plan-check';
import FileSizeMessage from '../common/filesize-message.jsx';
import PurchasePopup from '../purchase/purchase-popup.jsx';
import ProjectHeader from './project-header.jsx';
import ProjectAlert from './project-alert.jsx';
import TrackItem from './track-item.jsx';
import TrackEdit from './track-edit.jsx';
import TrackUploading from './track-uploading.jsx';

class ProjectTracks extends React.Component {
  client;

  constructor(...args) {
    super(...args);

    const projectId = this.props.params.projectId ? this.props.params.projectId : null;
    this.state = {
      projectId: projectId,
      tracks: [],
      editModal: false,
      editTrack: null,
      drag: false,
      playingTrack: {},
      playingStatus: null,
      allChecked: false,
      checkedIds: [],
      uploadings: [],
    };
  }

  componentWillMount() {
    const { dispatch, project, status, tracks } = this.props;

    if(this.state.projectId && !project ) {
      dispatch(actions.getProject(this.state.projectId));
    }

    dispatch(actions.getTracks(this.state.projectId));
  }

  componentDidMount() {
    const filepicker = require('filepicker-js');
    filepicker.setKey(FILEPICKER_KEY);
    this.client = filestack.init(FILEPICKER_KEY);
  }

  componentWillReceiveProps (nextProps) {
    const { playingTrack, dispatch } = this.props;
    const { status, uploadId, removedTrackIds, addedTrack } = nextProps;
    const { projectId } = this.state;
    let tracks = R.filter((track) => track.project == projectId, nextProps.tracks);
    const uploadings = R.filter((file) => file.projectId == projectId, nextProps.uploadings);

    this.setState({uploadings: uploadings});

    if(status == 'added' && uploadId) {
      const index = getArrayIndex(uploadId, uploadings, 'uploadId');

      if(index !== -1) {
        // uploading succeed
        uploadings.splice(index, 1);
        dispatch(actions.setUploadings(projectId, uploadings));
        // this.setState({uploadings: uploadings});
      }
    }

    if(status == 'deleted') {
      if(removedTrackIds.indexOf(playingTrack && playingTrack.id) !== -1) {
        this.setState({ playingTrack: null});
      }
    }

    if(status == 'got') {
      tracks = this.checkTracksOrder(tracks);
    }

    if(status == 'got' || status == 'saved' || status == 'added' || status == 'deleted') {
      this.setState({tracks: tracks});
    }

    if(tracks.length + uploadings.length == 0) {
      this.setState({allChecked: false});
    }
  }

  componentWillUnmount() {
    const { projectId } = this.state;
    const uploadings = R.filter((file) => file.projectId == projectId, this.props.uploadings);
    
    if(uploadings.length) {
      alert("Your audio is still uploading. Please keep this page open until it's done.");
      this.props.router.push(`/project/${projectId}/audio`);
    }
  }

  setPlaying(track, playing) {
    if(playing)
      this.setState({ playingTrack: track});
    else
      this.setState({ playingTrack: null});
  }

  uploadFile(e) {
    e.preventDefault();
    $(".alert", "#alert-box").remove();

    if(!this.checkPlanTracks()) {
      return false;
    }

    const { dispatch, userPlan, plans, setTimeout } = this.props;
    let maxSize = getQuotaValueByCode(getQuotas(userPlan, plans), 'audio_upload_data');

    const pickerDlg = this.client.pick({
      accept: ['.mp3', '.aif', '.aiff', '.wav', '.aac', '.ogg', '.mp2', '.wma', '.flac', '.amr', '.m4a'],
      maxSize: maxSize * 1024 * 1024,
      maxFiles: 20,
      hideWhenUploading: true,
      uploadInBackground: false,
      onFileUploadProgress: (...args) => this.onUploadProgress(...args, pickerDlg),
      onFileUploadFinished: (...args) => this.onUploadFinished(...args),
      onFileUploadFailed: (...args) => this.onUploadFailed(...args),
    }).then((files) => {
      // console.log(files);
    });
  }

  onUploadProgress (file, progressEvent, dialog) {
    let { uploadings, projectId } = this.state;
    const { dispatch, userPlan, plans } = this.props;
    
    const index = getArrayIndex(file.uploadId, uploadings, 'uploadId');

    if(progressEvent.totalPercent > 0) {
      if(this.checkRemoveUploading(file.uploadId)) {
        if (index === -1) {
          uploadings.push({
            projectId: projectId,
            uploadId: file.uploadId,
            progress: progressEvent.totalPercent,
            filename: file.filename,
            dialog: dialog,
            file: file,
          });
          uploadings = R.sortWith([R.descend(R.prop('uploadId'))])(uploadings);
        }
        else {
          uploadings[index].progress = progressEvent.totalPercent;
          uploadings[index].file = file;
        }
        dispatch(actions.setUploadings(projectId, uploadings));
      }
    }
    else {
      if (index !== -1) {
        uploadings.splice(index, 1);
        dispatch(actions.setUploadings(projectId, uploadings));
      }
    }
  }

  onUploadFinished (file) {
    let { uploadings, projectId } = this.state;
    const { dispatch, userPlan, plans } = this.props;

    const index = getArrayIndex(file.uploadId, uploadings, 'uploadId');

    if (index !== -1) {
      uploadings[index].progress = 100;
      uploadings[index].file = file;

      if(index === 0 || (index > 0 && uploadings[index - 1].done === true)) {
        for(let i=index; i<uploadings.length; i++) {
          if(uploadings[i].progress == 100) {
            if(this.checkRemoveUploading(uploadings[i].uploadId)) {
              if(!checkMaxAudioUploadSize(userPlan, plans, file.size)) {
                dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "audio_upload_data" }));
                uploadings.splice(index, 1);
                dispatch(actions.setUploadings(projectId, uploadings));
              }
              else {
                dispatch(actions.createTrack(projectId, uploadings[i].file));
                uploadings[i].done = true;
              }
            }
          }
          else {
            break;
          }
        }
      }
    }

    dispatch(actions.setUploadings(projectId, uploadings));
  }

  onUploadFailed (file, error) {
    $(".alert.alert-danger", "#alert-box").html("Sorry, something went wrong. Please try again in a little bit.");

    let { uploadings, projectId } = this.state;

    const index = getArrayIndex(file.uploadId, uploadings, 'uploadId');

    if (index !== -1) {
      uploadings.splice(index, 1);
      dispatch(actions.setUploadings(projectId, uploadings));
    }
  }

  onProgress (file, dialog) {
    let { uploadings, projectId } = this.state;
    const { dispatch, userPlan, plans } = this.props;

    const index = getArrayIndex(file.uploadId, uploadings, 'uploadId');

    if(file.progress > 0) {
      if (index == -1) {
        uploadings.push({
          projectId: projectId,
          uploadId: file.uploadId,
          progress: file.progress,
          filename: file.filename,
          dialog: dialog,
          file: file,
        });
        uploadings = R.sortWith([R.descend(R.prop('uploadId'))])(uploadings);
      }
      else {
        uploadings[index].progress = file.progress;
        uploadings[index].file = file;

        if (file.progress == 100) {
          if(index == 0 || (index > 0 && uploadings[index - 1].done === true)) {
            for(let i=index; i<uploadings.length; i++) {
              if(uploadings[i].progress == 100) {
                if(!checkMaxAudioUploadSize(userPlan, plans, file.size)) {
                  dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "audio_upload_data" }));
                  uploadings.splice(index, 1);
                  dispatch(actions.setUploadings(projectId, uploadings));
                }
                else {
                  dispatch(actions.createTrack(projectId, uploadings[i].file));
                  uploadings[i].done = true;
                }
              }
              else {
                break;
              }
            }
          }
        }
      }

      dispatch(actions.setUploadings(projectId, uploadings));
    }
    else {
      if (index !== -1) {
        uploadings.splice(index, 1);
        dispatch(actions.setUploadings(projectId, uploadings));
      }
    }
  }

  editTrack (track) {
    this.setState({ editModal: true, editTrack: track });
  }

  closeEditTrackModal() {
    this.setState({ editModal: false, editTrack: null });
  }

  enableDrag() {
    this.setState({ drag: true });
  }

  disableDrag() {
    this.setState({ drag: false });
  }

  checkTracksOrder(allTracks) {
    const { projectId, uploadings } = this.state;
    const orderString = cookie.load('project_' + projectId + '_tracks_order');
    let orderTracks = [];

    let tracks = R.filter((file) => {
      if(file.project != projectId)
        return false;

      if(file.scan == '[]') {
        const index = R.findIndex(R.propEq('filename', file.title))(uploadings);

        if(index != -1) {
          return false;
        }
      }

      return true;
    }, allTracks);

    console.log("the value of orderString is " + orderString);

    if(orderString) {
      const order = orderString.toString().split(',');

      for (let i = 0; i < order.length; i++) {
        for (let j = 0; j < tracks.length; j++) {
          if (order[i] == tracks[j].id)
            orderTracks.push(tracks[j]);
        }
      }
      if (orderTracks.length < tracks.length) {
        for (let i = orderTracks.length; i < tracks.length; i++) {
          orderTracks.push(tracks[i]);
        }
      }
    }
    else {
      orderTracks = tracks;
    }

    const trackIds = R.pluck('id')(tracks);
    cookie.save('project_' + projectId + '_tracks_order', trackIds.join(','), { path: '/' });

    return orderTracks;
  }

  moveTrack(dragIndex, hoverIndex) {
    const { tracks } = this.state;
    const dragTrack = tracks[dragIndex];

    this.setState(update(this.state, {
      tracks: {
        $splice: [
          [dragIndex, 1],
          [hoverIndex, 0, dragTrack]
        ]
      }
    }));
  }

  endDrop() {
    const { tracks } = this.state;
    const order = R.pluck('id')(tracks);

    this.setState({ drag: false });
    cookie.save('project_' + this.state.projectId + '_tracks_order', order.join(','), { path: '/' });
  }

  checkAll() {
    this.setState({allChecked: !this.state.allChecked});
  }

  checkItem(checked, id) {
    const { checkedIds } = this.state;
    const index = checkedIds.indexOf(id);

    if(checked) {
      if(index === -1) {
        this.setState({checkedIds: checkedIds.concat(id)});
      }
    }
    else {
      if(index !== -1) {
        this.setState({checkedIds: [...checkedIds.slice(0, index), ...checkedIds.slice(index + 1)]});
      }
    }
  }

  goAction() {
    const { dispatch, project } = this.props;
    const { checkedIds } = this.state;

    if(this.refs.actions.value == 'Delete') {
      if (checkedIds.length) {
        dispatch(actions.deleteTracks(project.id, checkedIds));
      }
    }
  }

  onDrop(attachFiles) {
    $(".alert", "#alert-box").remove();

    if(attachFiles.length == 0)
      return false;

    if(!this.checkPlanTracks()) {
      return false;
    }

    const { uploadings, tracks, projectId } = this.state;
    const { dispatch, userPlan, plans } = this.props;

    attachFiles.forEach((attachFile, i) => {
      if(!checkMaxAudioUploadSize(userPlan, plans, attachFile.size)) {
        dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "audio_upload_data" }));
        return false;
      }
      let fileIndex = tracks.length + uploadings.length + i + 1;

      let fileDlg = filepicker.store(attachFile,
        (file) => {
          this.onDropSuccess(fileIndex, file);
        },
        (FPError) => {
          console.log(FPError);
          $(".alert.alert-danger", "#alert-box").html("Sorry, something went wrong. Please try again in a little bit.");
        },
        (progress) => {
          this.onDropProgress(fileIndex, attachFile, progress, fileDlg);
        }
      );
    });

    return false;
  }

  onDropSuccess(fileIndex, file) {
    const { uploadings, projectId } = this.state;
    const { dispatch } = this.props;
    const trackFile = Object.assign({}, file, {uploadId: fileIndex});
    const index = getArrayIndex(trackFile.uploadId, uploadings, 'uploadId');

    if (index !== -1) {
      if(this.checkRemoveUploading(fileIndex)) {
        uploadings[index].file = trackFile;
        if(index == 0 || (index > 0 && uploadings[index - 1].done === true)) {
          for(let i=index; i<uploadings.length; i++) {
            if(uploadings[i].file) {
              dispatch(actions.createTrack(projectId, uploadings[i].file));
              uploadings[i].done = true;
            }
            else {
              break;
            }
          }
        }

        dispatch(actions.setUploadings(projectId, uploadings));
      }
    }
  }

  onDropProgress(fileIndex, attachFile, progress, fileDlg) {
    const { uploadings, projectId } = this.state;
    const { dispatch } = this.props;
    const index = getArrayIndex(fileIndex, uploadings, 'uploadId');

    if(progress > 0) {
      if (index == -1) {
        if(this.checkRemoveUploading(fileIndex)) {
          uploadings.push({
            projectId: projectId,
            uploadId: fileIndex,
            progress: progress,
            filename: attachFile.name,
            dialog: fileDlg,
            dropZone: true,
          });
        }
      }
      else {
        uploadings[index].progress = progress;
      }

      dispatch(actions.setUploadings(projectId, uploadings));
    }
    else {
      if (index !== -1) {
        uploadings.splice(index, 1);
        dispatch(actions.setUploadings(projectId, uploadings));
      }
    }
  }

  checkRemoveUploading(fileIndex) {
    const { projectId } = this.state;
    let removeUploadings = [];

    const removeString = cookie.load('project_' + projectId + '_removed_uploadings');
    if(removeString)
      removeUploadings = removeString.toString().split(',');

    return removeUploadings.indexOf(fileIndex) === -1;
  }

  checkPlanTracks() {
    const { userPlan, tracks, plans, dispatch } = this.props;

    if(!checkMaxProjectTracks(userPlan, plans, tracks.length)) {
      dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "max_project_tracks" }));
      return false;
    }
    return true;
  }

  closePurchasePopup() {
    const { dispatch } = this.props;

    this.setState({purchasePopup: false});
  }

  render() {
    const { dispatch, statusText, status, router, loading, userPlan, plans } = this.props;
    const { projectId, uploadings, editModal, editTrack, drag, tracks, playingTrack, allChecked } = this.state;

    let alert = null;
    let isLoading = false;

    if(status == 'saved') {
      // alert = <Alert success>{ statusText }</Alert>;
    }
    else if(status == 'failed') {
      alert = <Alert danger>{ statusText }</Alert>;
    }
    else if(status == 'saving') {
      alert = <Alert info>Saving a track, please wait...</Alert>;
    }
    else if(status == 'deleting') {
      alert = <Alert info>Deleting track(s), please wait...</Alert>;
    }
    else if (status == 'getting') {
      isLoading = true;
    }
    else if (status == 'got') {

    }

    // Get max file size allowed for user plan
    let maxUpload = parseInt(getQuotaValueByCode(getQuotas(userPlan, plans), 'audio_upload_data')) * 1024 * 1024;

    return (
      <div id='body' className="project-body">
        <ProjectHeader router={router} />

        <div className="body-sidebar__container">
          <div className="container__with-scroll">
            <div id="alert-box-project">
              <ProjectAlert />
            </div>

            <Row>
              <Col sm={8} >
                <h3 className="mt0">Audio Manager</h3>
              </Col>
              <Col sm={4} className="mt2 text-right">
                <span className="mr2">Bulk Actions: </span>
                <select className="status-filter" ref="actions">
                  <option key={0} value=""> ---- ---- </option>
                  <option key={1} value="Delete">Delete</option>
                </select>
                <Button className="btn-hollow btn-sq btn-filter" onClick={::this.goAction}>Go</Button>
              </Col>
            </Row>
            <hr className="mt0 separator" />

            <div id="alert-box">
              { alert }
            </div>

            <table className="table track-listing">
              <thead>
                { isLoading ?
                    <tr><td colSpan={7} className="text-center"><div className="loading"></div></td></tr>
                    :
                    (tracks.length || uploadings.length) ?
                      <tr>
                        <td className="text-center"><input type="checkbox" onClick={::this.checkAll} checked={allChecked}/></td>
                        <td className="text-center">&nbsp;</td>
                        <td className="text-center">#</td>
                        <td>Title</td>
                        <td>Artist / Subtitle</td>
                        <td className="text-center">Duration</td>
                        <td className="text-center">&nbsp;</td>
                      </tr>
                      :
                      <tr><td colSpan={7} className="text-danger text-center">No tracks were found.</td></tr>
                }
              </thead>
              <tbody>
                {(!isLoading && tracks.length) ?
                      tracks.map((track, i) => {
                        let playing = playingTrack && playingTrack.id == track.id ? true: false;

                        return <TrackItem key={i} index={i} id={track.id} track={track} projectId={projectId} drag={drag}
                           dispatch={dispatch} editor={() => this.editTrack(track)}
                           moveTrack={::this.moveTrack} endDrop={::this.endDrop}
                           enableDrag={::this.enableDrag} disableDrag={::this.disableDrag}
                           sendPlaying={::this.setPlaying} playing={playing}
                           allChecked={allChecked} checkItem={(checked, id) => this.checkItem(checked, id)}
                        />;
                      })
                    : null
                }
                { uploadings.map((file, i) =>
                    <TrackUploading key={i} rowIndex={tracks.length + i} file={file} projectId={projectId} dispatch={dispatch} />
                )}
              </tbody>
            </table>

            <TrackEdit modal={ editModal } track={ editTrack } dispatch={dispatch} closer={::this.closeEditTrackModal} />

            <p className="mini-text text-center">
              <strong>IMPORTANT:</strong> By uploading anything to ArtTracks, you hereby certify that you own the
              <br/>copyrights in or have all the necessary rights related to such content to upload it.
            </p>
          </div>

          <div className="body-sidebar__element">
            <Dropzone onDrop={::this.onDrop} accept="audio/*" activeClassName="active-dropzone" className="default-dropzone">
              <span className="huge rubix-icon icon-outlined-cloud-upload"></span>
            </Dropzone>

            <div className="helper-text">
              <FileSizeMessage message="Maximum upload file size:" bytes={maxUpload}></FileSizeMessage>
            </div>

            <Button lg bsStyle='primary' className="btn-text-large btn-block"
              onClick={::this.uploadFile}>Add Tracks</Button><br/>
            <p className="text-center">Click the button to upload, import, or record one or more audio tracks.</p>
          </div>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  project: state.project.project,
  status: state.tracks.status,
  statusText: state.tracks.statusText,
  tracks: state.tracks.tracks,
  addedTrack: state.tracks.addedTrack,
  uploadings: state.tracks.uploadings,
  uploadId: state.tracks.uploadId,
  removedTrackIds: state.tracks.removedTrackIds,
  loading: state.loading,
  userPlan: state.profile.userPlan,
  plans: state.plan.plans,
});

export default DragDropContext(HTML5Backend)(connect(mapStateToProps)(ReactTimeout(ProjectTracks)));
