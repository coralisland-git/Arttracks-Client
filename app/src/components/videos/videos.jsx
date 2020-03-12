import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { VIDEO_PAGE_LIMIT } from '../../constants';
import actions from '../../redux/actions';
import { checkMaxProjects } from '../../services/plan-check';

import {
  Row,
  Col,
  Alert,
  Pagination,
  Button,
} from '@sketchpixy/rubix';

import VideoItem from './video-item.jsx';

class Videos extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      activePage: 1,
      pageLimit: VIDEO_PAGE_LIMIT,
      pages: 1,
      pageVideos: [],
      all: 0,
    };
  }

  componentWillMount() {
    const { dispatch } = this.props;
    dispatch(actions.getVideos());
  }

  componentWillReceiveProps(newProps) {
    const { videos } = newProps;
    this.handlePage(videos, this.state.activePage);
  }

  handleSelect(eventKey) {
    const { videos } = this.props;

    this.setState({ activePage: eventKey });
    this.handlePage(videos, eventKey);
  }

  handlePage(videos, activePage) {
    var pageVideos = [];

    for(var i=0; i<this.state.pageLimit; i++) {
      var index = (activePage - 1) * this.state.pageLimit + i;
      if(videos.length > index)
        pageVideos.push(videos[index]);
    }
    this.setState({ pages: Math.ceil(videos.length/this.state.pageLimit), pageVideos: pageVideos, all: videos.length });
  }

  newProject() {
    const { router, dispatch, videos, userPlan, plans } = this.props;

    if(!checkMaxProjects(userPlan, plans, videos.length)) {
      dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "max_projects" }));
    }
    else {
      dispatch(actions.resetProject());
      router.push("/project/create");
    }
  }

  handleUpgrade(e) {
    e.preventDefault();
    const { router, dispatch } = this.props;

    dispatch(actions.choosePlan({returnUrl: router.location.pathname}));
    router.push('purchase/choose-plan');
  }

  render() {
    const { statusProject, dispatch, router } = this.props;
    const { activePage, pages, pageVideos } = this.state;
    
    let alert = null;
    if(statusProject == 'deleting') {
      alert = <Alert info>Deleting, please wait...</Alert>;
    }

    return (
      <div id='body'>
        <div id="body-header">
          <h2 className="pull-left">Video Projects</h2>
          <Button lg onClick={::this.newProject} className="pull-right btn-blue btn-sq">New Project</Button>
        </div>
        <div className="body-sidebar__container">
          <div className="container__with-scroll">
            <Row>
              <Col sm={12}>
                <h3 className="canvas-header">All</h3>
              </Col>

              <Col sm={12}>
                <div id="alert-box">
                  { alert }
                </div>
              </Col>

              <Col sm={12}>
                <ul className="videos-list thumb">
                  <li className="plus"><a href="javascript:void(0)" onClick={::this.newProject}><span className="rubix-icon icon-ikons-plus"></span></a></li>
                  { pageVideos.map(video => <VideoItem key={ video.id } video={ video } {...this.props} />) }
                </ul>
                {( (pages > 1) ?
                  <nav aria-label="Page navigation">
                    <Pagination
                      prev
                      next
                      ellipsis
                      boundaryLinks
                      bsSize="medium"
                      items={pages}
                      maxButtons={5}
                      activePage={activePage}
                      onSelect={::this.handleSelect} />
                  </nav>
                  : null
                )}
              </Col>
            </Row>
          </div>

          <div className="body-sidebar__element">
            <h4 className="header">Welcome!</h4>
            <p>This is where all of the magic happens. Here are some things that you might want to take care of immediately:</p>

            <ul className="helpers-list">
              <li><a href="javascript:void(0)" onClick={::this.newProject}>Start a new video project</a></li>
              <li><Link to="/settings/profile">Upload a profile photo</Link></li>
              <li><Link to="/settings/connected-accounts">Connect your YouTube channel</Link></li>
              <li><Link to="/settings">View account balances</Link></li>
              <li><a href="javascript:void(0)" onClick={::this.handleUpgrade}>Upgrade your plan</a></li>
              <li><Link to="/settings/change-password">Change your password</Link></li>
            </ul>
          </div>

        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.videos.status,
  statusText: state.videos.statusText,
  videos: state.videos.videos,
  statusProject: state.project.status,
  userPlan: state.profile.userPlan,
  plans: state.plan.plans,
});

export default connect(mapStateToProps)(Videos);
