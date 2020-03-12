import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  Row,
  Col,
  Grid,
  Button,
  Icon,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';

class Payment extends React.Component {
  viewDetails() {
    const { payment, router, dispatch } = this.props;

    dispatch(actions.setPaymentDetail(payment));
    router.push('/settings/purchase/detail');
  }

  render() {
    const { payment } = this.props;

    return (
      <li>
        <Row>
          <Col md={2} className="text-center"><span>{moment(payment.created, 'X').format('MM/DD/YYYY')}</span></Col>
          <Col md={8}><span>{payment.description}</span></Col>
          <Col md={1} className="text-right"><span>${(payment.amount/100).toFixed(2)}</span></Col>
          <Col md={1} className="text-center">
            <a className="link-detail" onClick={::this.viewDetails}>
              <Icon bundle="ikons" glyph="arrow-right" />
            </a>
          </Col>
        </Row>
      </li>
    );
  }
}

const mapStateToProps = (state) => ({
  customer: state.payment.customer,
});

export default connect(mapStateToProps)(withRouter(Payment));
