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

import VideoPlayer from '../common/video-player.jsx';

const sampleVideo = {
  id: 429,
  thumbnail: 'http://mp3vidi-staging.s3.amazonaws.com/663/projects/165/artwork/280/thumbnail-1498769005.01.gif',
  video_file: 'https://mp3vidi-staging.s3.amazonaws.com/663/projects/165/builds/429/video-1498770694.mp4',
};

class VideoModal extends React.Component {
  constructor(...args) {
    super(...args);
  }

  render() {
    return (
      <Modal id="build-modal" show={this.props.open} onHide={this.props.close}>
        <Modal.Header closeButton>
          <Modal.Title>Sample Video</Modal.Title>
        </Modal.Header>

        <Modal.Body>
          <VideoPlayer nowPlaying={sampleVideo} poster={sampleVideo.thumbnail} />
        </Modal.Body>

        <Modal.Footer>
          <Button onClick={this.props.close} className="btn-hollow btn-sq">Close</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default VideoModal;
