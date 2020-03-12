import React from 'react';
import SidebarContainer from '../components/common/sidebar-container.jsx';
import actions from '../redux/actions';
import PurchasePopup from '../components/purchase/purchase-popup.jsx';

export class DefaultContainer extends React.Component {
  render() {
    return (
      <SidebarContainer {...this.props}>
        {this.props.children}
      </SidebarContainer>
    );
  }
}

export class PopupContainer extends React.Component {
  closePurchasePopup() {
    const { dispatch } = this.props;

    dispatch(actions.closePuchasePopup());
  }

  render() {
    const { dispatch, router } = this.props;

    return (
      <div>
        {this.props.children}
        <PurchasePopup close={()=>this.closePurchasePopup()} dispatch={dispatch} router={router} />
      </div>
    );
  }
}
