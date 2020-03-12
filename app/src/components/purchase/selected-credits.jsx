import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import InlineSVG from 'svg-inline-react';
import cx from 'classnames';
import R from 'ramda';
import { Row, Col, Icon } from '@sketchpixy/rubix';
import actions from '../../redux/actions';

class SelectedCredits extends React.Component {
  render() {
    const { creditsTotal, credits } = this.props;

    return (
      <div className="selected-credit">
        <strong>You have selected:</strong>
        <h3 className="mt3">{credits.count} Pay-As-You-Go Credits</h3>
        <p>Pay-as-you-go credits are used for in-app purchases like HD uprades, special efx, and cretive licensing.</p>
        <hr className="mt2 mb3"/>
        <Row>
          <Col sm={6}>
            Current balance: <h5 className="mt1 mb1">{creditsTotal}</h5>
          </Col>
          <Col sm={6}>
            New balance: <h5 className="mt1 mb1">{creditsTotal + credits.count}</h5>
          </Col>
        </Row>
        <hr className="mt2 mb3"/>
        <p className="h3">${credits.price.toFixed(2)} USD
          {credits.discount > 0 ? <span className="h5 text-attention ml2"> You save: ${credits.discount.toFixed(2)} USD</span>: null}
        </p>
        <p className="small">*Pay-as-you-go credits will expire 1 year from purchase.</p>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  credits: state.buy.credits,
  creditsTotal: state.profile.credits_total,
});

export default connect(mapStateToProps)(SelectedCredits);
