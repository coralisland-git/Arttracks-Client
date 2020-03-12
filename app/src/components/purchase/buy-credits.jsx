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
import { IconCheck } from '../common/svg-icon.jsx';
import { CREDITS } from '../../constants';
import SelectedCredits from './selected-credits.jsx';

class BuyCredits extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
    };
  }

  handleSelect(credit) {
    const { selection, creditsTotal } = this.props;
    let index = R.findIndex(R.propEq('count', credit.count))(selection);

    if(index !== -1) {
      selection.splice(index, 1);
    }
    else {
      selection.push(credit);
    }

    this.props.selectCredits(selection, creditsTotal);
  }

  checkSelected(credit) {
    const { selection } = this.props;
    let index = R.findIndex(R.propEq('count', credit.count))(selection);

    return index !== -1
  }

  onOpen() {

  }

  onClose() {
    this.props.selectCredits([], 0);
    this.props.close();
  }

  onNext(e) {
    e.preventDefault();

    this.props.showBillingInfo();
  }

  render() {
    const { show, close, credits } = this.props;

    return (
      <Modal className="billing-info-popup" show={show} onHide={::this.onClose} onEntering={::this.onOpen}>
        <Modal.Header closeButton>
          <Modal.Title>Buy more credits</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col sm={7} className="billing-form">
              <p>Please select one of the packages below. Stock up on credits and save!</p>
              <Row>
                { CREDITS.map((credit, i) => (
                  <Col key={i} sm={4}>
                    <div className={cx("credit-count", {'selected': this.checkSelected(credit)})} onClick={() => this.handleSelect(credit)}>
                      <div className="balance">{credit.count}</div>
                      { credit.discount > 0 ? <b className="text-discount">{credit.discount}% off<br /></b>: null }
                      <span>${credit.price.toFixed(2)}/credit</span>
                      { this.checkSelected(credit)? <IconCheck fill={true}/>: null }
                    </div>
                  </Col>
                ))}
              </Row>
              {status == 'loading'? <div className="form-overlay"></div>: null}
            </Col>
            <Col sm={5} className="bg-grey">
              <SelectedCredits />
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button lg type='button' className="btn-sq btn-hollow btn-cancel pull-left" onClick={::this.onClose}>Cancel</Button>
          <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={::this.onNext} disabled={credits.count==0}>
            Buy {credits.count} credits - ${credits.price}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.profile.status,
  statusText: state.profile.statusText,
  selection: state.buy.selection,
  credits: state.buy.credits,
  creditsTotal: state.profile.credits_total,
});

const mapDispatchToProps = (dispatch) => ({
  selectCredits: (selection, creditsTotal) => {
    dispatch(actions.selectCredits(selection, creditsTotal));
  },
  showBillingInfo: () => {
    dispatch(actions.showPuchasePopup({section: 'billingInfo', rightSide: 'credits'}));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(BuyCredits);
