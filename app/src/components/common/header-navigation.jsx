import React from 'react';
import { Link, withRouter } from 'react-router';
import IconSVG from './icons.jsx';
import HeaderNotifications from './header-notifications.jsx';
import actions from '../../redux/actions';
import { getTimeFromSeconds } from '../../utils';
import { IconCoins } from '../common/svg-icon.jsx';

import {
    DropdownButton,
    MenuItem,
} from '@sketchpixy/rubix';

class HeaderNavigation extends React.Component {
    logout () {
        const { router } = this.props;

        let { dispatch } = this.props;
        dispatch(actions.logout());
        router.push('/login');
    }

    goProfile (href) {
        const { router } = this.props;
        router.push(href);
    }

    render() {
        const { mugshot } = this.props;
        const username = this.props.username ? this.props.username: "";
        const avatar = this.props.mugshot ? <img src={ this.props.mugshot.replace("http:", "https:") } width='50' height='50' alt={this.props.username} /> :
            <img src='/imgs/avatars/no-avatar.png' width='50' height='50' alt={this.props.username} />;

        const { creditsTotal, timeTotal } = this.props;
        const { h, m, s } = getTimeFromSeconds(timeTotal);
        let times = '';

        if(timeTotal) {
            if(h > 0) {
                times += sprintf('%02d', h) + ':';
            }
            if(h > 0 || m > 0) {
                times += sprintf('%02d', m) + ':' + sprintf('%02d', s);
            }
            else {
                times = ':' + sprintf('%02d', s);
            }
        }

        let title = (
            <span className="title">
                <span>{username}</span>
                <span className="times">{times || ''}</span>
            </span>
        );

        return (
            <ul className="pull-right nav navbar-nav">
                <li role="presentation" className="help-buoy">
                    <a role="button" href="http://help.arttracks.com/" target="blank">
                        <IconSVG icon="life_buoy" /><span className="global-nav-item">Help</span>
                    </a>
                </li>
                <li role="presentation" className="notification-badge">
                    <HeaderNotifications />
                </li>
                {/*<li role="presentation" className="credits-coin">
                    <IconCoins /><span>{creditsTotal}</span>
                </li>*/}
                <li role="presentation" className="">
                    <a role="button" href="javascript:;">
                        <span className={`avatar-container ${mugshot ? "" : " dashed"}`}>{ avatar }</span>
                    </a>
                </li>
                <li role="presentation" className="nav-profile">
                    <DropdownButton bsStyle="link" pullRight={true} title={title} id="profile-dropdown">
                        <MenuItem eventKey="4.1" onClick={this.goProfile.bind(this, '/settings')}>Account Overview</MenuItem>
                        <MenuItem eventKey="4.1" onClick={this.goProfile.bind(this, '/settings/profile')}>Edit Profile</MenuItem>
                        <MenuItem eventKey="4.2" onClick={this.goProfile.bind(this, '/settings/change-password')}>Change Password</MenuItem>
                        <MenuItem eventKey="4.3" onClick={this.goProfile.bind(this, '/settings/notifications')}>View Notifications</MenuItem>
                        <MenuItem eventKey="4.1" onClick={this.goProfile.bind(this, '/settings/connected-accounts')}>Connect Accounts</MenuItem>
                        <MenuItem eventKey="4.1" onClick={this.goProfile.bind(this, '/settings/billing-info')}>Manage Billing</MenuItem>
                        <MenuItem divider />
                        <MenuItem eventKey="4.4" onClick={::this.logout}>Logout</MenuItem>
                    </DropdownButton>
                </li>
            </ul>
        );
    }
}

export default withRouter(HeaderNavigation);
