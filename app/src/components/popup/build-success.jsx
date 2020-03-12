import React from 'react';
import { connect } from 'react-redux';

import {
  Modal,
  Button,
} from '@sketchpixy/rubix';

class BuildSuccess extends React.Component {
  goToBuilds() {
    const { params, router } = this.props;
    router.push(`/project/${params.projectId}/builds`);
  }

  render() {
    return (
      <div className="modal-wrapper">
        <div className="modal-content hollow">
          <Modal.Header className="text-center">
            <img src="/imgs/icons/icon_success_2.svg" title="Success" alt="Success" className="icon-success" />
            <h1>Success! Your order is in.</h1>
            <h4>This process can take up to three hours, depending on how many folks are ahead of you in line. Once ready, we'll notifiy you by email and your videos will be immediately available for review, download, and distribution.</h4>
            <Button lg bsStyle='primary' className="btn-sq big-ok" onClick={::this.goToBuilds}>OK</Button>
          </Modal.Header>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  statusText: state.build.statusText,
  status: state.build.status,
  project: state.project.project,
});

export default connect(mapStateToProps)(BuildSuccess);
