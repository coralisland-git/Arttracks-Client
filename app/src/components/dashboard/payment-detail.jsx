import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {
  Row,
  Col,
  Grid,
  Button,
  Icon,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';

class PaymentDetail extends React.Component {
  render() {
    const { detail, customer } = this.props;
    let card = null;
    let brand = null;
    let date = null;

    if(detail && detail.object == 'invoiceitem') {
      card = customer.sources.data[0];
      date = moment(detail.date, 'X').format('MMMM D, YYYY');
    }
    else if(detail && detail.object == 'charge') {
      card = detail.source;
      date = moment(detail.created, 'X').format('MMMM D, YYYY');
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
      
    return (
      <div className="body-container">
        <div className="container__with-scroll">
          <Grid>
            <Row>
              <Col sm={12} md={8} lg={6}>
                <h3 className="header"><Link to="/settings">&larr; Back to overview</Link></h3>
                { detail ?
                  <div className="payment-detail">
                    <h4 className="text-success mb5">Details</h4>
                    <Row>
                      <Col sm={6}></Col>
                      <Col sm={6} className="text-right">{date}</Col>
                    </Row>
                    <hr className="transparent"/>
                    <Row>
                      <Col sm={10}>DESCRIPTION</Col>
                      <Col sm={2} className="text-right">AMOUNT</Col>
                    </Row>
                    <hr />
                    <Row>
                      <Col sm={10}>{detail.description || detail.statement_descriptor}</Col>
                      <Col sm={2} className="text-right">${(detail.amount/100).toFixed(2)}</Col>
                    </Row>
                    <hr />
                    <Row>
                      <Col sm={2} smOffset={8} className="text-right">Subtotal</Col>
                      <Col sm={2} className="text-right">${(detail.amount/100).toFixed(2)}</Col>
                    </Row>
                    <hr />
                    <Row>
                      <Col sm={2} smOffset={8} className="text-right text-success">Discount</Col>
                      <Col sm={2} className="text-right text-success">$0.00</Col>
                    </Row>
                    <hr />
                    <Row>
                      {card? <Col sm={8}>{brand} card ending in *{card.last4}</Col>: <Col sm={8}></Col>}
                      <Col sm={2} className="text-right">Total</Col>
                      <Col sm={2} className="text-right">${(detail.amount/100).toFixed(2)}</Col>
                    </Row>
                  </div>
                  :
                  null
                }
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  customer: state.payment.customer,
  detail: state.payment.detail,
});

export default connect(mapStateToProps)(PaymentDetail);
