import R from 'ramda';
import cx from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import InlineSVG from 'svg-inline-react';
import EasyCountriesList from 'easy-countries-list';
import {
  Modal,
  Row,
  Col,
  Form,
  FormGroup,
  FormControl,
  ControlLabel,
  Button,
  Icon,
  Alert,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import ButtonLoader from '../common/button-loader.jsx';
import SelectedPlan from './selected-plan.jsx';
import SelectedCredits from './selected-credits.jsx';
import SelectedTimes from './selected-times.jsx';
import { TIMES_COST_STANDARD, TIMES_COST_MULTIPLIER, TIMES_COST_DISCOUNT_FACTOR, TIMES_COST_LOWEST_DISCOUNT } from '../../constants';

class BiliingInfo extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      errors: {},
      failed: false,
    };
  }

  componentWillReceiveProps (nextProps) {
    const { status: nextStatus, billing } = nextProps;
    const { dispatch, status, rightSide } = this.props;

    if(status == 'saving' && nextStatus == 'saved') {
      // dispatch(actions.getPayingInfo());
      dispatch(actions.showPuchasePopup({ section: "paymentInfo", rightSide }));
    }
    else if(status == 'saving' && nextStatus == 'failed') {
      this.setState({failed: true});
    }
  }

  onOpen () {
    const { billing } = this.props;

    ReactDOM.findDOMNode(this.refs.firstName).value = billing? billing.first_name: '';
    ReactDOM.findDOMNode(this.refs.lastName).value = billing? billing.last_name: '';
    ReactDOM.findDOMNode(this.refs.street).value = billing? billing.street: '';
    ReactDOM.findDOMNode(this.refs.unit).value = billing? billing.unit: '';
    ReactDOM.findDOMNode(this.refs.zipcode).value = billing? billing.zipcode: '';
    ReactDOM.findDOMNode(this.refs.province).value = billing? billing.state: '';
    ReactDOM.findDOMNode(this.refs.city).value = billing? billing.city: '';
    ReactDOM.findDOMNode(this.refs.country).value = billing? billing.country: '';

    this.setState({failed: false, errors: {}});
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
    let firstName = ReactDOM.findDOMNode(this.refs.firstName).value;
    let lastName = ReactDOM.findDOMNode(this.refs.lastName).value;
    let street = ReactDOM.findDOMNode(this.refs.street).value;
    let unit = ReactDOM.findDOMNode(this.refs.unit).value;
    let zipcode = ReactDOM.findDOMNode(this.refs.zipcode).value;
    let province = ReactDOM.findDOMNode(this.refs.province).value;
    let city = ReactDOM.findDOMNode(this.refs.city).value;
    let country = ReactDOM.findDOMNode(this.refs.country).value;

    return {firstName, lastName, street, unit, zipcode, city, province, country};
  }

  onBack(e) {
    e.preventDefault();

    const { rightSide, router, dispatch } = this.props;

    if(rightSide == 'credits') {
      dispatch(actions.showPuchasePopup({ section: "buyCredits" }));
    }
    else if(rightSide == 'times') {
      dispatch(actions.showPuchasePopup({ section: "buyTimes" }));
    }
    else {
      router.push('purchase/choose-plan');
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

  onNext(e) {
    e.preventDefault();

    const { billing, dispatch } = this.props;
    const formdata = this.formdata();
    const errors = R.mapObjIndexed((i, key, obj) => true, R.filter((v) => (!v || v == ''), formdata));
    delete errors.unit;

    this.setState({failed: false});

    if(Object.keys(errors) && Object.keys(errors).length) {
      this.setState({errors: errors});
    }
    else {
      this.setState({errors: {}});

      const isUpdate = billing? true: false;
      dispatch(actions.saveBillingInfo(formdata, isUpdate));
    }
  }

  render() {
    const { show, close, userPlan, status, statusText, rightSide } = this.props;
    const { errors, failed } = this.state;
    const countries = EasyCountriesList.getAllCountries();
    let alert = failed? <Alert danger>{statusText}</Alert>: null;


    return (
      <Modal className="billing-info-popup" show={show} onHide={::this.onClose} onEntering={::this.onOpen}>
        <Modal.Header closeButton>
          <Modal.Title>Enter billing information</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row>
            <Col sm={7} className="billing-form">
              <div id="alert-box">
                { alert }
              </div>
              <p>Please complete the form below before proceeding.
                You'll be able to change your billing information in Account Settings, on the "Billing Info" tab.</p>
              <Form>
                <Row>
                  <Col sm={6}>
                    <FormGroup controlId="firstName" className={cx({'has-error': errors.firstName})}>
                      <ControlLabel>First name</ControlLabel>
                      <FormControl type="text" ref="firstName" placeholder="" onChange={(e) => this.validate(e, 'firstName')}/>
                    </FormGroup>
                  </Col>
                  <Col sm={6}>
                    <FormGroup controlId="lastName" className={cx({'has-error': errors.lastName})}>
                      <ControlLabel>Last name</ControlLabel>
                      <FormControl type="text" ref="lastName" placeholder="" onChange={(e) => this.validate(e, 'lastName')}/>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={6}>
                    <FormGroup controlId="street" className={cx({'has-error': errors.street})}>
                      <ControlLabel>Street address</ControlLabel>
                      <FormControl type="text" ref="street" placeholder="" onChange={(e) => this.validate(e, 'street')}/>
                    </FormGroup>
                  </Col>
                  <Col sm={3}>
                    <FormGroup controlId="unit">
                      <ControlLabel>Unit/Apt/Suite</ControlLabel>
                      <FormControl type="text" ref="unit" placeholder="" />
                    </FormGroup>
                  </Col>
                  <Col sm={3}>
                    <FormGroup controlId="zipcode" className={cx({'has-error': errors.zipcode})}>
                      <ControlLabel>Zip code</ControlLabel>
                      <FormControl type="text" ref="zipcode" placeholder="" onChange={(e) => this.validate(e, 'zipcode')}/>
                    </FormGroup>
                  </Col>
                </Row>
                <Row>
                  <Col sm={6}>
                    <FormGroup controlId="country" className={cx({'has-error': errors.country})}>
                      <ControlLabel>Country</ControlLabel>
                      <FormControl componentClass="select" ref="country" onChange={(e) => this.validate(e, 'country')}>
                        <option value=""></option>
                        <option value="US">United States</option>
                        { countries.map( country => {
                          return (
                            <option key={country.countryCode} value={country.countryCode} >{country.name}</option>
                          )
                        })}
                      </FormControl>
                    </FormGroup>
                  </Col>
                  <Col sm={3}>
                    <FormGroup controlId="city" className={cx({'has-error': errors.city})}>
                      <ControlLabel>City</ControlLabel>
                      <FormControl type="text" ref="city" placeholder="" onChange={(e) => this.validate(e, 'city')}/>
                    </FormGroup>
                  </Col>
                  <Col sm={3}>
                    <FormGroup controlId="province" className={cx({'has-error': errors.province})}>
                      <ControlLabel>State/Province</ControlLabel>
                      <FormControl type="text" ref="province" placeholder="" onChange={(e) => this.validate(e, 'province')}/>
                    </FormGroup>
                  </Col>
                </Row>
                {status == 'saving'? <div className="form-overlay"></div>: null}
              </Form>
            </Col>
            <Col sm={5} className="bg-grey">
            {
              rightSide == 'credits'? <SelectedCredits />: (rightSide == 'times'? <SelectedTimes />: <SelectedPlan />)
            }
            </Col>
          </Row>
        </Modal.Body>
        <Modal.Footer>
          <Button lg type='button' className="btn-sq btn-hollow btn-cancel pull-left" onClick={::this.onClose} disabled={status == 'saving'}>Cancel</Button>
          <div className="stripe-encrypt">
            <Icon bundle='dripicons' glyph="lock" />
            <span>SSL Encryption - Powered by <a href="https://stripe.com" target="_blank">Stripe</a></span>
          </div>
          <Button lg type='button' bsStyle='primary' className="btn-sq btn-hollow btn-wider" onClick={::this.onBack} disabled={status == 'saving'}>Back</Button>
          <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={::this.onNext}>
            {status == 'saving'? <ButtonLoader primary={true} />: <span>Next</span>}
          </Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.billing.status,
  statusText: state.billing.statusText,
  billing: state.billing.billing,
});

export default connect(mapStateToProps)(BiliingInfo);
