import React from 'react';
import SidebarContainer from '../components/common/sidebar-container.jsx';
import SidebarProject from '../components/common/sidebar-project.jsx';
import Header from '../components/common/header.jsx';
import Footer from '../components/common/footer.jsx';

export default class ProjectContainer extends React.Component {
  render() {
    return (
      <SidebarContainer {...this.props}>
        <Header />
        <SidebarProject open="true" pathname={this.props.location.pathname} />
        {this.props.children}
        <Footer />
      </SidebarContainer>
    );
  }
}
