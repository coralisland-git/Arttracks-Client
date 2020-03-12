import React from 'react';
import ReactDOM from 'react-dom';
import InlineSVG from 'svg-inline-react';
import classNames from 'classnames';
import { getProviderById } from '../../utils';
import { svgIconCheckMark } from '../common/svg-icon.jsx';

export default class AccountItem extends React.Component {
  render() {
    const { connectedAccount, providers, selected, onClick, status, checkToken } = this.props;
    
    const provider = getProviderById(connectedAccount.provider, providers);
    const logoImg = provider && provider.icon ? provider.icon: '/imgs/blank.gif';
    const extraData = JSON.parse(connectedAccount.extra_data);
    const displayName = extraData.displayName? extraData.displayName: '';
    const username = extraData.username? '@' + extraData.username: '';
    const profilePhoto = extraData.photo? extraData.photo: '/imgs/avatars/no-avatar.png';
    const itemClass = classNames({"connected-account": true, "selected": selected});

    let valid = true;
    if(checkToken == extraData.refreshToken) {
      if(status == 'invalid') {
        valid = false;
      }
    }

    return (
      <li className={itemClass}>
        <div className="avatar" onClick={onClick}>
          <img src={ profilePhoto } />
          { selected ? 
            <div className="overlay">
              <InlineSVG src={svgIconCheckMark} />
            </div>
            : null
          }
          <div className="provider-icon">
            <img src={logoImg} />
          </div>
        </div>

        <p>{ displayName }</p>
        <p className="small">
          { valid? 'Active': 'Inactive' }<br />
          { !valid? <a href='javascript:;' onClick={this.props.onConnect}>Connect</a>: null }<br />
        </p>
      </li>
    );
  }
}
