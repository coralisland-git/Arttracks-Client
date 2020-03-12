import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import InlineSVG from 'svg-inline-react';
import cx from 'classnames';
import R from 'ramda';
import moment from 'moment';
import {
  Modal,
  Row,
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Checkbox,
  HelpBlock,
  Button,
  Icon,
  Alert,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import ButtonLoader from '../common/button-loader.jsx';
import { STRIPE_PUBLIC_KEY } from '../../constants';

class CreateCard extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      status: null,
      errorMsg: null,
      errors: {},
      makeDefault: false,
    };
  }

  componentDidMount() {
    Stripe.setPublishableKey(STRIPE_PUBLIC_KEY);
  }

  componentWillReceiveProps (nextProps) {
    const { status: nextStatus, customer, statusText } = nextProps;
    const { dispatch, status, close } = this.props;

    if(status == 'creating' && nextStatus == 'created') {
      dispatch(actions.savePayingInfo(customer));
      this.setState({status: null});
      close();
    }
    else if(status == 'creating' && nextStatus == 'failed') {
      this.setState({status: 'failed', errorMsg: statusText});
    }
  }

  onOpen () {
    ReactDOM.findDOMNode(this.refs.cardNumber).value = '';
    ReactDOM.findDOMNode(this.refs.expMonth).value = moment().month() + 1;
    ReactDOM.findDOMNode(this.refs.expYear).value = moment().year() + 1;
    ReactDOM.findDOMNode(this.refs.cardName).value = '';
    ReactDOM.findDOMNode(this.refs.cvc).value = '';

    this.setState({makeDefault: true});
  }

  validate(e, key) {
    const { errors } = this.state;

    if(e.currentTarget.value == "") {
      errors[key] = true;
    }
    else {
      errors[key] = false;
    }

    this.setState({errors: errors});
  }

  formdata() {
    const { makeDefault } = this.state;

    let cardNumber = ReactDOM.findDOMNode(this.refs.cardNumber).value;
    let expMonth = ReactDOM.findDOMNode(this.refs.expMonth).value;
    let expYear = ReactDOM.findDOMNode(this.refs.expYear).value;
    let cvc = ReactDOM.findDOMNode(this.refs.cvc).value;
    let cardName = ReactDOM.findDOMNode(this.refs.cardName).value;

    return {cardNumber, expMonth, expYear, cvc, cardName, makeDefault};
  }

  handleMakeDefault(e) {
    this.setState({makeDefault: e.target.checked});
  }

  addCard(e) {
    e.preventDefault();

    const formdata = this.formdata();
    const errors = R.mapObjIndexed((i, key, obj) => true, R.filter((v) => (!v || v == ''), formdata));

    delete errors.makeDefault;

    this.setState({status: null});

    if(Object.keys(errors) && Object.keys(errors).length) {
      this.setState({errors: errors});
    }
    else {
      this.setState({errors: {}});
      this.createToken(formdata);
    }
  }

  createToken(formdata) {
    const { billing, customer, dispatch } = this.props;
    const cardInfo = {
        address_line1: billing.street + ' ' + billing.unit,
        address_city: billing.city,
        address_state: billing.state,
        address_zip: billing.zipcode,
        address_country: billing.country,
        number: formdata.cardNumber,
        cvc: formdata.cvc,
        exp_month: formdata.expMonth,
        exp_year: formdata.expYear,
        name: formdata.cardName,
    };

    this.setState({status: 'creating'});

    let options = {};

    if(customer) {
      options.customerId = customer.id;
      options.cmdCard = 'create';
    }

    Stripe.card.createToken(cardInfo, (status, response) => {
      if(response.error) {
        this.setState({status: 'failed', errorMsg: response.error.message});
      }
      else {
        options.cardId = response.id;
        options.makeDefault = this.state.makeDefault;

        dispatch(actions.createCard(options));
      }
    });
  }

  render() {
    const { show, close, customer } = this.props;
    const { status, errorMsg, errors, makeDefault } = this.state;

    let alert = (status == 'failed') ?
      <Alert danger>{errorMsg? errorMsg: 'Payment failed. Check payment information or try a new card.'}</Alert>
      : null;

    let months = [];
    for(let i=1; i<=12; i++)
      months.push(moment(i, 'M').format('MMMM'));

    let years = [];
    for(let i=moment().year(); i<=moment().year()+5; i++)
      years.push(i);

    return (
      <Modal className="billing-info-popup create-card" show={show} onHide={close} onEntering={::this.onOpen}>
        <Modal.Header closeButton>
          <Modal.Title>Add new payment option</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col sm={12} className="card-form">
              <div id="alert-box">
                { alert }
              </div>
              <p>Please complete the form below.</p>
              <Form>
                <Row>
                  <Col sm={5}>
                    <FormGroup controlId="cardNumber" className={cx({'has-error': errors.cardNumber})}>
                      <Row>
                        <Col sm={6}>
                          <ControlLabel>Card number</ControlLabel>
                        </Col>
                        <Col sm={6} className="pl0">
                          <img src="/imgs/stripe_card.png" />
                        </Col>
                      </Row>
                      <FormControl type="text" ref="cardNumber" placeholder="" onChange={(e) => this.validate(e, 'cardNumber')}/>
                    </FormGroup>
                  </Col>
                  <Col sm={4}>
                    <FormGroup controlId="expMonth" className={cx({'has-error': errors.expMonth})}>
                      <ControlLabel>Expiration date</ControlLabel>
                      <FormControl componentClass="select" ref="expMonth" onChange={(e) => this.validate(e, 'expMonth')}>
                        { months.map((m, i) => <option key={i} value={i+1}>{i+1} - {m}</option>)}
                      </FormControl>
                    </FormGroup>
                  </Col>
                  <Col sm={3}>
                    <FormGroup controlId="expYear" className={cx({'has-error': errors.expYear})}>
                      <ControlLabel>&nbsp;</ControlLabel>
                      <FormControl componentClass="select" ref="expYear" onChange={(e) => this.validate(e, 'expYear')}>
                        { years.map((y) => <option key={y} value={y}>{y}</option>)}
                      </FormControl>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={5}>
                    <FormGroup controlId="cardName" className={cx({'has-error': errors.cardName})}>
                      <ControlLabel>Name on card</ControlLabel>
                      <FormControl type="text" ref="cardName" placeholder="" onChange={(e) => this.validate(e, 'cardName')}/>
                    </FormGroup>
                  </Col>
                  <Col sm={7}>
                    <Row>
                      <Col sm={6}>
                        <FormGroup controlId="cvc" className={cx({'has-error': errors.cvc})}>
                          <ControlLabel>Security Code
                            <a href="#"><Icon bundle="fontello" glyph="help-circled" /></a>
                          </ControlLabel>
                          <FormControl type="text" ref="cvc" placeholder="" maxLength="4" onChange={(e) => this.validate(e, 'cvc')}/>
                        </FormGroup>
                      </Col>
                      <Col sm={6}>
                        <ControlLabel>&nbsp;</ControlLabel>
                        <HelpBlock>3 or 4-digits code on the back of your card, next to your account number.</HelpBlock>
                      </Col>
                    </Row>
                  </Col>
                </Row>
                <FormGroup controlId="makeDefault">
                  <Checkbox ref="makeDefault" checked={makeDefault} onChange={::this.handleMakeDefault}>
                    Make this my new preferred payment method
                  </Checkbox>
                </FormGroup>
                {
                  status == 'creating' ? <div className="form-overlay" style={{top: 0}}></div> : null
                }
              </Form>
              <p>We do not store any of your payment details on our servers. The data is encrypted and securely stored by Stripe.
                A copy of the Stripe security policy is available <a href="https://stripe.com/us/privacy" target="_blank">here</a>.
              </p>
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button lg type='button' className="btn-sq btn-hollow btn-cancel pull-left" onClick={close} disabled={status == 'creating'}>Cancel</Button>
          <div className="stripe-encrypt">
            <Icon bundle='dripicons' glyph="lock" />
            <span>SSL Encryption - Powered by <a href="https://stripe.com" target="_blank">Stripe</a></span>
          </div>
          <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={::this.addCard}>
          {
            status == 'creating'? <ButtonLoader primary={true} />: <span>Add Card</span>
          }
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.payment.status,
  statusText: state.payment.statusText,
  customer: state.payment.customer,
  billing: state.billing.billing,
});

export default connect(mapStateToProps)(CreateCard);
