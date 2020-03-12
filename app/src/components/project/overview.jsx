import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import actions from '../../redux/actions';
import { checkMaxProjectArtworks } from '../../services/plan-check';

import {
  Row,
  Col,
  Alert,
} from '@sketchpixy/rubix';


import ProjectHeader from './project-header.jsx';
import ProjectAlert from './project-alert.jsx';

class ProjectOverview extends React.Component {
  constructor(...args) {
    super(...args);

    const projectId = this.props.params.projectId ? this.props.params.projectId : null;
    this.state = { projectId: projectId };
  }

  componentWillMount() {
    const { dispatch, project, status } = this.props;

    if(this.state.projectId && (!project || this.state.projectId != project.id)) {
      dispatch(actions.getProject(this.state.projectId));
    }

    if(this.state.projectId && !status) {
      dispatch(actions.startLoading('OVERVIEW_ARTWORK_LOADER', 'Loading...'));
      dispatch(actions.getArtworks(this.state.projectId));
    }
  }

  componentWillReceiveProps (nextProps) {
    const { project, status, loading } = nextProps;
    if (project) {
      this.setState({ projectId: project.id });
      this.setState({ [loading.OVERVIEW_ARTWORK_LOADER]: { isLoading: false }});
    }
  }

  removeArtwork(artwork) {
    if(confirm("Are you sure you want to delete this Project Artwork?")) {
      const { dispatch } = this.props;
      dispatch(actions.removeArtwork(this.state.projectId, artwork.id));
    }
  }

  buildVideo() {
    const { router, dispatch } = this.props;

    dispatch(actions.checkBuilding());
    router.push('/popup/loading');
  }

  handleAddArtwork(e) {
    e.preventDefault();
    const { userPlan, artworks, plans, router, dispatch } = this.props;

    if(!checkMaxProjectArtworks(userPlan, plans, artworks.length)) {
      dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "max_project_artwork" }));
      return false;
    }
    else {
      router.push('/popup/shape');
    }
  }

  render() {
    const { loading, status, statusText, artworks, router, project } = this.props;
    const urlPrefix = project? '/project/' + project.id: '/project';
    let artworkTemplate = null;

    if(status == "getting" || status == "deleting") {
      artworkTemplate = <Row>
        <Col sm={12} className="text-center">
          <div className="loading"></div>
        </Col>
      </Row>;
    } else {
      if(artworks.length) {
        const artwork = artworks[0];
        let shape = 'horizontal';
        const artwork_metadata = JSON.parse(artwork.metadata).length ? JSON.parse(artwork.metadata)[0]: {};
        shape = artwork_metadata.canvas[0].settings['shape'] ? artwork_metadata.canvas[0].settings['shape']: 'horizontal';

        artworkTemplate = <div className={`artwork-preview${shape && ' shape-' + shape }`}>
          <img src={ artwork.thumbnail.replace("http:", "https:") } />
          <div className="remover">
            <p className="h3">
              <a href="javascript:;" onClick={() => this.removeArtwork(artwork)}
                 className="btn btn-default btn-open btn-primary btn-hollow btn-block">Remove Artwork</a>
            </p>
          </div>
        </div>;
      }
      else {
        artworkTemplate = <div className="file-dropper tall">
          <span className="h3 mt0 mb0">
            <Link to="/popup/shape" className="btn-open btn-primary btn-hollow btn-block btn btn-default">Add Artwork</Link>

            <div className="placeholder-icon">
              <img src="/imgs/upload-artwork-icon.png" />
            </div>

            <div className="helper-text" style={{'marginTop':'200px'}}>
              <p><strong>Tip:</strong><br /><br />
              We recommend uploading a PNG, JPEG, or GIF file that's at<br />least 1920 pixels wide or 1920 pixels tall depending on video shape.</p>
            </div>
          </span>
        </div>;
      }
    }

    let alert = null;
    if(status == 'failed') {
      alert = <Alert danger>{ statusText }</Alert>;
    }
    else if(status == 'saving') {
      alert = <Alert info>Saving, please wait...</Alert>;
    }
    else if(status == 'deleting') {
      alert = <Alert info>Deleting, please wait...</Alert>;
    }

    return (
      <div id='body' className="project-body">
        <ProjectHeader router={router} />

        <div className="body-sidebar__container">
          <div className="container__with-scroll">
            <div id="alert-box-project">
              <ProjectAlert />
            </div>
            <Row>
              <Col>
                <div id="alert-box">
                  { alert }
                </div>
                { artworkTemplate }
              </Col>
            </Row>
          </div>

          <div className="body-sidebar__element pr5-imp pl5-imp">
            <h4 className="header">Steps to Success</h4>
            <p>Make sure you’ve got some artwork added for your project, then add your audio and set any customization settings you want.</p>
            <ul className="helpers-list">
              <li><span className="color-primary"><a href="javascript:;" onClick={::this.handleAddArtwork}>Add some artwork</a></span></li>
              <li><span className="color-primary"><Link to={`${urlPrefix}/audio`}>Add one or more audio tracks</Link></span></li>
              <li><span className="color-primary"><Link to={`${urlPrefix}/settings`}>Add your logo</Link></span></li>
              {/*}<li><span className="color-primary"><Link to={`${urlPrefix}/settings`}>Add EQ audio visualizer</Link></span></li>*/}
              <li><span className="color-primary"><a href="javascript:;" onClick={::this.buildVideo}>Generate art track video</a></span></li>
            </ul>
          </div>
        </div>

      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.artwork.status,
  statusText: state.artwork.statusText,
  project: state.project.project,
  artworks: state.artwork.artworks,
  loading: state.loading,
  userPlan: state.profile.userPlan,
  plans: state.plan.plans,
});

export default connect(mapStateToProps)(ProjectOverview);