import React from 'react';
import { Button } from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import { checkMaxConnectedAccounts } from '../../services/plan-check';
import ButtonLoader from '../common/button-loader.jsx';

class SocialProvider extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { loading: false };
  }

  connect() {
    const { provider, connects, dispatch, userPlan, plans } = this.props;

    this.setState({loading: true});

    if(!checkMaxConnectedAccounts(userPlan, plans, connects.length)) {
      dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "max_connected_accounts" }));
    }
    else {
      location.href = `/connect/${provider.name.toLowerCase()}`;
    }
  }

  render() {
    const { provider } = this.props;
    const logo = provider.logo? <img src={provider.logo} />: null;

    return (
      <li className="col-md-4">
        <div className="provider">
          <div className="provider-logo">
            { logo }
          </div>
          <h4 className="name">
            { provider.name }
          </h4>
          <p className="description">
            { provider.description }
          </p>
          <Button lg type='submit' bsStyle='primary' className="btn-block btn-hollow" onClick={::this.connect}>
            { this.state.loading ? <ButtonLoader primary={false} />: 'Add' }
          </Button>
        </div>
      </li>
    );
  }
}

export default SocialProvider;
