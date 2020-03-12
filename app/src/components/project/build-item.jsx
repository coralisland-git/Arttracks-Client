import React from 'react';
import filesize from 'filesize';
import download from 'downloadjs';
import sanitize from 'sanitize-filename';
import crypto from 'crypto';
import { Row, Col } from '@sketchpixy/rubix';
import { CRYPTO_DOWNLOAD_SECRET, CRYPTO_DOWNLOAD_ALGO } from '../../constants';

import actions from '../../redux/actions';
import PublishPopup from '../publish/publish-popup.jsx';

class BuildItem extends React.Component {
  constructor(props) {
    super(props);

    this.state = {checked: false, openPublish: false};
  }

  componentWillReceiveProps(nextProps) {
    const { allChecked, checkItem, build } = this.props;
    if(allChecked != nextProps.allChecked) {
      this.setState({checked: nextProps.allChecked});
      checkItem(nextProps.allChecked, build.id);
    }
  }

  removeBuild() {
    if(confirm("Are you sure you want to delete this video build job?")) {
      const { build, projectId, dispatch } = this.props;
      dispatch(actions.removeBuild(projectId, build.id));
    }
  }

  handleBuildPlay = () => {
    let { build } = this.props;
    this.props.onPlayClick(build);
  }

  check(e) {
    const { checkItem, build } = this.props;
    this.setState({checked: e.target.checked});
    checkItem(e.target.checked, build.id);
  }

  publish = () => {
    this.setState({openPublish: true});
  }

  download_video(url) {
    download(url, "video.mp4", "video/mp4");
  }

  generate_download_string(url, filename) {
    // Set secret key and algorithm
    var algorithm = CRYPTO_DOWNLOAD_ALGO;
    var secret = CRYPTO_DOWNLOAD_SECRET;

    // Create cipher
    var cipher = crypto.createCipher(algorithm, secret);

    // Sanitize filename string
    var filename = sanitize(filename).toLowerCase().replace(".", "_").replace(/,/g, "_").replace("(", "_").replace(")", "_").split(" ").join("_");

    // Finalize encrypted url
    var encrypted_url = cipher.update(url, 'utf8', 'hex');
    encrypted_url += cipher.final('hex');

    // Return final download string
    return encrypted_url + "/" + filename;
  }

  closePublishPopup() {
    const { dispatch } = this.props;

    this.setState({openPublish: false});
    dispatch(actions.resetPublish());
  }

  render() {
    const { build, track, artwork } = this.props;
    const thumbnail = artwork && artwork.thumbnail? <img src={artwork.thumbnail.replace("http:", "https:")} /> : <img src="/imgs/blank.gif" />;

    let title = '---- ----';
    let artist = '----';
    let duration = '00:00';

    if(track) {
      const metadata = JSON.parse(track.metadata).length ? JSON.parse(track.metadata)[0]: {};
      duration = metadata.duration? metadata.duration: '00:00';
      title = track.title? track.title: 'Untitled';
      artist = track.subtitle? track.subtitle: 'Unknown Artist';
    }

    let file_size = "----"

    if(build.file_size && build.file_size != "Unknown"){
      file_size = filesize(build.file_size)
    }

    var download_string
    if (build.status == "complete") {
      download_string = this.generate_download_string(build.video_file.replace("http:", "https:"), artist + '_' + title);
    }

    return (
      <Row>
        <Col sm={12}><hr className="mt3 mb3 separator" /></Col>
        <Col sm={6} className="artwork">
          <Row>
            <Col sm={1}><input type="checkbox" onClick={::this.check} checked={this.state.checked}/></Col>
            <Col md={5}>
              <div className="preview">
                {build.status == 'complete'? <a href="javascript:;" onClick={::this.handleBuildPlay}>{ thumbnail }</a>: <span>{ thumbnail }</span>}
                <span className="duration">{duration}</span>
              </div>
            </Col>
            <Col md={6}>
              <span className="track-title">{title}</span>
              <span className="artist">{artist}</span>
              <span className="property"><b>Resolution: </b>{build.size}</span>
              <span className="property"><b>File Size: </b>{file_size}</span>
            </Col>
          </Row>
        </Col>
        <Col sm={2} className="text-capitalize text-center"><span>{ build.status }</span></Col>
        <Col sm={4} className="actions text-center">
          {build.status == 'complete'? <a href="javascript:;" onClick={::this.handleBuildPlay}>Play</a>: <span>Play</span>}&nbsp;&nbsp;&nbsp;
          {build.status == 'complete'? <a href={`/download/${download_string}`}>Download</a>: <span>Download</span>}&nbsp;&nbsp;&nbsp;
          {/*{build.status == 'complete'? <a href={build.video_file.replace("http:", "https:")}>Download</a>: <span>Download</span>}&nbsp;&nbsp;&nbsp;*/}
          {build.status == 'complete'? <a href="javascript:;" onClick={::this.publish}>Publish</a>: <span>Publish</span>}&nbsp;&nbsp;&nbsp;
          <a href="javascript:;" onClick={::this.removeBuild}>Delete</a>

          <PublishPopup {...this.props} open={this.state.openPublish} closeModal={()=>this.closePublishPopup()} />
        </Col>
      </Row>
    );
  }
}

export default BuildItem;
