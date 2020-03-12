import React from 'react';
import InlineSVG from 'svg-inline-react';
import { connect } from 'react-redux';
import {
  Modal,
  Button,
  Alert,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import { IconCheck } from '../common/svg-icon.jsx';
import { getTimeFromSeconds } from '../../utils';
import { TIMES_COST_STANDARD } from '../../constants';

class PaymentSuccess extends React.Component {
  componentDidMount() {
    
  }

  componentWillUnmount() {
    const { dispatch } = this.props;

    dispatch(actions.selectCredits([], 0));
    dispatch(actions.setVideoTimes({
      count: 0,
      discountRate: TIMES_COST_STANDARD,
      totalPrice: 0.00,
    }, 0));
  }

  render() {
    const { show, close, userPlan, selectedPlan, rightSide, credits, times } = this.props;
    const currentTimes = getTimeFromSeconds(times.oldTimes);
    const totalTimes = getTimeFromSeconds(times.oldTimes + times.count);

    return (
      <Modal className="purchase-popup" show={show} onHide={close}>
        <Modal.Header closeButton>
          <Modal.Title className="text-center">
          { rightSide == 'credits'?
              'Credits successfully deposited!':
              rightSide == 'times'?
                'Video time successfully deposited!':
                'Account successfully upgraded!'
          }
          </Modal.Title>
        </Modal.Header>
        <Modal.Body className="upgraded">
          <IconCheck />
          { rightSide == 'credits'?
              <p>Your account credits balance has successfully been updated from
                <b> {credits.oldCredits} credits</b> to new balance of
                <b> {credits.oldCredits + credits.count} credits</b>. Enjoy!
              </p>:
              rightSide == 'times'?
                <p>Your account video time balance has successfully been updated from
                  <b> {sprintf('%02d:%02d:%02d', currentTimes.h, currentTimes.m, currentTimes.s)}</b> to the new balance of
                  <b> {sprintf('%02d:%02d:%02d', totalTimes.h, totalTimes.m, totalTimes.s)}</b>. It can take up to a couple of minutes for your account to reflect this change. Enjoy!
                </p>:
                <p>Your account has successfully been upgraded from the {userPlan.name} Plan to the {selectedPlan.name} Plan. You can now do so much more! It can take up to a couple of minutes for your account to reflect this change.</p>
          }
          <div className="actions">
            <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={close}>Continue</Button>
          </div>
        </Modal.Body>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  credits: state.buy.credits,
  times: state.buy.times,
});

export default connect(mapStateToProps)(PaymentSuccess);
