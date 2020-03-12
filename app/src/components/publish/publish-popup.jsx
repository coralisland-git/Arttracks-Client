import React from 'react';
import AccountSelect from './account-select.jsx';
import PreviewEdit from './preview-edit.jsx';
import Scheduled from './scheduled.jsx';

class PublishPopup extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      section: 'account',
      selectedAccount: null,
    };
  }

  onClose() {
    this.setState({section: 'account'});
    this.props.closeModal();
  }

  onUpdateSection (section) {
    this.setState({section: section});
  }

  onSelectAccount (account) {
    this.setState({selectedAccount: account});
  }

  render() {
    if(this.state.section == 'account') {
      return (<AccountSelect {...this.props} {...this.state} onUpdateSection={::this.onUpdateSection} onSelectAccount={::this.onSelectAccount} close={::this.onClose}/>);
    }
    else if(this.state.section == 'preview') {
      return (<PreviewEdit {...this.props} {...this.state} onUpdateSection={::this.onUpdateSection} close={::this.onClose}/>);
    }
    else {
      return (<Scheduled {...this.props} {...this.state} close={::this.onClose}/>);
    }
  }
}

export default PublishPopup;
