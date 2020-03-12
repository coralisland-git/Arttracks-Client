import { INTERCOM_APP_ID } from '../../constants';
import React from 'react';
import { connect } from 'react-redux';
import cookie from 'react-cookie';
import { Link, withRouter } from 'react-router';
import actions from '../../redux/actions';
import Support from './support.jsx'
import HeaderNavigation from './header-navigation.jsx';
import {
    
    Navbar,
    Grid,
    Row,
    Col
} from '@sketchpixy/rubix';
import { SidebarBtn } from './sidebar-container.jsx';
import { IconLogo } from '../common/svg-icon.jsx';

class Header extends React.Component {
    render() {
        const { fullName, username, email } = this.props;
        const userId = cookie.load('userId')? cookie.load('userId'): 0;

        const appUser = {
          fullName: fullName,
          username: username,
          email: email,
          userId: userId
        }

        return (
          <Grid id='navbar'>
            <Support appId="zd920cvb" appUser={appUser} {...this.props} />
            <Row>
              <Col xs={12}>
                <Navbar fixedTop fluid id="rubix-nav-header">
                  <Row>
                    <Col xs={2} sm={5}>
                      <SidebarBtn className="burger-boy" visible={"xs", "sm", "md", "lg"} />
                      <Link to="/" className="brand-icon"><IconLogo /></Link>
                    </Col>
                    <Col xs={10} sm={2} className="text-center">

                    </Col>
                    <Col sm={5} xsHidden>
                      <HeaderNavigation {...this.props} />
                    </Col>
                  </Row>
                </Navbar>
              </Col>
            </Row>
          </Grid>
        );
    }
}

const mapStateToProps = (state) => ({
    fullName: state.profile.fullName,
    username: state.profile.username,
    email: state.profile.email,
    mugshot: state.profile.mugshot,
    creditsTotal: state.profile.credits_total,
    timeTotal: state.profile.time_total,
});

export default connect(mapStateToProps)(Header);
