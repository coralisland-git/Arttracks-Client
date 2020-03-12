import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import InlineSVG from 'svg-inline-react';
import cx from 'classnames';
import R from 'ramda';
import { Row, Col, Icon } from '@sketchpixy/rubix';
import actions from '../../redux/actions';

class SelectedPlan extends React.Component {
  render() {
    const { billing, order, selectedPlan } = this.props;

    if(billing && order && selectedPlan) {
      return (
        <div className="selected-plan">
          <strong>Plan selected:</strong>
          <h3 className="mt3">{ order.term == 'monthly'? 'Monthly': 'Yearly' } {selectedPlan.name} Plan</h3>
          <p>${order.requested_plan_cost}/{ order.term == 'monthly'? 'month': 'Year' }</p>
          <p>No contract, no committment, Cancel anytime.</p>
          <strong>Billing Conditions</strong>
          <p className="small">{order.billing_conditions}</p>
          <p className="small">{order.cancellation_policy}</p>
        </div>
      );
    }
    else {
      return null;
    }
  }
}

const mapStateToProps = (state) => ({
  billing: state.billing.billing,
  order: state.plan.order,
  selectedPlan: state.plan.selectedPlan,
});

export default connect(mapStateToProps)(SelectedPlan);
