import React from 'react';
import ReactDOM from 'react-dom';
import ReactTimeout from 'react-timeout';
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
import { STRIPE_PUBLIC_KEY, TIMES_COST, 
  TIMES_COST_STANDARD, TIMES_COST_MULTIPLIER, TIMES_COST_DISCOUNT_FACTOR, TIMES_COST_LOWEST_DISCOUNT } from '../../constants';
import SelectedPlan from './selected-plan.jsx';
import SelectedCredits from './selected-credits.jsx';
import SelectedTimes from './selected-times.jsx';

class PaymentInfo extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      status: null,
      errorMsg: null,
      errors: {},
      useOnFile: false,
      saveCard: false,
      checking: false,
    };
  }

  componentDidMount() {
    Stripe.setPublishableKey(STRIPE_PUBLIC_KEY);
  }

  componentWillReceiveProps (nextProps) {
    const { status: nextStatus, profileStatus: nextProfileStatus, customer, statusText } = nextProps;
    const { dispatch, status, profileStatus, rightSide } = this.props;

    if(status == 'processing' && nextStatus == 'proceed') {
      if(!this.state.useOnFile && this.state.saveCard) {
        dispatch(actions.savePayingInfo(customer));
      }
      dispatch(actions.getInvoices(customer.id));
      dispatch(actions.getPayments(customer.id));
      this.updateProfile();
    }
    else if(status == 'processing' && nextStatus == 'failed') {
      this.setState({status: 'failed', errorMsg: statusText});
    }

    if(profileStatus == 'getting' && nextProfileStatus == 'got' || profileStatus == 'checking' && nextProfileStatus == 'checked') {
      this.setState({checking: false});
      dispatch(actions.showPuchasePopup({ section: "paymentSuccess", rightSide }));
    }
    else if((profileStatus == 'getting' || profileStatus == 'checking') && nextProfileStatus == 'failed') {
      this.setState({status: 'failed', checking: false, errorMsg: null});
    }
  }

  reset() {
    ReactDOM.findDOMNode(this.refs.cardNumber).value = '';
    ReactDOM.findDOMNode(this.refs.expMonth).value = moment().month() + 1;
    ReactDOM.findDOMNode(this.refs.expYear).value = moment().year() + 1;
    ReactDOM.findDOMNode(this.refs.cardName).value = '';
    ReactDOM.findDOMNode(this.refs.cvc).value = '';
    if(this.refs.prevToken)
      ReactDOM.findDOMNode(this.refs.prevToken).value = '';

    this.setState({useOnFile: false, saveCard: true});
  }

  fill() {
    const { paying, customer } = this.props;

    ReactDOM.findDOMNode(this.refs.cardNumber).value = '**** **** **** ' + paying.card_last_4;
    ReactDOM.findDOMNode(this.refs.expMonth).value = paying.card_exp_month;
    ReactDOM.findDOMNode(this.refs.expYear).value = paying.card_exp_year;
    ReactDOM.findDOMNode(this.refs.cardName).value = paying.card_name;
    ReactDOM.findDOMNode(this.refs.cvc).value = '';
    if(this.refs.prevToken)
      ReactDOM.findDOMNode(this.refs.prevToken).value = customer.default_source;

    this.setState({useOnFile: true, saveCard: false});
  }

  onOpen () {
    const { paying, customer } = this.props;

    if(customer && paying && paying.stripe_token == customer.id && customer.sources.data.length) {
      this.fill();
    }
    else {
      this.reset();
    }
  }

  onClose() {
    const { dispatch } = this.props;
    dispatch(actions.setVideoTimes({
      count: 0,
      discountRate: TIMES_COST_STANDARD,
      totalPrice: 0.00,
    }, 0));
    this.props.close();
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
    const { useOnFile, saveCard } = this.state;

    let cardNumber = ReactDOM.findDOMNode(this.refs.cardNumber).value;
    let expMonth = ReactDOM.findDOMNode(this.refs.expMonth).value;
    let expYear = ReactDOM.findDOMNode(this.refs.expYear).value;
    let cvc = ReactDOM.findDOMNode(this.refs.cvc).value;
    let cardName = ReactDOM.findDOMNode(this.refs.cardName).value;

    return {cardNumber, expMonth, expYear, cvc, cardName, useOnFile, saveCard};
  }

  handlePrevToken(e) {
    e.preventDefault();
    let prevToken = ReactDOM.findDOMNode(this.refs.prevToken).value;

    if(prevToken != '') {
      const { paying, customer } = this.props;
      const sources = customer.sources.data;
      const card = R.find(R.propEq('id', prevToken))(sources);

      if(card) {
        ReactDOM.findDOMNode(this.refs.cardNumber).value = '**** **** **** ' + card.last4;
        ReactDOM.findDOMNode(this.refs.expMonth).value = card.exp_month;
        ReactDOM.findDOMNode(this.refs.expYear).value = card.exp_year;
        ReactDOM.findDOMNode(this.refs.cardName).value = card.name;
        ReactDOM.findDOMNode(this.refs.cvc).value = '';

        this.setState({useOnFile: true, saveCard: false});
      }
      else {
        this.reset();
      }
    }
    else {
      this.reset();
    }
  }

  handleUseNewCard(e) {
    e.preventDefault();

    this.reset();
  }

  handleSaveCard(e) {
    this.setState({saveCard: e.target.checked});
  }

  onBack(e) {
    e.preventDefault();

    const { dispatch } = this.props;
    dispatch(actions.showPuchasePopup({ section: "billingInfo" }));
  }

  onNext(e) {
    e.preventDefault();

    const { dispatch, selectedPlan, customer, rightSide, credits, times } = this.props;

    this.setState({status: null, errorMsg: null});

    if(this.state.useOnFile) {
      this.setState({status: 'processing'});

      if(rightSide == 'credits') {
        dispatch(actions.createPayment({
          customerId: customer.id,
          cardId: ReactDOM.findDOMNode(this.refs.prevToken).value,
          price: credits.price,
          item: 'credits',
          quantity: credits.count,
        }));
      }
      else if(rightSide == 'times') {
        dispatch(actions.createPayment({
          customerId: customer.id,
          cardId: ReactDOM.findDOMNode(this.refs.prevToken).value,
          price: times.totalPrice.toFixed(2),
          item: 'seconds',
          quantity: times.count,
        }));
      }
      else {
        dispatch(actions.upgradePlan({
          plan: selectedPlan.stripe_plan_id,
          customerId: customer.id,
          cardId: ReactDOM.findDOMNode(this.refs.prevToken).value,
        }));
      }
    }
    else {
      const formdata = this.formdata();
      const errors = R.mapObjIndexed((i, key, obj) => true, R.filter((v) => (!v || v == ''), formdata));

      delete errors.useOnFile;
      delete errors.saveCard;

      if(Object.keys(errors) && Object.keys(errors).length) {
        this.setState({errors: errors});
      }
      else {
        this.setState({errors: {}});
        this.createToken(formdata);
      }
    }
  }

  createToken(formdata) {
    const { billing, selectedPlan, customer, dispatch, rightSide, credits, times } = this.props;
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

    this.setState({status: 'processing'});

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

        if(rightSide == 'credits') {
          options.price = credits.price;
          options.item = 'credits';
          options.quantity = credits.count;
          dispatch(actions.createPayment(options));
        }
        else if(rightSide == 'times') {
          options.price = times.totalPrice.toFixed(2);
          options.item = 'seconds';
          options.quantity = times.count;
          dispatch(actions.createPayment(options));
        }
        else {
          if(selectedPlan) {
            options.plan = selectedPlan.stripe_plan_id;
          }
          dispatch(actions.upgradePlan(options));
        }
      }
    });
  }

  updateProfile() {
    const { dispatch, setTimeout, rightSide } = this.props;

    this.setState({checking: true});
    setTimeout(() => {
      if(this.props.profileStatus !== 'getting') {
        let data = (rightSide == 'credits' || rightSide == 'times') ? this.props.charge: this.props.subscription;
        dispatch(actions.checkProfile(data));
      }
    }, 3000);

    setTimeout(() => {
      if(this.state.checking) {
        dispatch(actions.showPuchasePopup({ section: "paymentSuccess", rightSide }));
      }
    }, 15000);
  }

  render() {
    const { show, close, selectedPlan, order, customer, rightSide, credits, times } = this.props;
    const { status, errorMsg, errors, useOnFile, saveCard } = this.state;

    let alert = (status == 'failed') ?
      <Alert danger>{errorMsg? errorMsg: 'Payment failed. Check payment information or try a new card.'}</Alert>
      : null;

    let sources = [];
    if(customer && customer.sources.total_count) {
      sources = customer.sources.data;
    }

    let months = [];
    for(let i=1; i<=12; i++)
      months.push(moment(i, 'M').format('MMMM'));

    let years = [];
    for(let i=moment().year(); i<=moment().year()+5; i++)
      years.push(i);

    if(this.state.checking) {
      return (
        <Modal className="checking-modal" show={this.state.checking}>
          <Modal.Body>
            <div className="loading"></div>
            <h4>Updating your account...</h4>
          </Modal.Body>
        </Modal>
      );
    }
    else {
      return (
        <Modal className="billing-info-popup" show={show} onHide={::this.onClose} onEntering={::this.onOpen}>
          <Modal.Header closeButton>
            <Modal.Title>Enter payment information</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            <Row>
              <Col sm={7} className="billing-form payment-form">
                <div id="alert-box">
                  { alert }
                </div>
                <p>Please complete the form below before proceeding.</p>
                <Form>
                  { customer && sources.length > 0 ?
                    <Row>
                      <Col sm={8}>
                        <FormGroup controlId="prevToken">
                          <FormControl componentClass="select" ref="prevToken" onChange={::this.handlePrevToken}>
                            <option value=''> - - - - - - - - </option>
                            {
                              sources.map((source, k) => <option key={k} value={source.id}>{source.brand} ending in {source.last4}</option>)
                            }
                          </FormControl>
                        </FormGroup>
                      </Col>
                      <Col sm={4} className="pt3">
                        <a href="#" onClick={::this.handleUseNewCard}>Use a new card</a>
                      </Col>
                    </Row>
                    : null
                  }
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
                  <FormGroup controlId="saveCard">
                    <Checkbox ref="saveCard" checked={saveCard} onChange={::this.handleSaveCard}>Remember this credit card</Checkbox>
                  </FormGroup>
                  {
                    status == 'processing' ?
                      <div className="form-overlay" style={{top: 0, height: '100%'}}></div> :
                      (useOnFile ? <div className="form-overlay" style={{top: 60}}></div> : null)
                  }
                </Form>
                <p>We do not store any of your payment details on our servers. The data is encrypted and securely stored by Stripe.
                  A copy of the Stripe security policy is available <a href="https://stripe.com/us/privacy" target="_blank">here</a>.
                </p>
                <p>Having trouble subscribing? Contact us at <a href="mailTo:support@arttracks.com">support@arttracks.com</a>.</p>
              </Col>
              <Col sm={5} className="bg-grey">
              {
                rightSide == 'credits'? <SelectedCredits />: (rightSide == 'times'? <SelectedTimes />: <SelectedPlan />)
              }
              </Col>
            </Row>
          </Modal.Body>
          <Modal.Footer>
            <Button lg type='button' className="btn-sq btn-hollow btn-cancel pull-left" onClick={::this.onClose} disabled={status == 'processing'}>Cancel</Button>
            <div className="stripe-encrypt">
              <Icon bundle='dripicons' glyph="lock" />
              <span>SSL Encryption - Powered by <a href="https://stripe.com" target="_blank">Stripe</a></span>
            </div>
            <Button lg type='button' bsStyle='primary' className="btn-sq btn-hollow btn-wider" onClick={::this.onBack} disabled={status == 'processing'}>Back</Button>
            <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={::this.onNext}>
            {
              status == 'processing'?
                <ButtonLoader primary={true} />:
                <span>Pay ${rightSide == 'credits'? credits.price.toFixed(2): (rightSide == 'times'? times.totalPrice.toFixed(2): order.requested_plan_cost.toFixed(2))}</span>
            }
            </Button>
          </Modal.Footer>
        </Modal>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  status: state.payment.status,
  statusText: state.payment.statusText,
  customer: state.payment.customer,
  charge: state.payment.charge,
  subscription: state.payment.subscription,
  billing: state.billing.billing,
  paying: state.paying.paying,
  order: state.plan.order,
  credits: state.buy.credits,
  times: state.buy.times,
  profileStatus: state.profile.status,
});

export default connect(mapStateToProps)(ReactTimeout(PaymentInfo));
