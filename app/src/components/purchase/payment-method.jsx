import React from 'react';
import InlineSVG from 'svg-inline-react';
import {
  Modal,
  Row,
  Col,
  Button,
  Alert,
} from '@sketchpixy/rubix';

class PaymentMethod extends React.Component {
  render() {
    const { open, close, selectedPlan } = this.props;
    
    return (
      <Modal className="purchase-popup" show={open} onHide={close}>
        <Modal.Header closeButton className="text-center">
          <Modal.Title>Review your purchase</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Row className="purchase-item">
            <Col sm={9}>
              <span>(1) Month <strong>{selectedPlan.name}</strong> Plan Subscription Update</span>
            </Col>
            <Col sm={3} className="text-right">
              <span>$25.00</span>
            </Col>
          </Row>
          <div className="payment-methods">
            <p>Please select a payment method from below.</p>
            <Row>
              <Col sm={6}>
                <div className="payment-method">
                  <img src="/imgs/paypal.png" />
                </div>
                <p>What is PayPal?</p>
              </Col>
              <Col sm={6}>
                <div className="payment-method selected">
                  <img src="/imgs/stripe.png" />
                </div>
                <p>via Stripe</p>
              </Col>
            </Row>
          </div>
        </Modal.Body>
        <Modal.Footer>
          <Button lg type='button' className="btn-sq btn-hollow btn-cancel pull-left" onClick={close}>Cancel</Button>
          <Button lg type='button' bsStyle='primary' className="btn-sq btn-wider" onClick={() => this.props.onUpdateSection('paymentSuccess')}>Next</Button>
        </Modal.Footer>
      </Modal>
    );
  }
}

export default PaymentMethod;
