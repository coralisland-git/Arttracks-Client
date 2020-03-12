import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {
  Row,
  Col,
  Grid,
  Form,
  FormGroup,
  FormControl,
  Button
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import ButtonLoader from '../common/button-loader.jsx';

class ChangePassword extends React.Component {
  savePassword(e) {
    e.preventDefault();

    let password = {
      old_password: ReactDOM.findDOMNode(this.oldPassword).value,
      new_password1: ReactDOM.findDOMNode(this.newPassword).value,
      new_password2: ReactDOM.findDOMNode(this.passwordConfirm).value
    };

    let { dispatch } = this.props;

    dispatch(actions.saveSettings('password', password));
  }

  render() {
    const { status, statusText, cmdType } = this.props;
    const statusPassword = (cmdType == 'password')? statusText: '';
    const className = (status == 'saved')? 'has-success': 'has-error';

    return (
      <div className="body-container">
        <div className="container__with-scroll">
          <Grid>
            <Row>
              <Col md={12}>
                <h3 className="header">Change Password</h3>
              </Col>
            </Row>
            <Row>
              <Col md={6}>
                <Form onSubmit={::this.savePassword}>
                  <FormGroup>
                    <label>Change your password or recover your current one.</label>
                    <FormControl type="password" placeholder="Current Password" ref={(oldPassword) => this.oldPassword = oldPassword}/>
                  </FormGroup>
                  <hr className="transparent" />
                  <FormGroup>
                    <label>New Password</label>
                    <FormControl type="password" placeholder="New Password" ref={(newPassword) => this.newPassword = newPassword}/>
                  </FormGroup>
                  <FormGroup>
                    <FormControl type="password" placeholder="New Password again please" ref={(passwordConfirm) => this.passwordConfirm = passwordConfirm}/>
                  </FormGroup>
                  <hr className="transparent" />
                  <hr className="transparent" />
                  <Row>
                    <Col md={6}>
                      <Button lg type='submit' bsStyle='primary' className="btn-sq btn-block">
                        { status == 'saving' && cmdType == 'password' ? <ButtonLoader primary={true} />: 'Save' }
                      </Button>
                    </Col>
                  </Row>
                  <hr className="transparent" />
                  <FormGroup>
                    <p>Forgot your password? <Link to="/forgot-password">Reset it.</Link></p>
                  </FormGroup>
                  <hr className="transparent" />
                  <FormGroup className={className}>
                    <span className="help-block" dangerouslySetInnerHTML={{__html: statusPassword}}></span>
                    <hr />
                  </FormGroup>
                </Form>
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  cmdType: state.profile.cmdType,
  status: state.profile.status,
  statusText: state.profile.statusText
});

export default connect(mapStateToProps)(ChangePassword);
