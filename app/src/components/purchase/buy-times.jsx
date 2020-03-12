import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import InlineSVG from 'svg-inline-react';
import cx from 'classnames';
import R from 'ramda';
import {
  Modal,
  Row,
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Icon,
  Alert,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import { getTimeFromSeconds } from '../../utils';
import { TIMES_COST_STANDARD, TIMES_COST_MULTIPLIER, TIMES_COST_DISCOUNT_FACTOR, TIMES_COST_LOWEST_DISCOUNT } from '../../constants';
import SelectedTimes from './selected-times.jsx';

class BuyTimes extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      error: false,
    };
  }

  addHours(h, discountRate, totalPrice) {
    const { times, timeTotal } = this.props;
    if(times.count + h * 3600 >= 0) {
      let timesUpdate = {
        count: times.count + h * 3600,
        discountRate: discountRate,
        totalPrice: totalPrice,
      }
      this.props.setVideoTimes(timesUpdate, timeTotal);
    }
  }

  addMinutes(m, discountRate, totalPrice) {
    const { times, timeTotal } = this.props;
    if(times.count + m * 60 >= 0) {
      let timesUpdate = {
        count: times.count + m * 60,
        discountRate: discountRate,
        totalPrice: totalPrice,
      }
      this.props.setVideoTimes(timesUpdate, timeTotal);
    }
  }

  addSeconds(s, discountRate, totalPrice) {
    const { times, timeTotal } = this.props;
    if(times.count + s >= 0) {
      let timesUpdate = {
        count: times.count + s,
        discountRate: discountRate,
        totalPrice: totalPrice,
      }
      this.props.setVideoTimes(timesUpdate, timeTotal);
    }
  }

  onOpen() {
  }

  onClose() {
    this.props.setVideoTimes({
      count: 0,
      discountRate: TIMES_COST_STANDARD,
      totalPrice: 0.00,
    }, 0);
    this.props.close();
  }

  onNext(e) {
    e.preventDefault();
    const { times } = this.props;

    this.props.showBillingInfo();
  }

  render() {
    const { show, close, times } = this.props;
    const { h, m, s } = getTimeFromSeconds(times.count);

    // Disable submit button if minimum amount of time not selected
    let disable = times.count < 300;

    // Set discount savings percentage
    const discountPerc = (1 - (times.discountRate/TIMES_COST_STANDARD)) * 100;

    return (
      <Modal className="billing-info-popup" show={show} onHide={::this.onClose} onEntering={::this.onOpen}>
        <Modal.Header closeButton>
          <Modal.Title>Buy more video time</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          {alert}
          <Row>
            <Col sm={7} className="billing-form">
              <p>Set how much time you would like by changing the hours and minutes or click on the time pack presets below. Stock up on video time and save up to 75% off!</p>
              <div className="video-times">
                <div className="countbox">
                  <p>Set Hours</p>
                  <div className="countvalue">
                    <strong>{sprintf('%02d', h)}</strong>
                    <div className="counter">
                      <a className="count-up"><Icon bundle='fontello' glyph="angle-up" onClick={() => this.addHours(1, times.discountRate, times.totalPrice)}/></a>
                      <a className="count-down"><Icon bundle='fontello' glyph="angle-down" onClick={() => this.addHours(-1, times.discountRate, times.totalPrice)}/></a>
                    </div>
                  </div>
                </div>
                <div className="divider"><span>:</span></div>
                <div className="countbox">
                  <p>Set Minutes</p>
                  <div className="countvalue">
                    <strong>{sprintf('%02d', m)}</strong>
                    <div className="counter">
                      <a className="count-up"><Icon bundle='fontello' glyph="angle-up" onClick={() => this.addMinutes(1, times.discountRate, times.totalPrice)}/></a>
                      <a className="count-down"><Icon bundle='fontello' glyph="angle-down" onClick={() => this.addMinutes(-1, times.discountRate, times.totalPrice)}/></a>
                    </div>
                  </div>
                </div>
              </div>
              <div>
                <Row>
                  <Col sm={6}>
                    <Row>
                      <Col sm={12}>
                        <div className="time-actions">
                          <Row>
                            <Col sm={12}>
                              <h4>Use Time Packs</h4>
                            </Col>
                          </Row>
                          <Button lg type='button' className="btn-sq btn-hollow" onClick={() => this.addMinutes(5, times.discountRate, times.totalPrice)}>+ 5 mins.</Button>
                          <Button lg type='button' className="btn-sq btn-hollow" onClick={() => this.addMinutes(10, times.discountRate, times.totalPrice)}>+ 10 mins.</Button>
                          <Button lg type='button' className="btn-sq btn-hollow" onClick={() => this.addMinutes(30, times.discountRate, times.totalPrice)}>+ 30 mins.</Button>
                          <Button lg type='button' className="btn-sq btn-hollow" onClick={() => this.addMinutes(60, times.discountRate, times.totalPrice)}>+ 60 mins.</Button>
                          <Button lg type='button' className="btn-sq btn-hollow" onClick={() => this.addHours(5, times.discountRate, times.totalPrice)}>+ 5 hours</Button>
                          <Button lg type='button' className="btn-sq btn-hollow" onClick={() => this.addHours(10, times.discountRate, times.totalPrice)}>+ 10 hours</Button>
                        </div>
                      </Col>
                    </Row>
                  </Col>
                  <Col sm={6} style={{'padding': 0}}>
                    <div className="time-cost">
                      <Row>
                        <Col sm={12}>
                          <h4>View Pricing</h4>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12}>
                          <div className="time-rate">
                            <p className="time-rate-header">Standard Rate</p>
                            <span className="time-rate-standard">${TIMES_COST_STANDARD} per second</span>
                          </div>
                        </Col>
                      </Row>
                      <Row>
                        <Col sm={12}>
                          <div className="time-rate">
                            <p className="time-rate-header-you"><strong>Your Rate</strong></p>
                            <span>${times.discountRate.toFixed(4)} per second{ discountPerc ? <span className="time-rate-discount"> <strong>({discountPerc.toFixed()}% Off)</strong></span>:<span></span>}</span>
                          </div>
                        </Col>
                      </Row>
                    </div>
                  </Col>
                </Row>
              </div>
              {status == 'loading'? <div className="form-overlay"></div>: null}
            </Col>
            <Col sm={5} className="bg-grey">
              <SelectedTimes />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button lg type='button' className="btn-sq btn-hollow btn-cancel pull-left" onClick={::this.onClose}>Cancel</Button>
          <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={::this.onNext} disabled={disable}>
            Buy {times.count.toLocaleString('en')} seconds - ${times.totalPrice.toFixed(2)}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.profile.status,
  statusText: state.profile.statusText,
  times: state.buy.times,
  timeTotal: state.profile.time_total,
});

const mapDispatchToProps = (dispatch) => ({
  setVideoTimes: (times, oldTimes) => {
    dispatch(actions.setVideoTimes(times, oldTimes));
  },
  showBillingInfo: () => {
    dispatch(actions.showPuchasePopup({section: 'billingInfo', rightSide: 'times'}));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(BuyTimes);
