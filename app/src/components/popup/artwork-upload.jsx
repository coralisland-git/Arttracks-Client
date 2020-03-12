import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import Dropzone from 'react-dropzone';
import FileSizeMessage from '../common/filesize-message.jsx';
import { getQuotas, getQuotaValueByCode, checkMaxImageUploadSize } from '../../services/plan-check';
import { FILEPICKER_KEY } from '../../constants';
import actions from '../../redux/actions';
import {
  Modal,
  Row,
  Col,
  Button,
  Alert,
} from '@sketchpixy/rubix';

const ratios = {
  horizontal: 16/9,
  square: 1,
  vertical: 9/16
};

class ArtworkUpload extends React.Component {
  constructor(...args) {
    super(...args);

    const projectId = this.props.params.projectId ? this.props.params.projectId : null;
    this.state = {
      projectId: projectId,
      crop_aspect_ratio: 16/9,
    }
  }

  componentWillMount() {
    const { dispatch, router, project, setting } = this.props;

    if(!(setting && setting.shape)) {
      router.push(`/project/${this.state.projectId}/artwork/shape`);
    }
    else if(this.state.projectId && (!project || this.state.projectId != project.id)) {
      dispatch(actions.getProject(this.state.projectId));
    }
  }

  componentDidMount() {
    const filepicker = require('filepicker-js');
    filepicker.setKey(FILEPICKER_KEY);
    const { setting, templates } = this.props;

    // Get data for user's selected template
    for (var i = 0; i < templates.length; i++) {
      if (templates[i].id == setting.template) {
        // Load template JSON
        const template_data = JSON.parse(templates[i].template).length ? JSON.parse(templates[i].template)[0]: {};
        if(template_data) {
          // Get 'main_artwork' template position data
          for (var t = 0; t < template_data.positions.length; t++) {
            if (template_data.positions[t].slug == "main_artwork") {
              let presets = template_data.positions[t].presets;
              let width = presets.width;
              let height = presets.height;
              let crop_aspect_ratio = width/height;

              this.setState({ crop_aspect_ratio: crop_aspect_ratio });
            }
          }
        }
      }
    }
  }

  componentWillReceiveProps (nextProps) {
    const { router } = this.props;
    const { project, status } = nextProps;

    if (status == "saved") {
      router.push(`/project/${project.id}`);
    }
  }

  uploadFile(e) {
    e.preventDefault();
    $(".alert", "#alert-box").remove();

    const { project, setting, dispatch, router, crop, userPlan, plans } = this.props;
    const { crop_aspect_ratio } = this.state;

    //const ratio = ratios[setting.shape];
    const ratio = crop_aspect_ratio;
    let maxSize = getQuotaValueByCode(getQuotas(userPlan, plans), 'image_upload_data');

    filepicker.pick({
      extensions: ['.png', '.jpg', '.jpeg', '.gif'],
      container: 'modal',
      openTo: 'COMPUTER',
      maxSize: maxSize * 1024 * 1024,
      cropRatio: ratio,
      conversions: ['crop']
    }, function (FPFile) {
      console.log('FPFile', FPFile);
      if(!checkMaxImageUploadSize(userPlan, plans, FPFile.size)) {
        dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "image_upload_data" }));
      }
      else {
        dispatch(actions.createArtwork(project.id, setting, FPFile));
        router.push(`/popup/loading?prev=/project/${project.id}`);
      }
    }, function (FPError) {
      console.log('FPError', FPError);
      $("#alert-box").append("<div class='alert alert-danger'>Sorry, something went wrong. Please try again in a little bit.</div>");
    });
  }

  skipUpload(e) {
    e.preventDefault();
    $(".alert", "#alert-box").addClass("hide");

    const { project, setting, dispatch } = this.props;

    dispatch(actions.createArtwork(project.id, setting, null));
  }

  onDrop(attachFiles) {
    $(".alert", "#alert-box").remove();

    if(attachFiles.length == 0)
      return false;

    const { project, setting, dispatch, router, userPlan, plans } = this.props;
    const { crop_aspect_ratio } = this.state;

    //const ratio = ratios[setting.shape];
    const ratio = crop_aspect_ratio;

    filepicker.store(attachFiles[0],
      function(Blob){
        filepicker.processImage(Blob, {
          cropRatio: ratio,
          conversions: ['crop']
        },
        function(FPFile){
          if(!checkMaxImageUploadSize(userPlan, plans, FPFile.size)) {
            dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "image_upload_data" }));
          }
          else {
            dispatch(actions.createArtwork(project.id, setting, FPFile));
            router.push(`/popup/loading?prev=/project/${project.id}`);
          }
        },
        function(FPError) {
          console.log('FPError', FPError);
          $("#alert-box").append("<div class='alert alert-danger'>Sorry, something went wrong. Please try again in a little bit.</div>");
        });
      },
      function(FPError) {
        console.log('FPError', FPError);
        $("#alert-box").append("<div class='alert alert-danger'>Sorry, something went wrong. Please try again in a little bit.</div>");
      }
    );

    return false;
  }

  render() {
    const { statusText, status, project, userPlan, plans } = this.props;

    var alert = null
    if(status == 'saved') {
      alert = <Alert success>{ statusText }</Alert>;
    }
    else if(status == 'failed') {
      alert = <Alert danger>{ statusText }</Alert>;
    }
    else if(status == 'saving') {
      alert = <Alert info>Saving, please wait...</Alert>;
    }

    // Get max file size allowed for user plan
    let maxUpload = parseInt(getQuotaValueByCode(getQuotas(userPlan, plans), 'image_upload_data')) * 1024 * 1024;

    return (
      <div className="modal-wrapper">
        <div className="closer"><Link to={`/project/${this.state.projectId}`}><span className="rubix-icon icon-fontello-cancel-5"></span></Link></div>
        <div className="back"><Link to={`/popup/layout`}>&larr; Back to layouts</Link></div>
        <div className="modal-content hollow">
          <Modal.Header className="text-center">
            <h1>Upload an image</h1>
            <h4>This is required to generate final artwork from your chosen layout.</h4>
          </Modal.Header>
          <Modal.Body className="text-center">
            <Dropzone onDrop={::this.onDrop} disableClick={true} multiple={false} maxSize={15 * 1024 * 1024} accept="image/*" activeClassName="active-dropzone" className="file-dropper">
              <span>Drop file here or</span>
              <Button lg bsStyle='primary' className="btn-sq" disabled={status == 'saving'} onClick={::this.uploadFile}>Choose a File</Button>
            </Dropzone>

            <div className="helper-text">
              <FileSizeMessage message="Maximum image upload file size:" bytes={maxUpload}></FileSizeMessage>
            </div>

            <div id="alert-box" className="text-left">
              { alert }
            </div>

          </Modal.Body>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  statusText: state.artwork.statusText,
  status: state.artwork.status,
  setting: state.artwork.setting,
  project: state.project.project,
  templates: state.artwork.templates,
  userPlan: state.profile.userPlan,
  plans: state.plan.plans,
});

export default connect(mapStateToProps)(ArtworkUpload);
