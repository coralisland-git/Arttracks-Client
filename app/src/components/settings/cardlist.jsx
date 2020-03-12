import R from 'ramda';
import cx from 'classnames';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import {
    Row,
    Col,
    Grid,
    Button,
    Icon,
    Alert,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import Card from './card.jsx';
import CreateCard from './create-card.jsx';

class CardList extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      openCreate: false,
      status: null,
    };
  }

  componentWillReceiveProps (nextProps) {
    let status = null;

    if(nextProps.status == 'failed') {
      if(this.props.status == 'creating' || this.props.status == 'updating' || this.props.status == 'removing') {
        status = 'failed';
      }
    }

    this.setState({status});
  }

  removable() {
    const { customer } = this.props;
    
    if(customer) {
      let subscription = customer.subscriptions.data[0];
      let cards = customer.sources.data;

      if(subscription && subscription.status == 'active' && cards.length == 1)
        return false;
    }

    return true;
  }

  render() {
    const { statusText, customer } = this.props;
    const { openCreate, status } = this.state;
    let cards = [];
    let defaultCard = null;
    
    let alert = null;
    if(status == 'failed') {
      alert = <Alert danger>{statusText}</Alert>;
    }

    if(customer) {
      cards = customer.sources.data;
      defaultCard = customer.default_source;
    }
    
    return (
      <div className="payment-cards">
        <h4 className="header">Saved Payment Options
          <a href="#"><Icon bundle="fontello" glyph="help-circled-alt" /></a>
        </h4>
        <hr className="transparent" />
        {alert}
        <div className="cards-list">
          {cards.map((card, i) => <Card key={i} card={card} defaultCard={defaultCard} removable={this.removable()}/>)}
        </div>
        {!this.removable()?
            <p className="text-danger small">You have active subscription, so at least one payment source is required.</p>
            : null
        }
        <hr className="transparent" />
        <Button lg bsStyle='primary' className="btn-sq" onClick={() => this.setState({openCreate: true})}>Add new card</Button>
        <CreateCard show={openCreate} close={() => this.setState({openCreate: false})}/>
        <hr className="transparent" />
        <hr className="transparent" />
        <p>
          <b>Security Information</b><br />
          <span className="small">Cards can be used for your future orders on ArtTracks. No real credit cards are saved,
            only special token on the side of <a href="https://stripe.com" target="_blank">Stripe</a>,
            the payment processor, that can be used in ArtTracks only.
          </span>
        </p>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.payment.status,
  statusText: state.payment.statusText,
  customer: state.payment.customer,
});

export default connect(mapStateToProps)(CardList);
