import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import cookie from 'react-cookie';
import R from 'ramda';
import InlineSVG from 'svg-inline-react';
import actions from '../../redux/actions';
import classNames from 'classnames';
import youtube_categories from './youtube-categories';
import stopwords from './stopwords';

import { getArrayIndex, getProviderById, metamasher } from '../../utils';

import {
  Modal,
  Row,
  Col,
  Form,
  FormGroup,
  FormControl,
  Checkbox,
  Radio,
  ControlLabel,
  HelpBlock,
  Button,
  Alert,
} from '@sketchpixy/rubix';
import ButtonLoader from '../common/button-loader.jsx';


class PreviewEdit extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      privacy: 'public',
      license: 'standard_youtube',
      status: null,
      errors: {},
    };
  }

  componentWillReceiveProps (nextProps) {
    const { status, saveOnly, buildId, accountId } = nextProps;
    const { build, selectedAccount, close, onUpdateSection } = this.props;

    if(buildId == build.id && accountId == selectedAccount.id) {
      if(status == 'publishing') {
        const status2 = saveOnly? 'saving': 'publishing';
        this.setState({status: status2});
      }
      else if(status == 'failed') {
        this.setState({status: status});
      }
      else if(status == 'published') {
        if(saveOnly) {
          close();
        }
        else {
          onUpdateSection('publish');
        }
      }
    }
  }

  onOpen () {
    ReactDOM.findDOMNode(this.refs.videoTitle).value = '';
    ReactDOM.findDOMNode(this.refs.description).value = '';
    ReactDOM.findDOMNode(this.refs.tags).value = '';
    ReactDOM.findDOMNode(this.refs.category).value = '';
    this.setState({privacy: 'public', license: 'standard_youtube'});
  }

  handlePrivacy(e) {
    this.setState({privacy: e.currentTarget.value});
  }

  handleLicense(e) {
    this.setState({license: e.currentTarget.value});
  }

  handleVideoTitle(e) {
    if(e.currentTarget.value == "")
      this.setState({errors: {title: true}});
    else
      this.setState({errors: {title: false}});
      this.setState({[e.target.name]: e.target.value});
  }

  handleVideoTags(e) {
    this.setState({[e.target.name]: e.target.value});
  }

  getMetadata() {
    let { privacy, license } = this.state;

    let title = ReactDOM.findDOMNode(this.refs.videoTitle).value;
    let description = ReactDOM.findDOMNode(this.refs.description).value;
    let tags = ReactDOM.findDOMNode(this.refs.tags).value;
    let category = ReactDOM.findDOMNode(this.refs.category).value;
    let metadata = {title, description, tags, category, privacy, license};

    return metadata;
  }

  onPublish(e, saveOnly=false) {
    e.preventDefault();
    const { build, selectedAccount, dispatch } = this.props;
    const metadata = this.getMetadata();

    if(metadata.title && metadata.title != "")
      dispatch(actions.publishVideo(build, selectedAccount, metadata, saveOnly));
    else {
      this.setState({errors: {title: true}});
      ReactDOM.findDOMNode(this.refs.videoTitle).focus();
    }
  }

  render() {
    const { selectedAccount, build, track, open, close, providers, statusText, saveOnly } = this.props;
    const { status, privacy, license, errors } = this.state;

    let alert = null;
    if(status == 'failed') {
      alert = <Alert danger>{ statusText }</Alert>;
    }

    const title = track.title? track.title: 'Untitled';
    const artist = track.subtitle? track.subtitle: 'Unknown Artist';
    const provider = getProviderById(selectedAccount.provider, providers);
    const logoImg = provider && provider.icon ? provider.icon: '/imgs/blank.gif';
    const extraData = JSON.parse(selectedAccount.extra_data);
    const displayName = extraData.displayName? extraData.displayName: '';
    const username = extraData.username? '@' + extraData.username: '';
    const profilePhoto = extraData.photo? extraData.photo: '/imgs/avatars/no-avatar.png';
    const video_title = track.title + " - " + track.subtitle;
    const stopword_list = stopwords;
    var video_word_list = video_title.split(" ");
    video_word_list.forEach(function(word) {
      if (stopword_list.indexOf(word.toLowerCase()) > -1) {
        video_word_list.splice(video_word_list.indexOf(word), 1);
      }
    });
    const video_tags = video_word_list.toString();

    // Load categories and sort in alphabetical order
    const video_categories = youtube_categories.sort(function(a,b) {
      var keyA = a.title
      var keyB = b.title
      if(keyA < keyB) return -1;
      if(keyA > keyB) return 1;
      return 0;
    });

    return (
      <Modal className="pub-preview-popup" show={open} onHide={close} onEntering={::this.onOpen}>
        <Modal.Header closeButton>
          <Modal.Title>Publish Video</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col sm={5} className="bg-grey">
              <div className="preview">
                <video preload src={build.video_file} controls/>
                <div className="video-info">
                  <p className="title">{title}</p>
                  <p>{artist}</p>
                </div>
              </div>
              <div className="account">
                <Row>
                  <Col sm={2} smOffset={3}>
                    <div className="avatar">
                      <img src={ profilePhoto } />
                      <div className="provider-icon">
                        <img src={logoImg} />
                      </div>
                    </div>
                  </Col>
                  <Col sm={6}>
                    <p>{displayName}</p>
                    <p className="small">{extraData.provider}</p>
                  </Col>
                </Row>
              </div>
            </Col>
            <Col sm={7} className="metadata">
              <div id="alert-box">
                { alert }
              </div>
              <p>Please complete the form below before proceeding.</p>
              <Form>
                <Row>
                  <Col sm={6}>
                    <FormGroup controlId="video-title" className={classNames({'has-error': errors.title})}>
                      <ControlLabel>Video Title (required)</ControlLabel>
                      <FormControl type="text" ref="videoTitle" defaultValue={ video_title } onChange={(value) => this.handleVideoTitle(value)}/>
                    </FormGroup>
                    <FormGroup controlId="description">
                      <ControlLabel>Description (recommended)</ControlLabel>
                      <FormControl componentClass="textarea" ref="description" rows={4} placeholder="Add a short description to your video"/>
                    </FormGroup>
                    <FormGroup controlId="tags">
                      <ControlLabel>Tags (recommended)</ControlLabel>
                      <FormControl type="text" ref="tags" defaultValue={ video_tags } onChange={(value) => this.handleVideoTags(value)} />
                      <HelpBlock>Separate with commas, e.g. music, pop</HelpBlock>
                    </FormGroup>
                  </Col>
                  <Col sm={6}>
                    <FormGroup controlId="category">
                      <ControlLabel>Select a Category</ControlLabel>
                      <FormControl componentClass="select" ref="category">
                        { video_categories.map( cat => {
                          return (
                            <option key={cat.id} value={cat.id} >{cat.title}</option>
                          )
                        })}
                      </FormControl>
                    </FormGroup>
                    <FormGroup controlId="privacy">
                      <ControlLabel>Privacy</ControlLabel>
                      <Radio name="privacy" ref="privacy" value="public" checked={privacy=='public'} onChange={::this.handlePrivacy}>Public</Radio>
                      <Radio name="privacy" ref="privacy" value="private" checked={privacy=='private'} onChange={::this.handlePrivacy}>Private</Radio>
                      <Radio name="privacy" ref="privacy" value="unlisted" checked={privacy=='unlisted'} onChange={::this.handlePrivacy}>Unlisted</Radio>
                    </FormGroup>
                    <FormGroup controlId="license">
                      <ControlLabel>License</ControlLabel>
                      <Radio name="license" ref="license" value="standard_youtube" checked={license=='standard_youtube'} onChange={::this.handleLicense}>Standard Youtube License</Radio>
                      <Radio name="license" ref="license" value="commons_attribution" checked={license=='commons_attribution'} onChange={::this.handleLicense}>Create Commons Attribution License(reuse allowed)</Radio>
                    </FormGroup>
                  </Col>
                </Row>
              </Form>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button lg type='button' className="btn-sq btn-hollow btn-cancel pull-left" onClick={close} disabled={status == 'saving' || status == 'publishing'}>Cancel</Button>
          <Button lg type='button' bsStyle='primary' className="btn-sq btn-hollow btn-wider" onClick={(e) => this.onPublish(e, true)} disabled={status == 'publishing'}>
            {status == 'saving'? <ButtonLoader primary={false} />: <span>Save & Exit</span>}
          </Button>
          <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={(e) => this.onPublish(e)} disabled={status == 'saving'}>
            {status == 'publishing'? <ButtonLoader primary={true} />: <span>Publish</span>}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.publish.status,
  statusText: state.publish.statusText,
  buildId: state.publish.buildId,
  accountId: state.publish.accountId,
  pub: state.publish.pub,
  saveOnly: state.publish.saveOnly,
});

export default connect(mapStateToProps)(PreviewEdit);
