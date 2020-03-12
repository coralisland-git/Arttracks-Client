import React from 'react';
import { connect } from 'react-redux';
import actions from '../redux/actions';
import ReactGA from 'react-ga';

//console.log = function() {};

class AppContainer extends React.Component {
  constructor(props) {
    super(props);
    this.state ={ current_path: props.location.pathname };
  }

  componentWillMount() {
    this.props.dispatch(actions.getPlans());
  }

  componentWillReceiveProps (nextProps) {
    const { isAuthenticated, email, paying, customer, plans, planStatus, payingStatus, paymentStatus, dispatch } = nextProps;

    if(plans && planStatus == 'gotPlans') {
      plans.forEach((plan) => {
        if(plan && plan.hasQuotas !== true) {
          this.props.dispatch(actions.getPlanQuotas(plan.id));
        }
      });
    }
    else if(isAuthenticated) {
      if(payingStatus == 'got' && this.props.planStatus == planStatus && this.props.email == email
        && this.props.paymentStatus == paymentStatus && paymentStatus != 'gettingCustomer' && paymentStatus != 'creatingCustomer') {
        if(paying && paying.stripe_token && paying.stripe_token != '') {
          dispatch(actions.getStripeCustomer(paying.stripe_token));
        }
        else {
          if(email) {
            dispatch(actions.createStripeCustomer({email}));
          }
        }
      }
      else if(this.props.paymentStatus == 'gettingCustomer' && paymentStatus == 'failed') {
        if(email) {
          dispatch(actions.createStripeCustomer({email}));
        }
      }
      else if(this.props.paymentStatus == 'gettingCustomer' && paymentStatus == 'gotCustomer') {
        if(customer && customer.deleted && email) {
          dispatch(actions.createStripeCustomer({email}));
        }
      }
      else if(this.props.paymentStatus == 'creatingCustomer' && paymentStatus == 'createdCustomer') {
        dispatch(actions.savePayingInfo(customer));
      }
    }
  }

  componentDidUpdate() {
    let { current_path } = this.state;
    let { location } = this.props;

    // Only run if current_path changes
    if(current_path != location.pathname) {
      ReactGA.set({ page: this.props.location.pathname + this.props.location.search });
      ReactGA.pageview(this.props.location.pathname + this.props.location.search);
      this.setState({ current_path: location.pathname });
    }
  }

  componentDidMount() {
    let { current_path } = this.state;

    // Only run once
    ReactGA.initialize('UA-98694299-1');
    ReactGA.set({ page: this.props.location.pathname + this.props.location.search });
    ReactGA.pageview(this.props.location.pathname + this.props.location.search);
  }

  render() {
    return (
      this.props.children
    );
  }
}

const mapStateToProps = (state) => ({
  isAuthenticated: state.auth.isAuthenticated,

  planStatus: state.plan.status,
  plans: state.plan.plans,

  payingStatus: state.paying.status,
  paying: state.paying.paying,

  email: state.profile.email,

  paymentStatus: state.payment.status,
  customer: state.payment.customer,
});

export default connect(mapStateToProps)(AppContainer);
