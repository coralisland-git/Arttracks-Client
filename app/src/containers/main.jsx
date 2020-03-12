import React from 'react';
import SidebarContainer from '../components/common/sidebar-container.jsx';
import Sidebar from '../components/common/sidebar.jsx';
import Header from '../components/common/header.jsx';
import Footer from '../components/common/footer.jsx';

export default class Main extends React.Component {
  render() {
    return (
      <SidebarContainer {...this.props}>
        <Header />
        <Sidebar open="true" />
        {this.props.children}
        <Footer />
      </SidebarContainer>
    );
  }
}
