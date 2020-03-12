import R from 'ramda';
import cx from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import ReactTimeout from 'react-timeout';
import EasyCountriesList from 'easy-countries-list';
import {
    Row,
    Col,
    Grid,
    Form,
    FormGroup,
    FormControl,
    ControlLabel,
    Button,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import CardList from './cardlist.jsx';
import ButtonLoader from '../common/button-loader.jsx';

class BillingInfo extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      errors: {},
      status: null,
    };
  }

  componentDidMount () {
    const { billing } = this.props;

    ReactDOM.findDOMNode(this.refs.companyName).value = billing? billing.company_name: '';
    ReactDOM.findDOMNode(this.refs.firstName).value = billing? billing.first_name: '';
    ReactDOM.findDOMNode(this.refs.lastName).value = billing? billing.last_name: '';
    ReactDOM.findDOMNode(this.refs.street).value = billing? billing.street: '';
    ReactDOM.findDOMNode(this.refs.unit).value = billing? billing.unit: '';
    ReactDOM.findDOMNode(this.refs.zipcode).value = billing? billing.zipcode: '';
    ReactDOM.findDOMNode(this.refs.province).value = billing? billing.state: '';
    ReactDOM.findDOMNode(this.refs.city).value = billing? billing.city: '';
    ReactDOM.findDOMNode(this.refs.country).value = billing? billing.country: '';

    this.setState({status: null, errors: {}});
  }

  componentWillReceiveProps (nextProps) {
    const { status: nextStatus, billing } = nextProps;
    const { dispatch, status } = this.props;

    if(status == 'saving' && nextStatus == 'saved') {
      this.setState({status: 'success'});

      this.props.setTimeout(() => {
        this.setState({status: null});
      }, 3000);
    }
    else if(status == 'saving' && nextStatus == 'failed') {
      this.setState({status: 'failed'});
    }
    else {
      this.setState({status: nextStatus});
    }
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
    let companyName = ReactDOM.findDOMNode(this.refs.companyName).value;
    let firstName = ReactDOM.findDOMNode(this.refs.firstName).value;
    let lastName = ReactDOM.findDOMNode(this.refs.lastName).value;
    let street = ReactDOM.findDOMNode(this.refs.street).value;
    let unit = ReactDOM.findDOMNode(this.refs.unit).value;
    let zipcode = ReactDOM.findDOMNode(this.refs.zipcode).value;
    let province = ReactDOM.findDOMNode(this.refs.province).value;
    let city = ReactDOM.findDOMNode(this.refs.city).value;
    let country = ReactDOM.findDOMNode(this.refs.country).value;

      return {companyName, firstName, lastName, street, unit, zipcode, city, province, country};
  }

  save(e) {
    e.preventDefault();

    const { billing, dispatch } = this.props;
    const formdata = this.formdata();
    const errors = R.mapObjIndexed((i, key, obj) => true, R.filter((v) => (!v || v == ''), formdata));
    delete errors.companyName;
    delete errors.unit;

    this.setState({status: null});

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
    const { statusText } = this.props;
    const { errors, status } = this.state;
    const countries = EasyCountriesList.getAllCountries();

    let alert = null;
    if(status == 'failed') {
      alert = <FormGroup className='has-error'>
        <span className="help-block" dangerouslySetInnerHTML={{__html: statusText}}></span></FormGroup>;
    }
    else if(status == 'success') {
      alert = <FormGroup className='has-success'>
        <span className="help-block">You have successfully changed the billing information.</span></FormGroup>;
    }

    return (
      <div className="body-sidebar__container wide-sidebar billing-info">
        <div className="container__with-scroll">
          <h3 className="header">Billing Information</h3>
          <Form onSubmit={::this.save}>
            <FormGroup controlId="companyName">
              <ControlLabel>Company Name</ControlLabel>
              <FormControl type="text" ref="companyName" placeholder="" />
            </FormGroup>
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
                  <FormControl type="text" ref="city" placeholder="Los Angeles" onChange={(e) => this.validate(e, 'city')}/>
                </FormGroup>
              </Col>
              <Col sm={3}>
                <FormGroup controlId="province" className={cx({'has-error': errors.province})}>
                  <ControlLabel>State/Province</ControlLabel>
                  <FormControl type="text" ref="province" placeholder="" onChange={(e) => this.validate(e, 'province')}/>
                </FormGroup>
              </Col>
            </Row>
            <hr className="transparent" />
            <Row>
              <Col md={3}>
                <Button lg type='submit' bsStyle='primary' className="btn-sq btn-block">
                  { status == 'saving' ? <ButtonLoader primary={true} />: 'Save' }
                </Button>
              </Col>
            </Row>
            <hr className="transparent" />
            {alert}
          </Form>
        </div>
        <div className="body-sidebar__element pl3-imp pr3-imp">
          <CardList />
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.billing.status,
  statusText: state.billing.statusText,
  billing: state.billing.billing,
});

export default connect(mapStateToProps)(ReactTimeout(BillingInfo));
