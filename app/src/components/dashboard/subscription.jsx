import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { withRouter, Link } from 'react-router';
import {
  Row,
  Col,
  Grid,
  Button,
  Icon,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import Coupon from './coupon.jsx';

class Subscription extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { showCoupon: false };
  }

  componentWillReceiveProps(nextProps) {
    const { customer, status: nextStatus } = nextProps;
    const { status, createSubscription, saveCustomer } = this.props;

    if(customer && customer.subscriptions) {
      if(customer.subscriptions.data.length == 0) {
        createSubscription(customer.id);
      }
    }
  }

  handleChange(e) {
    e.preventDefault();
    const { router, choosePlan } = this.props;

    choosePlan({returnUrl: router.location.pathname});
    router.push('purchase/choose-plan');
  }

  openCoupon() {
    this.setState({showCoupon: true});
  }

  closeCoupon() {
    this.setState({showCoupon: false});
  }

  render() {
    const { customer, userPlan } = this.props;

    let subscription = null;
    let card = null;
    let brand = null;

    if(customer) {
      subscription = customer.subscriptions ? customer.subscriptions.data[0]: null;
      card = customer.sources ? customer.sources.data[0]: null;
    }

    if(card) {
      if(card.brand == 'Visa')
        brand = <Icon bundle="fontello" glyph="visa" />;
      else if(card.brand == 'MasterCard')
        brand = <Icon bundle="fontello" glyph="mastercard" />;
      else if(card.brand == 'American Express')
        brand = <Icon bundle="fontello" glyph="amex" />;
      else if(card.brand == 'Discover')
        brand = <Icon bundle="fontello" glyph="discover" />;
      else
        brand = card.brand;
    }

    if(subscription && userPlan) {
      return (
        <Col md={6}>
          <div className="white-block current-subscription">
            <h4 className="title">
              <Row>
                <Col md={9} style={{'fontSize': '16px'}}>
                  You're subscribed to the <strong>{userPlan.name} Plan</strong>
                </Col>
                <Col md={3} style={{'textAlign': 'right'}}>
                  ${parseInt(subscription.plan.amount)/100} <span className="small">/mo</span>
                </Col>
              </Row>
            </h4>
            <Row>
              <Col md={6}>
                <p>Start Date: {moment(subscription.current_period_start, 'X').format('MMMM D, YYYY')}</p>
                { card ?
                  <p>{brand} card ending in *{card.last4} <Link to="/settings/billing-info">Change</Link></p> :
                  null
                }
              </Col>
              <Col md={6}>
                <p>Renewal Date: {moment(subscription.current_period_end, 'X').add(1, 'd').format('MMMM D, YYYY')}</p>
                <p className="uppercase">
                  <Icon className={subscription.status} bundle="fontello" glyph="circle" /> {subscription.status}
                </p>
              </Col>
            </Row>
            <div className="flex-space"></div>
            <Row>
              <Col md={6}>
                <Button lg type='button' bsStyle='primary' className="btn-block btn-hollow" onClick={::this.handleChange}>Change Subscription</Button>
              </Col>
              <Col md={6} className="text-right pt2">
                <strong className="pr1">COUPON: </strong>
                <a href="javascript:;" onClick={::this.openCoupon}>Got a code?</a>
              </Col>
            </Row>
          </div>

          <Coupon show={this.state.showCoupon} close={::this.closeCoupon} />
        </Col>
      );
    }
    else {
      return (
        <Col md={6} lg={5}>
          <div className="white-block current-subscription">
            { userPlan ?
              <h4 className="title">You're subscribed to the <strong>{userPlan.name} Plan</strong></h4> :
              <h4 className="title">You have not subscribed a plan.</h4>
            }
            { card ?
              <p>{brand} card ending in *{card.last4} <Link to="/settings/billing-info">Change</Link></p> :
              null
            }
            <div className="flex-space"></div>
            <Row>
              <Col md={6}>
                <Button lg type='button' bsStyle='primary' className="btn-block btn-hollow" onClick={::this.handleChange}>Change Subscription</Button>
              </Col>
              <Col md={6} className="text-right pt2">
                <strong className="pr1">COUPON: </strong>
                <a href="javascript:;" onClick={::this.openCoupon}>Got a code?</a>
              </Col>
            </Row>
          </div>

          <Coupon show={this.state.showCoupon} close={::this.closeCoupon} />
        </Col>
      );
    }
  }
}

const mapStateToProps = (state) => ({
  userPlan: state.profile.userPlan,
  customer: state.payment.customer,
});

const mapDispatchToProps = (dispatch) => ({
  choosePlan: (options) => {
    dispatch(actions.choosePlan(options));
  },
  createSubscription: (customerId) => {
    dispatch(actions.upgradePlan({customerId, plan: 'starter-monthly'}));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(withRouter(Subscription));
