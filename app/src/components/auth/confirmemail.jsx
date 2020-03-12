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

class ConfirmEmail extends React.Component {

  constructor(...args) {
    super(...args);
    this.state = {
      errText: null,
      successText: null
    };
  }

  componentWillMount() {
    
  }

  componentDidMount() {
    const confirmationKey = this.props.params["confirmationKey"];

    if(confirmationKey) {
      this.props.dispatch(actions.confirmEmail(confirmationKey));
    }
  }

  componentWillReceiveProps (nextProps) {
    const { statusText, confirmed } = nextProps;

    if(confirmed) {
      this.setState({successText: statusText});
    }
    else {
      this.setState({errText: statusText});
    }
  }

  send(e) {
    e.preventDefault();
  }

  continue(e) {
    this.props.router.push('/settings/profile');
  }

  render() {
    const { confirming, confirmed } = this.props;
    const { errText, successText } = this.state;

    if (confirmed) {
      return (
        <div className="modal-wrapper modal-white">
          <div className="modal-content" style={{maxWidth: 470}}>
            <Modal.Header>
              <IconLogoLarge />
            </Modal.Header>
            <Modal.Body className="modal-white">
              <div className="h1 text-center" style={{'marginBottom': 0}}>Hooray!</div>
              <p className="text-center mt5 mb7">{ successText ? successText : 'Your email has been confirmed and your account has been successfully updated.' }</p>
              <Form onSubmit={::this.continue}>
                <hr className="transparent" />
                <FormGroup>
                  <Button lg type='submit' bsStyle='primary' className="btn-block mb6">
                    <span>Continue</span>
                  </Button>
                </FormGroup>
              </Form>
            </Modal.Body>
          </div>
        </div>
      );
    } else {
      return (
        <div className="modal-wrapper modal-white">
          <div className="modal-content" style={{maxWidth: 470}}>
            <Modal.Header>
              <IconLogoLarge />
            </Modal.Header>
            <Modal.Body className="modal-white">
              <div className="h1 text-center" style={{'marginBottom': 0}}>{ errText ? 'Uh oh.': 'Confirming email...' }</div>
              <p className="text-center mt5 mb7">{ errText ? errText : 'Please wait one moment while we confirm your new email address and update your account.' }</p>
              <Form onSubmit={::this.send}>
                <hr className="transparent" />
                <FormGroup>
                  { !errText ? <ButtonLoader primary={false} /> : '' }
                </FormGroup>
              </Form>
            </Modal.Body>
          </div>
        </div>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  confirming: state.auth.confirming,
  confirmed: state.auth.confirmed,
  statusText: state.auth.confirmStatusText,
});

export default connect(mapStateToProps)(ReactTimeout(ConfirmEmail));
