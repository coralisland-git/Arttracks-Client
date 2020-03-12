import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import cookie from 'react-cookie';
import R from 'ramda';
import InlineSVG from 'svg-inline-react';
import actions from '../../redux/actions';
import classNames from 'classnames';
import { getProviderById } from '../../utils';

import {
  Modal,
  Button,
  Alert,
} from '@sketchpixy/rubix';
import { svgIconAddAccount, svgIconNoAccount } from '../common/svg-icon.jsx';
import ButtonLoader from '../common/button-loader.jsx';
import AccountItem from './account-item.jsx';

class AccountSelect extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = {
      checking: false, 
      valid: null,
    };
  }

  componentWillReceiveProps (nextProps) {
    const { status, token } = nextProps;
    const { selectedAccount } = this.props;
    
    if(selectedAccount) {
      const extraData = JSON.parse(selectedAccount.extra_data);

      if(token == extraData.refreshToken) {
        if(status == 'valid') {
          this.setState({checking: false});
          this.props.onUpdateSection('preview');
        }
        else if(status == 'invalid') {
          this.setState({checking: false});
        }
        else if(status == 'validating') {
          this.setState({checking: true});
        }
      }
    }
  }

  onOpen () {
    this.props.onSelectAccount(null);
    this.setState({checking: false, valid: null});
  }

  onSelectAccount(account) {
    this.props.onSelectAccount(account);
  }

  onConnect(e) {
    e.preventDefault();

    const { router, close } = this.props;

    router.push('/settings/connected-accounts');
    close();
  }

  onNext(e) {
    e.preventDefault();

    const { selectedAccount, dispatch } = this.props;
    if(selectedAccount) {
      const extraData = JSON.parse(selectedAccount.extra_data);
      dispatch(actions.validateToken(selectedAccount));
    }
  }

  render() {
    const { selectedAccount, open, close, providers, connects, status, token } = this.props;
    const { checking } = this.state;
    
    return (
      <Modal className="pub-account-popup" show={open} onHide={close} onEntering={::this.onOpen}>
        <Modal.Header closeButton>
          <Modal.Title className="text-center">Select a delivery destination</Modal.Title>
        </Modal.Header>
        { connects.length == 0 ?
          <Modal.Body style={{borderRadius: '0 0 6px 6px'}}>
            <div className="no-account">
              <InlineSVG src={svgIconNoAccount} />
              <p>No connected accounts found.</p>
              <div className="actions">
                <Button lg type='button' disabled={false} className="btn-sq btn-hollow btn-cancel" onClick={close}>Cancel</Button>
                <Button lg type='button' bsStyle='primary' disabled={false} className="btn-sq btn-wider" onClick={::this.onConnect}>Connect</Button>
              </div>
            </div>
          </Modal.Body>
        :
          <Modal.Body>
            <p>Please select account from below to publish to.</p>
            <ul className="connected-accounts">
              <li className="add-account">
                <a href="javascript:;" onClick={::this.onConnect}>
                  <InlineSVG src={svgIconAddAccount} />
                  <p>Add account</p>
                </a>
              </li>
              { connects.map(account => {
                  if(account.active) {
                    const selected = selectedAccount && selectedAccount.id == account.id;
                    return <AccountItem key={account.id} connectedAccount={account} providers={providers}
                      selected={selected} status={status} checkToken={token}
                      onClick={()=>this.onSelectAccount(account)} onConnect={::this.onConnect}/>
                  }
              }) }
            </ul>
          </Modal.Body>
        }
        { connects.length > 0 ?
          <Modal.Footer>
            <Button lg type='button' disabled={checking} className="btn-sq btn-hollow btn-cancel pull-left" onClick={close}>Cancel</Button>
            <Button lg type='button' bsStyle='primary' disabled={!selectedAccount} className="btn-sq btn-wider" onClick={::this.onNext}>
              {checking? <ButtonLoader primary={true} />: <span>Next</span>}
            </Button>
          </Modal.Footer>
          : null
        }
      </Modal>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.publish.status,
  token: state.publish.token,
});

export default connect(mapStateToProps)(AccountSelect);
