import React from 'react';
import Toggle from 'react-toggle';
import { Row, Col } from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import { getProviderById } from '../../utils';

class ConnectedAccount extends React.Component {
  componentWillReceiveProps (nextProps) {
    const { connectedAccount } = nextProps;
  }

  changeActive(e) {
    const active = e.target.checked;
    const { dispatch, connectedAccount } = this.props;

    dispatch(actions.updateConnectedAccount(connectedAccount, {active: active}));
  }

  remove() {
    if(confirm("Are you sure to remove this account?")) {
      const { dispatch, connectedAccount } = this.props;
      dispatch(actions.deleteConnectedAccount(connectedAccount));
    }
  }

  render() {
    const { connectedAccount, providers } = this.props;

    const provider = getProviderById(connectedAccount.provider, providers);
    const logoImg = provider && provider.icon ? provider.icon: '/imgs/blank.gif';
    const extraData = JSON.parse(connectedAccount.extra_data);
    const displayName = extraData.displayName? extraData.displayName: '';
    const username = extraData.username? '@' + extraData.username: '';
    const profilePhoto = extraData.photo? extraData.photo: '/imgs/avatars/no-avatar.png';

    return (
      <li className="mb3">
        <Row>
          <Col md={3} className="pl0">
            <div className="avatar">
              <img src={ profilePhoto } />
              <div className="provider-icon">
                <img src={logoImg} />
              </div>
            </div>
          </Col>
          <Col md={6} className="pt2 pl0">
            <p>{ displayName }</p>
            <p className="small">{ connectedAccount.active? 'Active': 'Inactive' }</p>
          </Col>
          <Col md={3} className="pt2 pl2 pr0">
            <Toggle checked={ connectedAccount.active } onChange={::this.changeActive} />
            <a href="javascript:;" className="closer" onClick={::this.remove}><span className="rubix-icon icon-fontello-cancel-5"></span></a>
          </Col>
        </Row>
      </li>
    );
  }
}

export default ConnectedAccount;
