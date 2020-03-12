import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import LogLifecycle from 'react-log-lifecycle';
import Pusher from 'react-pusher';

import actions from '../../redux/actions';
import { getArrayIndex } from '../../utils';

import {
  Row,
  Button,
  Col,
  Alert,
  DropdownButton,
  MenuItem,
  Modal,
} from '@sketchpixy/rubix';

import ProjectHeader from './project-header.jsx';
import ProjectAlert from './project-alert.jsx';
import VideoPlayer from '../common/video-player.jsx';
import BuildItem from './build-item.jsx';
import BuildsRightPanel from './builds-right-panel.jsx';

const flags = {
  // If logType is set to keys then the props of the object being logged
  // will be written out instead of the whole object. Remove logType or
  // set it to anything except keys to have the full object logged.
  logType: 'keys',
  // A list of the param "types" to be logged.
  // The example below has all the types.
  names: ['props', 'nextProps', 'nextState', 'prevProps', 'prevState']
};

class ProjectBuilds extends LogLifecycle {
  constructor(...args) {
    super(...args, flags);

    const projectId = this.props.params.projectId ? this.props.params.projectId : null;
    const filters = ['All', 'Pending', 'Queued', 'Processing', 'Building', 'Encoding', 'Complete', 'Failed', 'Locked'];
    this.state = { projectId: projectId, selectedFilter: 'all', filters: filters, loading: true, showModal: false, nowPlaying: null, allChecked: false, builds:[] };
    this.checkedIds = [];
  }

  componentWillMount() {
    const { dispatch, project, status } = this.props;

    if(this.state.projectId && (!project || this.state.projectId != project.id)) {
      dispatch(actions.getProject(this.state.projectId));
    }

    if(this.state.projectId) {
      dispatch(actions.getBuilds(this.state.projectId));
      dispatch(actions.getArtworks(this.state.projectId));
      dispatch(actions.getTracks(this.state.projectId));
    }

    dispatch(actions.getProviders());
    dispatch(actions.getConnects());
  }

  componentWillReceiveProps (nextProps) {
    const { status, project, builds } = nextProps;
    if (project) {
      this.setState({ projectId: project.id });
    }
    if(status == 'got' || status == 'deleted' ) {
      this.setState({builds: builds});
    }
  }

  onPusher(build) {
    const { builds } = this.state;
    const index = getArrayIndex(build.id, builds);
    if(index !== -1)
      this.setState({ builds: [...builds.slice(0, index), build, ...builds.slice(index + 1)] });
  }

  getArtwork = (id) => {
    const { artworks } = this.props;
    let obj = null;

    artworks.forEach(function(artwork) {
      if(artwork.id == id)
        obj = artwork;
    });

    return obj;
  }

  getTrack = (id) => {
    const { tracks } = this.props;
    let obj = null;

    tracks.forEach(function(track) {
      if(track.id == id)
        obj = track;
    });

    return obj;
  }

  refreshBuilds = () => {
    const { dispatch } = this.props;
    if(this.state.projectId) {
      dispatch(actions.getBuilds(this.state.projectId));
    }
  }

  changeFilter() {
    this.setState({ selectedFilter: this.refs.filters.value});
  }

  close() {
    this.setState({ showModal: false });
  }

  onPlayClick = (build) => {
    this.setState({ showModal: true, nowPlaying: build });
  }

  checkAll(e) {
    this.setState({allChecked: e.target.checked});
  }

  checkItem(checked, id) {
    const index = this.checkedIds.indexOf(id);

    if(checked) {
      if(index === -1) {
        this.checkedIds.push(id);
      }
    }
    else {
      if(index !== -1) {
        this.checkedIds.splice(index, 1);
      }
    }
  }

  goAction() {
    const { dispatch, project } = this.props;

    if(this.refs.actions.value == 'Delete') {
      if (this.checkedIds.length) {
        dispatch(actions.deleteBuilds(project.id, this.checkedIds));
      }
    }
  }

  getBuildItems() {
    const { selectedFilter, builds, projectId, allChecked } = this.state;

    return builds.map((build, i) => {
      if(selectedFilter == 'all' || selectedFilter == build.status) {
        const artwork = this.getArtwork(build.artwork);
        const track = this.getTrack(build.track);
        return <BuildItem key={build.id} {...this.props}
                build={build} projectId={projectId} artwork={artwork} track={track}
                onPlayClick={this.onPlayClick} allChecked={allChecked} checkItem={(checked, id) => this.checkItem(checked, id)} />
      }
      else
        return null;
    });
  }

