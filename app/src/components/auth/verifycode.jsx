/**
 * Created by jarosanger on 8/15/16.
 */
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {
  Modal,
  Form,
  FormGroup,
  FormControl,
  Button
} from '@sketchpixy/rubix';
import ReactTimeout from 'react-timeout';
import actions from '../../redux/actions';
import ButtonLoader from '../common/button-loader.jsx';
import { IconLogoLarge } from '../common/svg-icon.jsx';
import { IconCheck } from '../common/svg-icon.jsx';
import { VerifyCounter } from '../../utils/verify-counter';
import { MAX_VERIFY_COUNT } from '../../constants';

class VerifyCode extends React.Component {
  verifyCounter;

  constructor(...args) {
    super(...args);
    this.state = {errText: null};
  }

  componentWillMount() {
    this.verifyCounter = VerifyCounter('invite-code-checker');
  }

  componentWillReceiveProps (nextProps) {
    const { statusText, verified, invites } = nextProps;

    if(verified && invites) {
      if(invites.is_valid) {
        this.props.setTimeout(() => {
          this.continue();
        }, 1500);

        this.verifyCounter.clear();
      }
      else {
        const now = moment().format('X');
        let errText = "We're sorry, no valid invite can be found for this code.";

        if(invites.expire) {
          const expire = moment(invites.expire).format('X');
          if(expire < now) {
            errText = "We're sorry, this invite code has expired.";
          }
        }
        else if(invites.start) {
          const start = moment(invites.start).format('X');
          if(start > now) {
            errText = `We're sorry, this invite is not valid until ${moment(invites.start).format('MMM D, YYYY')}`;
          }
        }

        this.setState({errText});
      }
    }
    else {
      this.setState({errText: statusText});
    }
  }

  send(e) {
    e.preventDefault();

    if(this.verifyCounter.check()) {
      let code = ReactDOM.findDOMNode(this.code).value;

      if(!code) {
        this.setState({errText: 'Please input invite code.'});
      }
      else {
        this.props.dispatch(actions.verifyCode(code));
      }

      this.verifyCounter.append();
    }
    else {
      this.setState({errText: "Sorry, you've reached the maximum number of tries. You can try again in 30 minutes."});
    }
  }

  continue(e) {
    this.props.router.push('/signup');
  }

  render() {
    const { verifying, verified, invites } = this.props;
    const { errText } = this.state;
    const verifyCount = this.verifyCounter.count();

    if(verified && invites && invites.is_valid) {
      return (
        <div className="modal-wrapper modal-white">
          <div className="modal-content" style={{maxWidth: 470}}>
            <Modal.Header>
              <IconCheck />
            </Modal.Header>
            <Modal.Body className="modal-white">
              <div className="h1 text-center">Verified, one sec...</div>
              {/*}<Button lg bsStyle='primary' className="btn-block" onClick={::this.continue}>Continue</Button>*/}
            </Modal.Body>
          </div>
        </div>
      );
    }
    else {
      return (
        <div className="modal-wrapper modal-white">
          <div className="modal-content" style={{maxWidth: 470}}>
            <Modal.Header>
              <IconLogoLarge />
            </Modal.Header>
            <Modal.Body className="modal-white">
              <div className="h1 text-center" style={{'marginBottom': 0}}>Enter invite code.</div>
              <p className="text-center mt5 mb7">Enter the invite code that you received and click the "Verify" button to create your account.</p>
              <Form onSubmit={::this.send}>
                <FormGroup className="text-center" controlId="code">
                  <FormControl maxLength="25" className="big-purple" type='text' id="code" placeholder='code' ref={(r) => this.code = r} autoFocus />
                </FormGroup>
                <hr className="transparent" />
                <FormGroup>
                  <Button lg type='submit' bsStyle='primary' className="btn-block mb6">
                    { verifying ? <ButtonLoader primary={true} />: <span>Verify</span> }
                  </Button>
                </FormGroup>
                <FormGroup className="has-error text-center">
                  <span className="help-block" dangerouslySetInnerHTML={{__html: errText}}></span>
                  { errText ? <span className="help-block">{`You have ${Math.max(MAX_VERIFY_COUNT - verifyCount, 0)} tries remaining.`}</span>: '' }
                </FormGroup>
              </Form>
              <p className="text-center">Don't have an invite yet? <a href="http://www.arttracks.com">Request one now.</a></p>
            </Modal.Body>
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  verifying: state.auth.verifying,
  verified: state.auth.verified,
  invites: state.auth.invites,
  statusText: state.auth.verifyStatusText,
});

export default connect(mapStateToProps)(ReactTimeout(VerifyCode));
