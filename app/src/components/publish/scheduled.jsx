import React from 'react';
import InlineSVG from 'svg-inline-react';

import {
  Modal,
  Button,
  Alert,
} from '@sketchpixy/rubix';
import { svgIconCheckSuccess } from '../common/svg-icon.jsx';

class Scheduled extends React.Component {

  render() {
    const { selectedAccount, open, close } = this.props;
    
    return (
      <Modal className="pub-account-popup" show={open} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title className="text-center">Scheduled for delivery!</Modal.Title>
        </Modal.Header>
        <Modal.Body style={{borderRadius: '0 0 6px 6px'}}>
          <div className="no-account scheduled">
            <InlineSVG src={svgIconCheckSuccess} />
            <p>Your video is scheduled for delivery. You will be notified once it has successfully completed.</p>
            <div className="actions">
              <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={close}>Continue</Button>
            </div>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

export default Scheduled;