  render() {
    const { status, statusText, router, dispatch, loading } = this.props;
    const { selectedFilter, builds, filters, projectId, nowPlaying, allChecked } = this.state;

    let alert = null;
    let isLoading = false;
    let refresher = null;

    if(status == 'deleting') {
      alert = <Alert info>Deleting, please wait...</Alert>;
    } else if (status == 'getting') {
      isLoading = true;
    } else if (status == 'got') {

    }

    if(isLoading) {
      refresher = <button className="btn-link">...</button>;
    } else {
      refresher = <button onClick={::this.refreshBuilds} className="btn-link">Refresh</button>;
    }

    // Set up video player stuff
    let video_player = null;
    let video_track = null;
    let video_artwork = null;
    let video_poster = null;
    let video_title = null;
    let video_artist = null;
    let video_duration = null;

    if(nowPlaying) {
      video_track = this.getTrack(nowPlaying.track);
      video_artwork = this.getArtwork(nowPlaying.artwork);
      video_poster = video_artwork.thumbnail.replace("http:", "https:");
      // TODO: Determine aspect ratio from artwork shape
      video_player = <VideoPlayer nowPlaying={nowPlaying} poster={video_poster} />;

      if(video_track) {
        const video_metadata = JSON.parse(video_track.metadata).length ? JSON.parse(video_track.metadata)[0]: {};
        video_duration = video_metadata.duration ? video_metadata.duration: '00:00';
        video_title = video_track.title ? video_track.title: 'Untitled';
        video_artist = video_track.subtitle ? video_track.subtitle: 'Unknown Artist';
      }
    }

    return (
      <div id='body' className="project-body builds">
        <ProjectHeader router={ router } />

        <div className="body-sidebar__container">
          <div className="container__with-scroll">

            <Row>
              <Col sm={4}>
                <h3 className="mt0">Video Builds</h3>
              </Col>

              <Col sm={4} className="mt2 text-right">
                <span className="mr2">Bulk Actions: </span>
                <select className="status-filter" ref="actions">
                  <option key={0} value=""> ------------ </option>
                  <option key={1} value="Delete">Delete</option>
                </select>
                <Button className="btn-hollow btn-sq btn-filter" onClick={::this.goAction}>Go</Button>
              </Col>
              <Col sm={4} className="mt2 text-right">
                <span className="mr2">Show: </span>
                <select className="status-filter" ref="filters" onChange={::this.changeFilter}>
                  { filters.map((filter, i) => { return <option key={i} value={filter.toLowerCase()}>{filter}</option> }) }
                </select>
                <Button className="btn-hollow btn-sq btn-filter" onClick={::this.refreshBuilds}>Refresh</Button>
              </Col>
            </Row>

            <hr className="mt0 separator" />

            <div id="alert-box">
              { alert }
            </div>

            { isLoading ?
                <Row>
                  <Col sm={12} className="text-center"><div className="loading"></div></Col>
                </Row>
              :
                (builds.length ?
                  <Row>
                    <Col sm={1} className="cell-header"><input type="checkbox" onClick={::this.checkAll} checked={allChecked}/></Col>
                    <Col sm={5} className="cell-header">Video Job</Col>
                    <Col sm={2} className="cell-header text-center">Status</Col>
                    <Col sm={4} className="cell-header text-center">Actions</Col>
                  </Row>
                :
                  <Row>
                    <Col sm={12} className="text-center text-danger zero-res">No video builds were found.</Col>
                  </Row>
                )
            }

            { !isLoading? this.getBuildItems(): null }

          </div>

          <Pusher channel="notifications" event="update-build-status" onUpdate={::this.onPusher} />

          <BuildsRightPanel />
        </div>

        <Modal id="build-modal" show={this.state.showModal} onHide={::this.close}>
          <Modal.Header closeButton>
            <Modal.Title>{video_title}</Modal.Title>
          </Modal.Header>

          <Modal.Body>
            {video_player}
          </Modal.Body>

          <Modal.Footer>
            <Button onClick={::this.close} className="btn-hollow btn-sq">Close</Button>
          </Modal.Footer>
        </Modal>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.build.status,
  statusText: state.build.statusText,
  project: state.project.project,
  builds: state.build.builds,
  loading: state.loading,
  tracks: state.tracks.tracks,
  artworks: state.artwork.artworks,
  providers: state.provider.providers,
  connects: state.provider.connects,
  connectedUser: state.provider.connectedUser
});

export default connect(mapStateToProps)(ProjectBuilds);
