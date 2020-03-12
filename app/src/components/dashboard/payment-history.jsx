import R from 'ramda';
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Grid,
  Button,
  Icon,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import Invoice from './invoice.jsx';
import Payment from './payment.jsx';

class PaymentHistory extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      filter: 'all',
      loaded: false,
    };
  }

  componentWillMount() {
    const { customer, dispatch } = this.props;
    const { loaded } = this.state;

    if(customer && !customer.deleted && !loaded) {
      this.setState({loaded: true});

      dispatch(actions.getInvoices(customer.id));
      dispatch(actions.getPayments(customer.id));
    }
  }

  componentWillReceiveProps(newProps) {
    const { customer } = newProps;
    const { dispatch } = this.props;
    const { loaded } = this.state;

    if(customer && !customer.deleted && !loaded) {
      this.setState({loaded: true});

      dispatch(actions.getInvoices(customer.id));
      dispatch(actions.getPayments(customer.id));
    }
  }

  setFilter(filter) {
    this.setState({filter: filter});
  }

  filter() {
    const { invoices, payments } = this.props;
    const { filter } = this.state;
    let histories = [];

    invoices.forEach(invoice => {
      histories.push({time: invoice.date, invoice, type: 'subscriptions'});
    });

    payments.forEach(payment => {
      let type = '';

      if(payment.description) {
        if(payment.description.indexOf('seconds') !== -1) {
          type = 'time';
        }
        else if(payment.description.indexOf('credits') !== -1) {
          type = 'credits';
        }
      }

      if(payment.invoice) {
        const index = R.findIndex(R.propEq('id', payment.invoice))(invoices);
        if(index == -1) {
          histories.push({time: payment.created, invoice: payment, type: 'subscriptions'});
        }
      }
      else {
        histories.push({time: payment.created, payment, type});
      }
    });

    let sortedHistories = R.reverse(R.sortBy(R.prop('time'))(histories));

    if(filter == 'all') {
      return sortedHistories;
    }
    else {
      return R.filter((history) => history.type == filter, sortedHistories);
    }
  }

  render() {
    const { filter } = this.state;

    return (
      <Col md={12}>
        <Row>
          <Col md={6}><h3>Purchase History</h3></Col>
          <Col md={6} className="text-right notification-filters pt6">
            Show:
            <a href="javascript:;" className="view-filter" onClick={()=>this.setFilter('all')}>{ filter == "all"? <b>All</b>: "All"}</a>
            <a href="javascript:;" className="view-filter" onClick={()=>this.setFilter('subscriptions')}>{ filter == "subscriptions"? <b>Subscriptions</b>: "Subscriptions"}</a>
            <a href="javascript:;" className="view-filter" onClick={()=>this.setFilter('time')}>{ filter == "time"? <b>Time</b>: "Time"}</a>
            <a href="javascript:;" className="view-filter" onClick={()=>this.setFilter('credits')}>{ filter == "credits"? <b>Credits</b>: "Credits"}</a>
          </Col>
        </Row>
        <ul className="payments">
          {
            this.filter().length ? 
              this.filter().map((history, i) => (
                history.invoice?
                  <Invoice key={i} invoice={history.invoice} />:
                  <Payment key={i} payment={history.payment} />
              ))
            :
              <li>
                <Row>
                  <Col md={12} className="text-center">
                    No current payment history
                  </Col>
                </Row>
              </li>
          }
        </ul>
      </Col>
    );
  }
}

const mapStateToProps = (state) => ({
  customer: state.payment.customer,
  userPlan: state.profile.userPlan,
  invoices: state.payment.invoices,
  payments: state.payment.payments,
});

export default connect(mapStateToProps)(PaymentHistory);
