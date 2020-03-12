import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  Icon,
  Dropdown,
  MenuItem,
} from '@sketchpixy/rubix';
import { parseNotification } from '../../utils';
import actions from '../../redux/actions';

export default class HeaderNotification extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = { ...parseNotification(this.props.notification), removed: false };
  }

  toggleView() {
    const { dispatch, notification } = this.props;

    if(notification.viewed) {
      dispatch(actions.updateNotification('profile', notification, {viewed: false, viewed_date: null }));
    }
    else {
      dispatch(actions.updateNotification('profile', notification, {viewed: true, viewed_date: moment().format() }));
    }
  }

  removeNotification() {
    const { dispatch, notification } = this.props;

    dispatch(actions.removeNotification('profile', notification.id));

    this.setState({removed: true});
  }

  detailObject() {
    const { dispatch, router } = this.props;
    const { obj, id } = this.state;

    if(obj == "project") {
      dispatch(actions.resetProject());

      router.push(`/${obj}/${id}/builds`);
    }
  }

  render() {
    if(this.state.removed) {
      return null;
    }
    const { notification } = this.props;
    const viewedClassName = notification.viewed ? null: "unread";
    const viewed = notification.viewed ? <Icon bundle='fontello' glyph="circle-empty" /> : <Icon bundle='fontello' glyph="circle" />;
    let message = <p>{notification.message}</p>;
    if(this.state.html) {
      message = <p>{this.state.before}<span className="color-primary hover-underline" onClick={::this.detailObject}>{this.state.text}</span>{this.state.after}</p>;
    }
    return (
      <MenuItem className={ viewedClassName }>
        <span className="btn-close" onClick={::this.removeNotification}>×</span>
        { message }
        <span className="times">{ moment(notification.creation_date).startOf('minute').fromNow() }</span>
        <span className="view-mark" onClick={::this.toggleView} title={notification.viewed? 'Mark as unread': 'Mark as read'}>{ viewed }</span>
      </MenuItem>
    );
  }
}
