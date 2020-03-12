import React from 'react';
import InlineSVG from 'svg-inline-react';
import actions from '../../redux/actions';
import {
  Modal,
  Button,
  Alert,
} from '@sketchpixy/rubix';

class PlanUpgrade extends React.Component {

  handleViewOptions(e) {
    e.preventDefault();

    const { router, dispatch } = this.props;
    
    dispatch(actions.choosePlan({returnUrl: router.location.pathname}));
    router.push('purchase/choose-plan');
  }

  render() {
    const { show, close, quota } = this.props;
    let description = '';
    
    if(quota == 'max_projects')
      description = <p>You have exceeded the number of projects allowed for your plan. To add a new project, your account will need to be upgraded to a new plan.</p>;
    else if(quota == 'max_project_tracks')
      description = <p>You have exceeded the number of tracks allowed for your plan. To add a new track, your account will need to be upgraded to a new plan.</p>;
    else if(quota == 'max_project_artwork')
      description = <p>You have exceeded the number of artworks allowed for your plan. To add a new artwork, your account will need to be upgraded to a new plan.</p>;
    else if(quota == 'unbranded_videos')
      description = <p>To turn off the ArtTracks watermark and create unbranded videos, your account will need to be upgraded to a new plan.</p>;
    else if(quota == 'video_branding')
      description = <p>To create custom branded videos, your account will need to be upgraded to a new plan.</p>;
    else if(quota == 'audio_reactive_efx')
      description = <p>To use audio reactive video effects, your account will need to be upgraded to a new plan.</p>;
    else if(quota == 'image_upload_data')
      description = <p>You have reached the maximum size of image file. To upload large image, your account will need to be upgraded to a new plan.</p>;
    else if(quota == 'audio_upload_data')
      description = <p>You have reached the maximum size of audio file. To upload large audio file, your account will need to be upgraded to a new plan.</p>;
    else if(quota == 'max_connected_accounts')
      description = <p>You have exceeded the number of connected accounts allowed for your plan. To add a new social account, your account will need to be upgraded to a new plan.</p>;
    else if(quota == 'video_resolutions')
      description = <p>You have reached the maximum size of video resolution. To build video with higher resolution, your account will need to be upgraded to a new plan.</p>;
    
    return (
      <Modal className="purchase-popup" show={show} onHide={close}>
        <Modal.Header className="no-border" closeButton></Modal.Header>
        <Modal.Body className="text-center">
          <div className="time-to-upgrade">
            <h1 className="page-title">It's time to upgrade!</h1>
            { description }
          </div>
        </Modal.Body>
        <Modal.Footer className="text-center">
          <Button lg type='button' className="btn-sq btn-hollow btn-cancel" onClick={close}>No, thanks</Button>
          <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={::this.handleViewOptions}>View Options</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default PlanUpgrade;
