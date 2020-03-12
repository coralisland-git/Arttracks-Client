import React from 'react';
import Intercom from 'react-intercom'

class Support extends React.Component {

  componentDidMount() {
    console.log("Support mounted!");
  }

  render () {
    const { appUser, appId } = this.props;

    const user = {
      user_id: appUser.userId,
      email: appUser.email,
      name: appUser.fullName
    };

    return (
      <div className="app">
        <Intercom appID={appId} { ...user } />
      </div>
    );
  }
}

export default Support
