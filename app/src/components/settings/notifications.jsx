import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import Pusher from 'react-pusher';
import {
  Row,
  Col,
  Grid,
  Alert
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import Notification from './notification.jsx';
import { setNotificationsLastChecked } from '../../utils';

class Notifications extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { filter: "all", notifications: [] };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(actions.getNotifications('profile'));
  }

  componentDidMount() {
    setNotificationsLastChecked();
  }

  componentWillUnmount() {
    setNotificationsLastChecked();
  }

  componentWillReceiveProps(nextProps) {
    const {status, notifications} = nextProps;

    if(status == 'gotHeader' || status == 'savedHeader' || status == 'deletedHeader') {
      this.setState({notifications: notifications});
    }
  }

  onPusher(notification) {
    this.setState({notifications: this.state.notifications.concat(notification)});
  }

  dismissAlert(e) {
    $(e.target).parents(".alert-box").remove();
  }

  filter(filter) {
    this.setState({filter: filter});
  }

  markReadAll() {
    const { notifications } = this.state;
    const { dispatch } = this.props;

    notifications.forEach(notification => {
      if (!notification.viewed) {
        dispatch(actions.updateNotification('profile', notification, {viewed: true, viewed_date: moment().format()}));
      }
    });
  }

  render() {
    const { notifications, filter } = this.state;
    let unreadCount = 0;

    notifications.forEach(notification => {
      if(!notification.viewed)
        unreadCount++;
    });

    let alert = <div className="alert-box"><Alert bsStyle="danger" onDismiss={::this.dismissAlert}>
      Service Availability Warning: Scheduled Site Maintenance: ArtTracks will be down for a regularly scheduled maintenance on September 10,
      begining at 02:00 EST for about 60 minutes. This will not affect any video builds.
    </Alert></div>;

    return (
      <div className="body-container">
        <div className="container__with-scroll">
          <Grid>
            <Row>
              <Col md={12}>
                <Row>
                  <Col md={2}><h3>Notifications</h3></Col>
                  { unreadCount > 0 ?
                    <Col md={4} className="pt6">
                      <span className="rubix-icon icon-fontello-circle"></span>&nbsp;&nbsp;&nbsp;
                      {unreadCount} unread notifications
                    </Col> :
                    <Col md={4} className="pt6"></Col>
                  }
                  <Col md={6} className="text-right notification-filters pt6">
                    Show:
                    <a href="javascript:;" className="view-filter" onClick={()=>this.filter('all')}>{ filter == "all"? <b>All</b>: "All"}</a>
                    <a href="javascript:;" className="view-filter" onClick={()=>this.filter('read')}>{ filter == "read"? <b>Read</b>: "Read"}</a>
                    <a href="javascript:;" className="view-filter" onClick={()=>this.filter('unread')}>{ filter == "unread"? <b>Unread</b>: "Unread"}</a>
                    &nbsp;&nbsp;|&nbsp;&nbsp;
                    <a href="javascript:;" className="view-filter primary" onClick={::this.markReadAll}>Mark all as read</a>
                  </Col>
                </Row>
                <ul className="notifications">
                  { notifications.map(notification => {
                    if(filter == "all" || (filter == 'read' && notification.viewed) || (filter == 'unread' && !notification.viewed))
                      return <Notification key={notification.id} notification={notification} {...this.props} />;
                    else
                      return null;
                  }) }
                </ul>
                <Pusher channel="profile-notifications" event="add" onUpdate={::this.onPusher} />
              </Col>
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.notifications.status,
  statusText: state.notifications.statusText,
  notifications: state.notifications.notifications,
  removedId: state.notifications.removedId,
});

export default connect(mapStateToProps)(Notifications);
