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

class Invoice extends React.Component {
  viewDetails() {
    const { invoice, router, dispatch } = this.props;

    dispatch(actions.setPaymentDetail(invoice));
    router.push('/settings/purchase/detail');
  }

  render() {
    const { invoice } = this.props;

    return (
      <li>
        <Row>
          <Col md={2} className="text-center"><span>{moment(invoice.created || invoice.date, 'X').format('MM/DD/YYYY')}</span></Col>
          <Col md={8}><span>{invoice.statement_descriptor || invoice.description}</span></Col>
          <Col md={1} className="text-right"><span>${(invoice.amount/100).toFixed(2)}</span></Col>
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

export default connect(mapStateToProps)(withRouter(Invoice));
