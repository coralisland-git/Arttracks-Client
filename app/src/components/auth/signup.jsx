/**
 * Created by jarosanger on 8/15/16.
 */
import React from 'react';
import ReactDOM from 'react-dom';
import { findDOMNode } from 'react-dom';
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

class Signup extends React.Component {
  componentWillMount () {
    const { dispatch } = this.props;
    dispatch(actions.resetSignup());
  }

  componentDidMount() {
    const { router, verified, invites } = this.props;
    /*if(!verified) {
      router.push('/signup/invite');
    }
    else if(invites) {
      if(invites.issued_to_email) {
        findDOMNode(this.email).value = invites.issued_to_email;
        findDOMNode(this.email).readOnly = true;
      }
      if(invites.issued_to_name) {
        findDOMNode(this.name).value = invites.issued_to_name;
        findDOMNode(this.name).readOnly = true;
      } else {
        findDOMNode(this.name).focus();
      }
    }*/
  }

  componentWillReceiveProps (nextProps) {
    const { router } = this.props;
    const { isSignedUp } = nextProps;

    if (isSignedUp) {
      router.push('/login');
    }
  }

  handleUsername(e) {
    if ($.inArray(e.keyCode, [46, 8, 9, 27, 13, 189]) !== -1 ||
      (e.keyCode == 65 && e.ctrlKey === true) ||
      (e.keyCode >= 35 && e.keyCode <= 39)) {
        return;
    }
    if (!((e.keyCode > 47 && e.keyCode < 58 && !e.shiftKey) || (e.keyCode > 64 && e.keyCode < 91))) {
      e.preventDefault();
    }
  }

  signup(e) {
    e.preventDefault();

    let name = findDOMNode(this.name).value;
    let email = findDOMNode(this.email).value;
    let username = findDOMNode(this.username).value;
    let password = findDOMNode(this.password).value;
    //let passwordConfirm = findDOMNode(this.passwordConfirm).value;

    const { dispatch, invites } = this.props;

    /*if(invites && invites.code) {
      dispatch(actions.signupUser(name, email, username, password, invites.code));
    }*/
    dispatch(actions.signupUser(name, email, username, password));
  }

  render() {
    const { isSigningUp, statusText } = this.props;

    return (
      <div className="modal-wrapper modal-white">
        <div className="modal-content">
          <Modal.Header style={{'paddingTop': '60px'}}>
            <IconLogoLarge />
          </Modal.Header>
          <Modal.Body className="modal-white" style={{'paddingTop': '0px'}}>
            <div className="h1 text-center">Create an account.</div>
            <p className="text-center" style={{"marginBottom": "45px", "marginTop": "20px"}}>Have an account already? <Link to="/login">Log in.</Link></p>

            <Form onSubmit={::this.signup}>
              <FormGroup className="text-center" controlId="name">
                <FormControl type='text' id="name" placeholder='Enter your name' ref={(name) => this.name = name} autoFocus/>
              </FormGroup>
              <FormGroup className="text-center" controlId="email">
                <FormControl type='text' id="email" placeholder='Enter your email address' ref={(email) => this.email = email}/>
              </FormGroup>
              <FormGroup className="text-center" controlId="username">
                <FormControl type='text' id="username" placeholder='Choose a username'
                  ref={(username) => this.username = username}
                  onKeyDown={::this.handleUsername}
                />
              </FormGroup>
              <FormGroup className="text-center" controlId="password">
                <FormControl type='password' id="password" placeholder='Choose your password' ref={(password) => this.password = password} />
              </FormGroup>
              {/*<FormGroup className="text-center" controlId="password_confirm">
              <FormControl type='password' id="password_confirm" placeholder='Confirm your password' ref={(passwordConfirm) => this.passwordConfirm = passwordConfirm} />
              </FormGroup>*/}
              <FormGroup className="text-center font13">
                By signing up, you agree to the ArtTracks <a href="#">Terms of Use.</a>
              </FormGroup>
              <hr className="transparent" />
              <FormGroup>
                <Button lg type='submit' bsStyle='primary' className="btn-block">
                  { isSigningUp ? <ButtonLoader primary={true} />: <span>Sign me up.</span> }
                </Button>
              </FormGroup>
              <FormGroup className="has-error text-center">
                <span className="help-block" dangerouslySetInnerHTML={{__html: statusText}}></span>
              </FormGroup>
            </Form>

            {/*}<p className="text-center">Or login using one of the below services:</p>

            <Button lg bsStyle="primary" className="btn-facebook btn-block">
              <span className="rubix-icon icon-ikons-facebook-1 pull-left"></span>
              Login with Facebook
            </Button>

            <Button lg bsStyle="primary" className="btn-twitter btn-block">
              <span className="rubix-icon icon-ikons-twitter pull-left"></span>
              Login with Twitter
            </Button>*/}
          </Modal.Body>
        </div>
      </div>

    );
  }
}

const mapStateToProps = (state) => ({
  isSignedUp: state.auth.isSignedUp,
  isSigningUp: state.auth.isSigningUp,
  verified: state.auth.verified,
  invites: state.auth.invites,
  statusText: state.auth.signupStatusText
});

export default connect(mapStateToProps)(Signup);
