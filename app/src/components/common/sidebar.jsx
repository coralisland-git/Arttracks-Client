import React from 'react';
import { connect } from 'react-redux';
import cookie from 'react-cookie';
import { Grid, Row, Col } from '@sketchpixy/rubix';
import { Link, withRouter } from 'react-router';
import InlineSVG from 'svg-inline-react';
import { Sidebar, SidebarNav, SidebarNavItemSvg } from './sidebar-container.jsx';
import { IconVideoPlay, IconSetting, IconFaq } from './svg-icon.jsx';
import actions from '../../redux/actions';

class SidebarMain extends React.Component {
  handleUpgrade(e) {
    e.preventDefault();
    const { router, dispatch } = this.props;

    dispatch(actions.choosePlan({returnUrl: router.location.pathname}));
    router.push('purchase/choose-plan');
  }

  render() {
    const { mugshot, fullName, userPlan } = this.props;
    const avatar = mugshot ? mugshot.replace("http:", "https:"): '/imgs/avatars/no-avatar-dark.png';
    const plan = userPlan ? userPlan.name: '';
    const maxPlan = plan.includes('Business');

    const videoIcon = <IconVideoPlay />;
    const videoIconHover = <IconVideoPlay hover={true} />;
    const settingIcon = <IconSetting />;
    const settingIconHover = <IconSetting hover={true} />;
    const faqIcon = <IconFaq />;
    const faqIconHover = <IconFaq hover={true} />;

    return (
      <div id='sidebar'>
        <div id='sidebar-container'>
          <Sidebar sidebar={0}>
            <div>
              <Grid>
                <Row>
                  <Col xs={12}>
                    <div className='sidebar-nav-profile text-center'>
                      <span className='avatar-container'><img src={ avatar } width='115' height='115' alt='sarah_patchett' /></span>
                      <h4>{fullName}</h4>
                      <h6 className="text-uppercase">{plan} PLAN</h6>
                      {maxPlan ?
                        <span></span>
                        :
                        <a onClick={::this.handleUpgrade} className="btn btn-primary btn-hollow btn-upgrade">Upgrade</a>
                      }
                    </div>
                    <div className='sidebar-nav-container'>
                      <SidebarNav style={{marginBottom: 0}}>
                        <SidebarNavItemSvg eventKey={1} svgIcon={videoIcon} hoverIcon={videoIconHover} name='Video Projects' href='/videos' />
                        <SidebarNavItemSvg eventKey={2} svgIcon={settingIcon} hoverIcon={settingIconHover} name='Account Settings' href='/settings' />
                        <SidebarNavItemSvg eventKey={3} svgIcon={faqIcon} hoverIcon={faqIconHover} name='FAQ' external='http://help.arttracks.com/frequently-asked-questions' />
                      </SidebarNav>
                    </div>
                  </Col>
                </Row>
              </Grid>
            </div>
          </Sidebar>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  fullName: state.profile.fullName,
  mugshot: state.profile.mugshot,
  userPlan: state.profile.userPlan,
});

export default connect(mapStateToProps)(withRouter(SidebarMain));
