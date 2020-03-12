import React from 'react';
import { connect } from 'react-redux';
import ReactTimeout from 'react-timeout';
import { Modal } from '@sketchpixy/rubix';
import actions from '../../redux/actions';

class ProjectLoading extends React.Component {

  componentWillMount () {
    const {status, project, dispatch, location, router} = this.props;

    if(!project && !status) {
      if(location.query && location.query.prev) {
        router.push(location.query.prev);
      }
      else {
        router.push('/');
      }
    }
    else if (status == 'checking') {
      dispatch(actions.getArtworks(project.id));
      dispatch(actions.getTracks(project.id));
    }
  }

  componentWillReceiveProps (nextProps) {
    const {project, router, dispatch} = this.props;
    const prevStatus = this.props.status;
    const {status, trackStatus, tracks, artworkStatus, artworks} = nextProps;
    
    if(status == 'builtAll') {
      router.push(`/project/${project.id}/build-success`);
    }
    else if(prevStatus == 'processing' && status == 'failed') {
      router.push(`/project/${project.id}/build-order`);
    }
    else if(status == 'checked') {
      this.props.setTimeout(() => {
        router.push(`/project/${project.id}/build-order`);
      }, 3000);
    }
    else if(artworkStatus == 'saved') {
      router.push(`/project/${project.id}`);
    }
    else if(prevStatus == 'checking' && trackStatus == 'got') {
      if(tracks.length == 0) {
        router.push(`/project/${project.id}/audio`);
        dispatch(actions.failTracks("You need to add tracks to build video."));
        return;
      }
      else {
        const checked = tracks.every(track => track.audio_file);
        if(!checked) {
          router.push(`/project/${project.id}/audio`);
          dispatch(actions.failTracks("You need to add tracks with valid audio file to build video."));
          return;
        }
        else {
          tracks.forEach(track => {
            dispatch(actions.scanTrack(track));
          });
          return;
        }
      }
    }
    else if(prevStatus == 'checking' && artworkStatus == 'got' && trackStatus == 'scanned') {
      let checked = false;
      if(artworkStatus == 'got') {
        if(artworks.length == 0) {
          router.push('/project/' + project.id);
          dispatch(actions.failArtwork("You need to add artwork to build video."));
          return;
        }
        else {
          checked = artworks.every(artwork => artwork.thumbnail);
          if(!checked) {
            router.push('/project/' + project.id);
            dispatch(actions.failArtwork("You need to add artwork with valid thumbnail to build video."));
            return;
          }
        }
      }
      if(trackStatus == 'scanned') {
        checked = tracks.every(track => track.scanned);
        if(!checked) {
          router.push('/project/' + project.id + '/audio');
          dispatch(actions.failTracks("It has been failed to check track durations."));
          return;
        }
      }

      if(checked) {
        dispatch(actions.buildCheckSuccess());
      }
      else {
        router.push('/project/' + project.id);
        dispatch(actions.failArtwork("It has been failed to check build validation."));
      }
    }
  }

  render() {
    const { statusText, artworkStatus } = this.props;

    let loadingText = statusText;
    if(artworkStatus == 'saving')
      loadingText = 'Generating artwork...';

    return (
      <div className="modal-wrapper project-loading">
        <div className="modal-content wide hollow">
          <Modal.Body className="text-center">
            <div className="loading"></div>
            <h3>{ loadingText }</h3>
          </Modal.Body>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  statusText: state.build.statusText,
  status: state.build.status,
  project: state.project.project,
  trackStatus: state.tracks.status,
  tracks: state.tracks.tracks,
  artworkStatus: state.artwork.status,
  artworks: state.artwork.artworks,
});

export default connect(mapStateToProps)(ReactTimeout(ProjectLoading));
