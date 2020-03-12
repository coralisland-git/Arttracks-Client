import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import cx from 'classnames';
import {
  Modal,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  HelpBlock,
  Button,
} from '@sketchpixy/rubix';
import ReactTimeout from 'react-timeout';
import { IconCheck } from '../common/svg-icon.jsx';
import actions from '../../redux/actions';
import ButtonLoader from '../common/button-loader.jsx';
import { MAX_VERIFY_COUNT } from '../../constants';
import { VerifyCounter } from '../../utils/verify-counter';

class Coupon extends React.Component {
  verifyCounter;

  constructor(...args) {
    super(...args);
    this.state = {
      error: false,
      errorMsg: null,
      empty: true,
      success: false,
      done: false,
    };
  }

  componentWillMount() {
    this.verifyCounter = VerifyCounter('coupon-code-checker');
  }

  componentWillReceiveProps (nextProps) {
    const { status, statusText } = nextProps;

    if(this.props.status == 'getting' && status == 'got') {
      this.setState({error: false, success: true});
      this.verifyCounter.clear();
      this.props.setTimeout(() => {
        this.setState({error: false, success: true, done: true});
      }, 1500);
    }
    else if(this.props.status == 'getting' && status == 'failed') {
      this.setState({error: true, errorMsg: statusText});
    }
  }

  onOpen () {
    if(ReactDOM.findDOMNode(this.refs.code))
      ReactDOM.findDOMNode(this.refs.code).value = '';

    this.setState({
      error: false,
      errorMsg: null,
      empty: true,
      success: false,
      done: false,
    })
  }

  sendCode(e) {
    e.preventDefault();

    this.setState({error: false});

    if(this.verifyCounter.check()) {
      let code = ReactDOM.findDOMNode(this.refs.code).value;
      if(code.trim() == '') {
        this.setState({error: true, errorMsg: 'Please input coupon code.'});
      }
      else {
        this.props.dispatch(actions.getCoupon(code));
      }

      this.verifyCounter.append();
    }
    else {
      this.setState({errText: "Sorry, you've reached the maximum number of tries. You can try again in 30 minutes."});
    }
  }

  handleEmpty(e) {
    let code = ReactDOM.findDOMNode(this.refs.code).value;
    if(code.trim() == '') {
      this.setState({empty: true});
    }
    else {
      this.setState({empty: false});
    }
  }

  render() {
    const { status, show, close } = this.props;
    const { error, errorMsg, empty, success, done } = this.state;
    const verifyCount = this.verifyCounter.count();

    if(success && done) {
      return (
        <Modal className="coupon-popup" show={show} onHide={close} onEntering={::this.onOpen}>
          <Modal.Header closeButton>
            <Modal.Title className="text-center">Coupon successfully redeemed!</Modal.Title>
          </Modal.Header>
          <Modal.Body className="text-center pt5">
            <IconCheck />
            <p className="mt5">Your account has successfully been updated. Enjoy!</p>
            <div className="actions mt5 mb4">
              <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={close}>OK</Button>
            </div>
          </Modal.Body>
        </Modal>
      );
    }
    else if(success) {
      return (
        <Modal className="checking-modal" show={true} onHide={close} onEntering={::this.onOpen}>
          <Modal.Body>
            <div className="loading"></div>
            <h4>Updating your account...</h4>
            <p>Please be patient :)</p>
          </Modal.Body>
        </Modal>
      );
    }
    else {
      return (
        <Modal className="coupon-popup" show={show} onHide={close} onEntering={::this.onOpen}>
          <Modal.Header closeButton>
            <Modal.Title className="text-center">Enter your coupon code</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Form>
              <FormGroup className={cx({'has-error': error})}>
                <FormControl type="text" ref="code" placeholder="- - - - -" onChange={::this.handleEmpty} />
              </FormGroup>
              <FormGroup className="text-center">
                <Button lg type='button' className="btn-sq btn-hollow btn-cancel" onClick={close} disabled={status == 'getting'}>Cancel</Button>
                <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={::this.sendCode} disabled={empty}>
                  {status == 'getting'? <ButtonLoader primary={true} />: <span>Redeem</span>}
                </Button>
              </FormGroup>
              { error ? 
                <FormGroup className="has-error text-center">
                  <HelpBlock>{errorMsg}</HelpBlock>
                  { errorMsg ? <HelpBlock>{`You have ${Math.max(MAX_VERIFY_COUNT - verifyCount, 0)} tries remaining.`}</HelpBlock>: null }
                </FormGroup>
                : null
              }
            </Form>
          </Modal.Body>
        </Modal>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  status: state.coupon.status,
  statusText: state.coupon.statusText,
  code: state.coupon.code,
});

export default connect(mapStateToProps)(ReactTimeout(Coupon));
