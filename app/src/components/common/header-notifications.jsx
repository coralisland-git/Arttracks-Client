import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import IconSVG from './icons.jsx';
import Pusher from 'react-pusher';
import {
  Icon,
  Dropdown,
  MenuItem,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import HeaderNotification from './header-notification.jsx';
import NotificationCounter from '../../utils/notification-counter';

@withRouter
class HeaderNotifications extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { notifications: [], open: false };
  }

  componentWillMount() {
    const { notifications } = this.props;

    if(notifications) {
      this.setState({notifications});
    }
  }

  componentWillReceiveProps(nextProps) {
    const {status, notifications} = nextProps;

    if(status == 'gotHeader' || status == 'savedHeader' || status == 'deletedHeader') {
      if(notifications) {
        this.setState({notifications: notifications});
      }
    }
  }

  onPusherNotification(notification) {
    const { dispatch } = this.props;
    dispatch(actions.getNotifications('profile'));
  }

  onPusherProfile(data) {
    const { dispatch } = this.props;
    dispatch(actions.getProfile());
  }

  showAll() {
    this.setState({open: false});

    const { router } = this.props;
    router.push(`/settings/notifications`);
  }

  renderNotifications() {
    const { notifications } = this.state;

    if(notifications.length > 0) {
      let notificationsList = notifications.map((notification, i) => {
        if(i<3)
          return <HeaderNotification key={i} notification={notification} {...this.props} />;
      });

      return notificationsList;
    }
    else {
      return <MenuItem style={{fontStyle: 'italic', color: '#bbbbbb'}}>There are no notifications.</MenuItem>;
    }
  }

  handleToggle() {
    const open = !this.state.open;

    this.setState({open: open});
    if(open) {
      NotificationCounter.set();
    }
  }

  render() {
    const { notifications, open } = this.state;
    const newCount = NotificationCounter.count(notifications);

    const seeAll = notifications.length > 3 ?
      <div className="text-center pt2 pb1">
        <a href="javascript:;" onClick={::this.showAll}>See all notifications</a>
      </div>
      : null;

    return (
      <Dropdown id="notification-dropdown" pullRight open={open} onToggle={::this.handleToggle}>
        <Dropdown.Toggle>
          { newCount>0 ? <span className="notification-counter">{newCount}</span>: null }
          <IconSVG icon="bell" />
        </Dropdown.Toggle>
        <Dropdown.Menu>
          { this.renderNotifications() }
          { seeAll }
          <Pusher channel="notifications" event="update-build-status" onUpdate={::this.onPusherNotification} />
          <Pusher channel="profile" event="update-subscription" onUpdate={::this.onPusherProfile} />
          <Pusher channel="profile" event="buy-credits" onUpdate={::this.onPusherProfile} />
          <Pusher channel="profile" event="buy-seconds" onUpdate={::this.onPusherProfile} />
          <Pusher channel="profile" event="update-user-balance" onUpdate={::this.onPusherProfile} />
        </Dropdown.Menu>
      </Dropdown>
    );
  }
}

const mapStateToProps = (state) => ({
  notifications: state.notifications.notifications,
  status: state.notifications.status,
});

export default connect(mapStateToProps)(HeaderNotifications);
