import React from 'react';
import { connect } from 'react-redux';
import InlineSVG from 'svg-inline-react';
import {
  Modal,
  Row,
  Col,
  Button,
  Alert,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import Plan from './choose-plan-item.jsx';
import { IconLogoLarge } from '../common/svg-icon.jsx';

class ChoosePlan extends React.Component {
  handleClose() {
    const { router, dispatch, returnUrl } = this.props;

    dispatch(actions.closePuchasePopup());
    router.push(returnUrl);
  }

  render() {
    const { plans, status, userPlan } = this.props;

    return (
      <div className="modal-wrapper plan-modal-wrapper">
        <div className="closer"><a href="javascript:void(0)" onClick={::this.handleClose}><span className="rubix-icon icon-fontello-cancel-5"></span></a></div>
        <div className="modal-content">
          <Modal.Header className="text-center">
            <hr className="transparent" />
            <hr className="transparent" />
            <IconLogoLarge />
            <h1 className="page-title">Choose the perfect plan for you.</h1>
          </Modal.Header>
          <Modal.Body className="text-center">
            <Row>
              { plans && userPlan && plans.map((plan, i) => <Plan key={i} {...this.props} plan={plan} close={::this.handleClose} />) }
            </Row>
            <p>You can change or cancel your plan at any time.</p>
          </Modal.Body>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  plans: state.plan.plans,
  status: state.plan.status,
  userPlan: state.profile.userPlan,
  returnUrl: state.plan.returnUrl,
});

export default connect(mapStateToProps)(ChoosePlan);
