import React from 'react';
import { connect } from 'react-redux';
import actions from '../../redux/actions';
import PlanUpgrade from './plan-upgrade.jsx';
import BuyCredits from './buy-credits.jsx';
import BuyTimes from './buy-times.jsx';
import BillingInfo from './billing-info.jsx';
import PaymentInfo from './payment-info.jsx';
import PaymentSuccess from './payment-success.jsx';

class PurchasePopup extends React.Component {
  constructor(...props) {
    super(...props);
    
    this.state = { 
      
    };
  }

  componentWillReceiveProps(newProps) {
    
  }

  render() {
    const { purchasePopup, ...props } = this.props;
    const section = purchasePopup? purchasePopup.section: null;
    
    switch(section) {
      case 'upgradePlan':
        return <PlanUpgrade {...props} {...purchasePopup} />;
      case 'billingInfo':
        return <BillingInfo {...props} {...purchasePopup} />;
      case 'paymentInfo':
        return <PaymentInfo {...props} {...purchasePopup} />;
      case 'buyCredits':
        return <BuyCredits {...props} {...purchasePopup} />;
      case 'buyTimes':
        return <BuyTimes {...props} {...purchasePopup} />;
      case 'paymentSuccess':
        return <PaymentSuccess {...props} {...purchasePopup} />;
      default:
        return null;
    }
  }
}

const mapStateToProps = (state) => ({
  userPlan: state.profile.userPlan,
  purchasePopup: state.popup.purchase,
  selectedPlan: state.plan.selectedPlan,
});

export default connect(mapStateToProps)(PurchasePopup);