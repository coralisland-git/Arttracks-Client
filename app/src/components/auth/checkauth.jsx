/**
 * Created by jarosanger on 8/20/16.
 */
import moment from 'moment';
import React from 'react';
import {connect} from 'react-redux';
import cookie from 'react-cookie';
import actions from '../../redux/actions';

export function checkAuthentication(Component) {

  class AuthenticatedComponent extends React.Component {

    constructor(props) {
      super(props);
      this.loggedIn = true;
    }

    componentWillMount () {
      this.checkAuth(this.props.isAuthenticated);
    }

    componentWillReceiveProps (nextProps) {
      const { isAuthenticated } = nextProps;

      this.checkAuth(isAuthenticated);
    }

    checkAuth (isAuthenticated) {
      let { router, location, dispatch } = this.props;
      let redirectAfterLogin = location.pathname + location.search;

      if (!isAuthenticated) {
        const token = cookie.load('token');
        if(!token) {
          this.loggedIn = false;

          router.push(`/login?next=${redirectAfterLogin}`);
        }
        else {
          dispatch(actions.getSettings('profile'));
          dispatch(actions.getBillingInfo());
          dispatch(actions.getPayingInfo());
          dispatch(actions.getNotifications('profile'));
          dispatch(actions.setLoggedIn());
        }
      }
      else {
        const now = moment();
        let lastLogin = cookie.load('lastLogin');

        if(lastLogin) {
          if(now.diff(moment(lastLogin), 'hours') >= 5) {
            this.loggedIn = false;
            dispatch(actions.logout());
            router.push(`/login?next=${redirectAfterLogin}`);
          }
        }
      }
    }

    render () {
      return (
        this.loggedIn === true
          ? <Component {...this.props}/>
          : null
      )
    }
  }

  const mapStateToProps = (state) => ({
    isAuthenticated: state.auth.isAuthenticated,
  });

  return connect(mapStateToProps)(AuthenticatedComponent);
}
