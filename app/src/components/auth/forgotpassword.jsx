/**
 * Created by jarosanger on 8/15/16.
 */
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
import actions from '../../redux/actions';
import ButtonLoader from '../common/button-loader.jsx';
import { IconLogoLarge } from '../common/svg-icon.jsx';

class ForgotPassword extends React.Component {
  componentWillMount () {
    const { dispatch } = this.props;
    dispatch(actions.resetSignup());
  }

  submit(e) {
    e.preventDefault();

    let email = ReactDOM.findDOMNode(this.email).value;

    let { dispatch } = this.props;

    dispatch(actions.forgotPassword(email));
  }

  render() {
    const { isSentEmail, isSendingEmail, statusText } = this.props;
    const className = (isSentEmail)? 'has-success text-center': 'has-error text-center';

    return (
      <div className="modal-wrapper modal-white">
        <div className="modal-content">
          <Modal.Header>
            <IconLogoLarge />
          </Modal.Header>
          <Modal.Body className="modal-white">
            <div className="h1 text-center">Reset password.</div>
            <p className="text-center" style={{"marginBottom": "55px", "marginTop": "20px"}}>After resetting it a confirmation email will be sent.</p>

            <Form onSubmit={::this.submit}>
              <FormGroup controlId="email">
                <FormControl type='email' id="email" placeholder='Your email address' ref={(email) => this.email = email} autoFocus />
              </FormGroup>
              <hr className="transparent" />
              <FormGroup>
                <Button lg type='submit' bsStyle='primary' className="btn-block">
                  { isSendingEmail ? <ButtonLoader primary={true} />: 'Send it.' }
                </Button>
              </FormGroup>
              <FormGroup className={className}>
                <span className="help-block text-center" dangerouslySetInnerHTML={{__html: statusText}}></span>
              </FormGroup>
            </Form>
            <p className="text-center">Have an account already? <Link to="/login">Log in.</Link></p>
          </Modal.Body>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  isSentEmail: state.auth.isSentEmail,
  isSendingEmail: state.auth.isSendingEmail,
  statusText: state.auth.forgotStatusText
});

export default connect(mapStateToProps)(ForgotPassword);
