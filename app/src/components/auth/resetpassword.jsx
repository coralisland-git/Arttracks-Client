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

class ResetPassword extends React.Component {
  componentWillReceiveProps (nextProps) {

  }

  resetPassword(e) {
    e.preventDefault();

    let password = ReactDOM.findDOMNode(this.password).value;
    let passwordConfirm = ReactDOM.findDOMNode(this.passwordConfirm).value;

    const uid = this.props.params.uid;
    const token = this.props.params.token;

    let { dispatch } = this.props;

    dispatch(actions.resetPassword(password, passwordConfirm, uid, token));
  }

  render() {
    const { isResetting, isReset, statusText } = this.props;
    const className = (isReset)? 'has-success text-center': 'has-error text-center';

    return (
      <div className="modal-wrapper modal-white">
        <div className="modal-content">
          <Modal.Header>
            <IconLogoLarge />
          </Modal.Header>
          <Modal.Body className="modal-white">
            <div className="h1 text-center">Reset password.</div>
            <p className="text-center" style={{"marginBottom": "35px", "marginTop": "20px"}}>After resetting it, <Link to="/login">click here</Link> to log in.</p>

            <Form onSubmit={::this.resetPassword}>
              <FormGroup>
                <FormControl type='password' id="password" placeholder='New Password' ref={(password) => this.password = password} autoFocus />
              </FormGroup>
              <FormGroup>
                <FormControl type='password' id="passwordConfirm" placeholder='Password confirm' ref={(passwordConfirm) => this.passwordConfirm = passwordConfirm} />
              </FormGroup>
              <hr className="transparent" />
              <FormGroup>
                <Button lg type='submit' bsStyle='primary' className="btn-block">
                  { isResetting ? <ButtonLoader primary={true} />: 'Reset Password' }
                </Button>
              </FormGroup>
              <FormGroup className={className}>
                <span className="help-block" dangerouslySetInnerHTML={{__html: statusText}}></span>
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
  isReset: state.auth.isReset,
  isResetting: state.auth.isResetting,
  statusText: state.auth.resetStatusText
});

export default connect(mapStateToProps)(ResetPassword);
