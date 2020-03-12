import moment from 'moment';
import { sprintf } from 'sprintf-js';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Row, Col, Button } from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import { getTimeFromSeconds } from '../../utils';

class VideoTimes extends React.Component {
  handleBuy(e) {
    e.preventDefault();
    this.props.showBuyTimes();
  }

  render() {
    const { h, m, s } = getTimeFromSeconds(this.props.timeTotal);

    return (
      <Col md={6}>
        <div className="white-block time-remaining">
          <h5 className="text-center">Your Video Time Balance</h5>
          <div className="times">
            <p className="numbers">
              { h > 0 ? <strong>{sprintf('%02d', h)}</strong>: null }
              { h > 0 ? <span>:</span>: null }
              { h > 0 || m > 0 ? <strong>{sprintf('%02d', m)}</strong>: null }
              { h > 0 || m > 0 ? <span>:</span>: null }
              <strong>{sprintf('%02d', s)}</strong>
            </p>
            <p className="texts">
              { h > 0 ? <span>hr</span>: null }
              { h > 0 || m > 0 ? <span>min</span>: null }
              <span>sec</span>
            </p>
          </div>
          <p><span className="small">Time is the currency needed to build video from your audio</span></p>
          <div className="flex-space"></div>
          <Button lg type='button' bsStyle='primary' className="btn-block btn-hollow" onClick={::this.handleBuy}>Buy More Time</Button>
        </div>
      </Col>
    );
  }
}

const mapStateToProps = (state) => ({
  timeTotal: state.profile.time_total,
});

const mapDispatchToProps = (dispatch) => ({
  showBuyTimes: () => {
    dispatch(actions.showPuchasePopup({section: 'buyTimes'}));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(VideoTimes);
