import React from 'react';
import { connect } from 'react-redux';
import { Alert, Row, Col } from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import { getProviderIdByName, getProviderById } from '../../utils';
import SocialProvider from './social-provider.jsx';
import ConnectedAccount from './connected-account.jsx';

class ConnectedAccounts extends React.Component {
  constructor(...args) {
    super(...args);
    const providerName = this.props.params.providerName ? this.props.params.providerName : null;
    const returnStatus = this.props.params.returnStatus ? this.props.params.returnStatus : null;
    this.state = {
      providerName: providerName,
      returnStatus: returnStatus,
      checked: false,
      filters: [],
      filter: "All"
    };
  }

  componentWillMount() {
    const { dispatch, providers, connectedUser, status, connects } = this.props;

    if(!providers.length) {
      dispatch(actions.getProviders());
    }
    if(!connects.length) {
      dispatch(actions.getConnects());
    }
  }

  componentWillReceiveProps (nextProps) {
    const { providerName, returnStatus, checked } = this.state;
    const { dispatch, providers, connectedUser, status, connects } = nextProps;

    if(status == 'gotConnects') {
      if (providerName && returnStatus != 'failed' && !checked) {
        if (connectedUser && providerName == connectedUser.provider && providers.length) {
          const providerId = getProviderIdByName(providerName, providers);
          if (providerId > 0) {
            this.setState({checked: true});
            dispatch(actions.addConnect(providerId, connectedUser, connects));
          }
        }
      }
    }

    const filters = [];
    connects.forEach(connect => {
      let provider = getProviderById(connect.provider, providers);
      if(provider && filters.indexOf(provider.name) === -1)
        filters.push(provider.name);
    });

    this.setState({filters: filters});
  }

  changeFilter(e) {
    this.setState({filter: e.target.value});
  }

  render() {
    const { providers, connects, status, statusText } = this.props;
    const { connectProvider, returnStatus, filter, filters } = this.state;

    let alert = null;
    if(status == 'added') {
      // alert = <Alert success>{ statusText }</Alert>;
    }
    else if(status == 'failed') {
      alert = <Alert danger>{ statusText }</Alert>;
    }
    else if(connectProvider && returnStatus == 'failed') {
      alert = <Alert danger>It has been failed to connect {connectProvider}.</Alert>;
    }
    else if(status == 'saving') {
      alert = <Alert info>Saving, please wait...</Alert>;
    }
    else if(status == 'deleting') {
      alert = <Alert info>Deleting, please wait...</Alert>;
    }
    else if(status == 'adding') {
      alert = <Alert info>Adding, please wait...</Alert>;
    }

    return (
      <div className="body-sidebar__container wide-sidebar">
        <div className="container__with-scroll">
          <h3 className="header">Connected Accounts</h3>

          <div id="alert-box">{ alert }</div>

          {/*<p>Leverage our built-in power of distribution and share to many different places by connecting your accounts to the services below.
            &nbsp;<a href="javascript:;">Upgrade to Pro</a> to connect up to 12 networks at once!</p>*/}
          <p>Leverage our built-in power of distribution and share to many different places by connecting your account to the services below. Don't see a service that you use, no worries, there are many more to come. We're working on it!</p>

          <hr className="transparent" />

          <ul className="providers-list row">
            { providers.map(provider => <SocialProvider key={ provider.id } provider={ provider } {...this.props} />) }
          </ul>
        </div>
        <div className="body-sidebar__element pl3-imp pr3-imp">
          <Row className="mt3">
            <Col sm={8} className="pl0 pr0">
              <h4 className="mt2">
                Your Connections
              </h4>
            </Col>
            <Col sm={4} className="pl0 pr0 mt2 text-right">
              <select className="provider-filter" onChange={::this.changeFilter}>
                <option value="All">All</option>
                { filters.map((filter, i) => <option key={i} value={filter}>{filter}</option>) }
              </select>
            </Col>
          </Row>
          <hr className="mt0 mb3" />
          <ul className="connected-accounts">
            { !connects.length &&
              <li className="text-center zero-state">
                <Row>
                  <Col md={12} className="pl0">
                    <img className="zero-icon" src="/imgs/icons/icon_connect.png" alt="Connect account" />
                    <h5>No connected accounts yet</h5>
                    <p>Connect accounts to start importing and exporting from your favorite services.</p>
                  </Col>
                </Row>
              </li> }
            { connects.map(connect => {
              let provider = getProviderById(connect.provider, providers);
              if((provider && provider.name == filter) || filter == "All")
                return <ConnectedAccount key={connect.id} connectedAccount={connect} {...this.props} />;
              else
                return null;
            }) }
          </ul>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.provider.status,
  statusText: state.provider.statusText,
  providers: state.provider.providers,
  connects: state.provider.connects,
  connectedUser: state.provider.connectedUser,
  userPlan: state.profile.userPlan,
  plans: state.plan.plans,
});

export default connect(mapStateToProps)(ConnectedAccounts);
