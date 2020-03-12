import moment from 'moment';
import React from 'react';
import { connect } from 'react-redux';
import {
  Row,
  Col,
  Grid,
  Alert,
  Icon,
} from '@sketchpixy/rubix';
import { parseNotification } from '../../utils';
import actions from '../../redux/actions';

export default class Notification extends React.Component {
  constructor(...args) {
    super(...args);
    this.state = { ...parseNotification(this.props.notification), removed: false};
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
      if(this.state.text == "")
        message = <p>{this.state.before} {this.state.after}</p>;
      else
        message = <p>{this.state.before}<a href="javascript:;" onClick={::this.detailObject}>{this.state.text}</a>{this.state.after}</p>;
    }
    return (
      <li className={ viewedClassName }>
        <Row>
          <Col sm={1} className="text-center">
            <a href="javascript:;" className="btn-close" onClick={::this.removeNotification}><span>×</span></a>
          </Col>
          <Col sm={8}>{ message }</Col>
          <Col sm={3} className="text-right pr5">
            <span>{ moment(notification.creation_date).startOf('minute').fromNow() }</span>
            <a href="javascript:;" className="view-mark" onClick={::this.toggleView} title={notification.viewed? 'Mark as unread': 'Mark as read'}>{ viewed }</a>
          </Col>
        </Row>
      </li>
    );
  }
}
