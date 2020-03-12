import R from 'ramda';
import cx from 'classnames';
import { sprintf } from 'sprintf-js';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import InlineSVG from 'svg-inline-react';
import { Row, Col, Icon } from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import { TIMES_COST_STANDARD } from '../../constants';
import { getTimeFromSeconds } from '../../utils';

class SelectedTimes extends React.Component {

  render() {
    const { timeTotal, times } = this.props;
    const currentTimes = getTimeFromSeconds(timeTotal);
    const totalTimes = getTimeFromSeconds(timeTotal + times.count);
    const totalDiscount = (times.count * TIMES_COST_STANDARD) - times.totalPrice;
    const totalSeconds = times.count.toLocaleString('en');
    let discountText = "";
    if(totalDiscount) {
      discountText = <span className="h5 text-attention ml2">You save: ${totalDiscount.toFixed(2)} USD</span>
    }

    return (
      <div className="selected-credit">
        <strong>You have selected:</strong>
        <h3 className="mt3">{totalSeconds} seconds</h3>
        <p>@ ${times.discountRate.toFixed(4)} per second</p>
        <p>Pay-as-you-go video time is used to convert seconds of audio into seconds of video.</p>
        <hr className="mt2 mb3"/>
        <Row>
          <Col sm={6}>
            Current balance: <h5 className="mt1 mb1">
              {sprintf('%02d:%02d:%02d', currentTimes.h, currentTimes.m, currentTimes.s)}
            </h5>
          </Col>
          <Col sm={6}>
            New balance: <h5 className="mt1 mb1">
              {sprintf('%02d:%02d:%02d', totalTimes.h, totalTimes.m, totalTimes.s)}
            </h5>
          </Col>
        </Row>
        <hr className="mt2 mb2"/>
        <p className="h3">${times.totalPrice.toFixed(2)} USD
          {discountText}
        </p>
        <p className="small">* Pay-as-you-go video time will expire exactly one year from purchase. Because different folks have different budgets, we allow you to buy time in bulk, at a discount, in order for you to ultimately control what your cost per video is.</p>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  times: state.buy.times,
  timeTotal: state.profile.time_total,
});

export default connect(mapStateToProps)(SelectedTimes);
