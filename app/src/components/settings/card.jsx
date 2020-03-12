import R from 'ramda';
import cx from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import {
    Row,
    Col,
    Icon,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';

class Card extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      error: false
    };
  }

  componentWillReceiveProps (nextProps) {
    
  }

  makeDefaultCard() {
    const { customer, card, dispatch } = this.props;
    
    dispatch(actions.makeDefaultCard(customer.id, card.id));
  }

  removeCard() {
    const { customer, card, dispatch } = this.props;

    if(confirm("Are you sure to remove this card?")) {
      dispatch(actions.removeCard(customer.id, card.id));
    }
  }

  render() {
    const { card, defaultCard, removable } = this.props;
    let brand = null;
    
    if(card.brand == 'Visa')
      brand = <Icon bundle="fontello" glyph="visa" />;
    else if(card.brand == 'MasterCard')
      brand = <Icon bundle="fontello" glyph="mastercard" />;
    else if(card.brand == 'American Express')
      brand = <Icon bundle="fontello" glyph="amex" />;
    else if(card.brand == 'Discover')
      brand = <Icon bundle="fontello" glyph="discover" />;
    else
      brand = <span>{card.brand}</span>;

    return (
      <div className="card-row">
        <Row>
          <Col sm={6}>
            {brand} <span>card ending in *{card.last4}</span>
          </Col>
          <Col sm={3} className="text-right">
            {card.id == defaultCard ? 'Default': <a href="javascript:;" onClick={::this.makeDefaultCard}>Make Default</a>}
          </Col>
          <Col sm={3} className="text-right">
            {removable ? <a href="javascript:;" onClick={::this.removeCard}>Remove card</a>: null}
          </Col>
        </Row>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.payment.status,
  statusText: state.payment.statusText,
  customer: state.payment.customer,
});

export default connect(mapStateToProps)(Card);
