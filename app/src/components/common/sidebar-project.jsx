import React from 'react';
import { connect } from 'react-redux';
import cookie from 'react-cookie';
import { Grid, Row, Col } from '@sketchpixy/rubix';
import { Sidebar, SidebarNav, SidebarNavItemSvg } from './sidebar-container.jsx';
import { Link, withRouter } from 'react-router';

class SidebarProject extends React.Component {
  render() {
    const{ project, pathname } = this.props;
    const urlPrefix = project? '/project/' + project.id: '/project';

    return (
      <div id='sidebar'>
        <div id='sidebar-container'>
          <Sidebar sidebar={0}>
            <div>
              <Grid>
                <Row>
                  <Col xs={12}>
                    <div className='sidebar-nav-profile pl3'>
                      <h3 className="white"><Link to="/videos">&larr; Exit</Link></h3>
                    </div>
                    <div className='sidebar-nav-container'>
                      <SidebarNav style={{marginBottom: 0}}>
                        <SidebarNavItemSvg eventKey={1} glyph='icon-simple-line-icons-globe-alt' name='Artwork' href={urlPrefix} />
                        <SidebarNavItemSvg eventKey={2} glyph='icon-simple-line-icons-volume-2' name='Audio Tracks' href={`${urlPrefix}/audio`} />
                        <SidebarNavItemSvg eventKey={3} glyph='icon-ikons-equalizer' name='Customize' href={`${urlPrefix}/settings`} />
                        <SidebarNavItemSvg eventKey={4} glyph='icon-outlined-setting-1' name='Videos' href={`${urlPrefix}/builds`} />
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
  project: state.project.project,
});

export default connect(mapStateToProps)(withRouter(SidebarProject));
