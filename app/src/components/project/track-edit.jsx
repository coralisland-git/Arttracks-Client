import React from 'react';
import ReactDOM from 'react-dom';
import actions from '../../redux/actions';
import {
    Modal,
    Form,
    FormGroup,
    FormControl,
    Button,
} from '@sketchpixy/rubix';

export default class TrackEdit extends React.Component {
  onOpen () {
    let { track } = this.props;
    if(track) {
      const metadata = JSON.parse(track.metadata).length ? JSON.parse(track.metadata)[0]: {};
      const title = track.title ? track.title : '';
      const artist = track.subtitle ? track.subtitle : '';
      $("#trackTitle").val(title);
      $("#trackArtist").val(artist);
    }
  }

  submit(e) {
    e.preventDefault();

    const { track, dispatch, closer } = this.props;
    let trackTitle = ReactDOM.findDOMNode(this.trackTitle).value;
    let trackArtist = ReactDOM.findDOMNode(this.trackArtist).value;

    track.title = trackTitle;
    track.subtitle = trackArtist;

    dispatch(actions.editTrack(track));

    closer();
  }

  render() {
    const { modal, closer } = this.props;

    return (
      <Modal show={modal} onHide={closer} onEntering={::this.onOpen}>
        <Modal.Header closeButton>
          <Modal.Title>Edit Track Title & Artist</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form onSubmit={::this.submit}>
            <FormGroup className="text-center" controlId="trackTitle">
              <FormControl type='text' id="trackTitle" ref={(trackTitle) => this.trackTitle = trackTitle} autoFocus placeholder="Title"/>
            </FormGroup>
            <FormGroup className="text-center" controlId="trackArtist">
              <FormControl type='text' id="trackArtist" ref={(trackArtist) => this.trackArtist = trackArtist} placeholder="Artist"/>
            </FormGroup>
            <hr className="transparent" />
            <FormGroup>
              <Button lg type='submit' bsStyle='primary' disabled={status == 'saving'} className="btn-block">Save</Button>
            </FormGroup>
          </Form>
        </Modal.Body>
      </Modal>
    );
  }
}