/**
 * Created by jarosanger on 8/15/16.
 */
import moment from 'moment';
import cookie from 'react-cookie';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ReactTimeout from 'react-timeout';
import { FacebookLogin } from 'react-facebook-login-component';
import {
  Modal,
  Form,
  FormGroup,
  FormControl,
  Checkbox,
  Button,
  Alert
} from '@sketchpixy/rubix';
import { FACEBOOK_APPID } from '../../constants';
import actions from '../../redux/actions';
import ButtonLoader from '../common/button-loader.jsx';
import { IconLogoLarge } from '../common/svg-icon.jsx';

class Login extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {isSignedUp: false, conversionCreated: false};
  }

  componentWillReceiveProps (nextProps) {
    const { router } = this.props;
    const { isAuthenticated } = nextProps;

    if (isAuthenticated) {
      let { dispatch } = this.props;
      dispatch(actions.getProfile());
      dispatch(actions.getBillingInfo());
      dispatch(actions.getPayingInfo());
      dispatch(actions.getPlans());
      dispatch(actions.getNotifications('profile'));

      const redirectRoute = this.props.location.query.next || '/';
      router.push(redirectRoute);
    }
  }

  responseFacebook (response) {
    console.log(response);
  }

  login(e) {
    e.preventDefault();

    let username = ReactDOM.findDOMNode(this.username).value;
    let password = ReactDOM.findDOMNode(this.password).value;
    let rememberMe = this.rememberMe.checked;

    const { dispatch } = this.props;

    dispatch(actions.resetSignup());
    dispatch(actions.loginUser(username, password, rememberMe));

    cookie.save('lastLogin', moment().format('YYYY-MM-DD HH:mm:ss'), { path: '/' });
  }

  componentDidMount() {
    const { isSignedUp, signupStatusText, signupUserId, signupUsername, dispatch } = this.props;
    const { conversionCreated } = this.state;
    let conversionId = 0;

    if(isSignedUp) {
      //console.log("User signed up.");
      if(signupUserId) {
        //console.log("User ID found, updating user profile with referral data...");

        // Tapfiliate stuff
        (function(t,a,p){t.TapfiliateObject=a;t[a]=t[a]||function(){(t[a].q=t[a].q||[]).push(arguments)}})(window,'tap');
        
        // Initialize Tapfiliate
        tap('create', '4533-6c3a54', {}, function(error, result){
          //console.log("Ran create...");
          if (result) {
            //console.log("Result was: " +  result);
          } else if (error) {
            //console.log("Error was: " + error);
          }
        });

        // Detect Affiliate/Referrer
        tap('detect');

        // Define metadata to store with the conversion
        var metaData = {
          username: signupUsername,
        }

        // Create Tapfilate conversion
        if(!conversionCreated) {
          console.log("Running conversion creation.")
          tap('conversion', signupUserId, 0, {meta_data: metaData}, "signup", function(conversion){
            //console.log("Ran conversion...");
            if (conversion) {
              //console.log("Conversion: " + conversion);
              //console.log("Conversion ID: " + conversion.id);
              conversionId = conversion.id;
            }
          });

          this.setState({ conversionCreated: true });
        }
      }
    }
  }

  render() {
    const { isAuthenticating, statusText, isSignedUp, signupStatusText } = this.props;
    const facebookButtonText = <span><span className="rubix-icon icon-ikons-facebook-1 pull-left"></span>Login With Facebook</span>;
    let signupAlert = null;

    if(isSignedUp) {
      signupAlert = <Alert success>{signupStatusText}</Alert>;
    }

    return (
      <div className="modal-wrapper modal-white">
        <div className="modal-content modal-login">
          <Modal.Header>
            <IconLogoLarge />
          </Modal.Header>
          <Modal.Body className="modal-white">
            {signupAlert}

            <div className="h1 text-center">Log in.</div>
            <p className="text-center" style={{"marginBottom": "55px", "marginTop": "20px"}}>Don’t have an account yet? <a href="/signup">Sign up.</a></p>

            <Form onSubmit={::this.login}>
              <FormGroup className="text-center" controlId="username">
                <FormControl type='text' id="username" placeholder='Enter your username' ref={(username) => this.username = username} autoFocus />
              </FormGroup>
              <FormGroup className="text-center" controlId="password">
                <FormControl type='password' id="password" placeholder='Enter your password' ref={(password) => this.password = password} />
              </FormGroup>
              <FormGroup>
                <Checkbox inputRef={(rememberMe) => { this.rememberMe = rememberMe; }} className="remember-me-checkbox pull-left" style={{"marginLeft": "10px"}}>
                  <span>Remember me.</span>
                </Checkbox>
                <Link className="pull-right" to="/forgot-password" style={{"marginRight": "10px", "marginTop": "3px"}}>Forgot password?</Link>
              </FormGroup>
              <hr className="transparent" />
              <FormGroup>
                <Button lg type='submit' bsStyle='primary' className="btn-block">
                  { isAuthenticating ? <ButtonLoader primary={true} />: 'Let me in.' }
                </Button>
              </FormGroup>
              <FormGroup className="has-error text-center">
                <span className="help-block" dangerouslySetInnerHTML={{__html: statusText}}></span>
                {/*}<hr />*/}
              </FormGroup>
            </Form>

            {/*<p className="text-center">Or login using one of the below services:</p>

            <FacebookLogin socialId={FACEBOOK_APPID}
              language="en_US"
              scope="public_profile,email"
              responseHandler={this.responseFacebook}
              xfbml={true}
              version="v2.5"
              class="btn btn-lg btn-primary btn-facebook btn-block"
              buttonText={facebookButtonText} />

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
  isAuthenticated: state.auth.isAuthenticated,
  isAuthenticating: state.auth.isAuthenticating,
  statusText: state.auth.authStatusText,
  isSignedUp: state.auth.isSignedUp,
  signupStatusText: state.auth.signupStatusText,
  signupUserId: state.auth.signupUserId,
  signupUsername: state.auth.signupUsername,
});

export default connect(mapStateToProps)(ReactTimeout(Login));
