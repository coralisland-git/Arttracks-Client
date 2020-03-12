import R from 'ramda';
import React from 'react';
import cx from 'classnames';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import { Row, Col, Alert } from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import { checkMaxProjectArtworks, checkMaxImageUploadSize } from '../../services/plan-check';
import { FILEPICKER_KEY, AVIARY_CLIENT_KEY } from '../../constants';
import ButtonLoader from '../common/button-loader.jsx';
import ProjectHeader from './project-header.jsx';
import ProjectAlert from './project-alert.jsx';

class ProjectArtwork extends React.Component {
  editor;

  constructor(...args) {
    super(...args);

    const projectId = this.props.params.projectId ? this.props.params.projectId : null;
    this.state = { projectId: projectId, mainArtwork: '' };
  }

  componentDidMount() {
    const filepicker = require('filepicker-js');
    filepicker.setKey(FILEPICKER_KEY);

    const editor = new Aviary.Feather({
      apiKey: AVIARY_CLIENT_KEY,
      apiVersion: 3,
      tools: ['crop','effects','enhance','warmth','brightness','contrast','saturation','sharpness','draw','text','redeye','whiten','blemish','focus','splash','frames'],
      cropPresets: [['Movie','16:9']],
      cropPresetsStrict: true,
      minimumStyling: true,
      onSave: (imageID, newURL) => {
        $(".alert", "#alert-box").remove();

        const { userPlan, project, artworks, plans, router, dispatch } = this.props;
        const { mainArtwork } = this.state;

        filepicker.store({url: newURL},
          function(FPFile) {
            if(!checkMaxImageUploadSize(userPlan, plans, FPFile.size)) {
              dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "image_upload_data" }));
            }
            else {
              let metadata = artworks[0].metadata;
              if(mainArtwork != '') {
                metadata = metadata.replace(mainArtwork, FPFile.url);
                dispatch(actions.updateArtwork({...artworks[0], metadata}));
              }
            }
            editor.close();
          },
          function(FPError) {
            console.log(FPError.toString());
            $("#alert-box").append("<div class='alert alert-danger'>Sorry, something went wrong. Please try again.</div>");
            editor.close();
          }
        );
      },
      onError: function(errorObj) {
        console.log(errorObj);
        editor.close();
      },
      onClose: function(isDirty) {
        console.log('editor closed');
      }
    });

    this.editor = editor;
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

    dispatch(actions.getArtworkTemplates());
  }

  componentWillReceiveProps (nextProps) {
    const { project, status, loading, artworks } = nextProps;
    if (project) {
      this.setState({ projectId: project.id });
      this.setState({ [loading.OVERVIEW_ARTWORK_LOADER]: { isLoading: false }});
    }
    if(artworks && artworks.length) {
      this.getMainArtwork(artworks);
    }
    else {
      this.setState({mainArtwork: ''});
    }
  }

  getMainArtwork(artworks) {
    const metadata = JSON.parse(artworks[0].metadata);
    let url = '';

    if(metadata && metadata.length && metadata[0].canvas && metadata[0].canvas.length && metadata[0].canvas[0].assets && metadata[0].canvas[0].assets.length) {
      const index = R.findIndex(R.propEq('tpl_position', 'main_artwork'))(metadata[0].canvas[0].assets);
      if(index !== -1) {
        url = metadata[0].canvas[0].assets[index].url;
      }
    }

    this.setState({mainArtwork: url});
  }

  removeArtwork(artwork) {
    if(confirm("Are you sure you want to delete this Project Artwork?")) {
      const { dispatch } = this.props;
      dispatch(actions.removeArtwork(this.state.projectId, artwork.id));
    }
  }

  buildVideo() {
    const { router, dispatch, project } = this.props;

    dispatch(actions.checkBuilding());
    router.push(`/popup/loading?prev=/project/${project.id}`);
  }

  handleAddArtwork(e) {
    e.preventDefault();
    const { userPlan, project, artworks, plans, router, dispatch } = this.props;

    if(!checkMaxProjectArtworks(userPlan, plans, artworks.length)) {
      dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "max_project_artwork" }));
      return false;
    }
    else {
      router.push(`/project/${project.id}/artwork/shape`);
    }
  }

  launchEditor(artwork) {
    const { templates } = this.props;
    const metadata = JSON.parse(artwork.metadata);

    if(metadata && metadata.length && metadata[0].canvas && metadata[0].canvas.length) {
      const settings = metadata[0].canvas[0].settings;
      let ratio = 6/4;

      for (var i=0; i<templates.length; i++) {
        if (templates[i].id == settings.template_id) {
          // Load template JSON
          const template_data = JSON.parse(templates[i].template).length ? JSON.parse(templates[i].template)[0]: null;
          if(template_data) {
            // Get 'main_artwork' template position data
            for (var t=0; t < template_data.positions.length; t++) {
              if (template_data.positions[t].slug == "main_artwork") {
                let presets = template_data.positions[t].presets;
                let width = presets.width;
                let height = presets.height;
                ratio = width/height;
              }
            }
          }
        }
      }

      const cropPresets = parseInt(ratio*1000)+":1000";
      this.editor.launch({
        image: "main_artwork",
        url: document.getElementById("main_artwork").src,
        cropPresets: [cropPresets]
      });
    }

    return false;
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
        let btnStacked = "";
        const metadata = JSON.parse(artwork.metadata).length ? JSON.parse(artwork.metadata)[0]: {};
        shape = metadata.canvas[0].settings['shape'] ? metadata.canvas[0].settings['shape']: 'horizontal';

        if (shape == "square" || shape == "vertical") {
          btnStacked = " btn-stacked";
        }

        artworkTemplate = <div className={`artwork-preview${shape && ' shape-' + shape }`}>
          <img id="artwork_thumbnail" src={ artwork.thumbnail.replace("http:", "https:") } />
          <div className={cx({"hover": true, "show": status == "updating"})}>
            { status == "updating" ?
              <div><ButtonLoader primary={true} /></div>
              :
              <div>
                <a href="javascript:;" onClick={() => this.removeArtwork(artwork)}
                  className={`btn btn-default btn-open btn-primary btn-hollow btn-block${btnStacked}`}>Remove Artwork</a>
                <a href="javascript:;" onClick={() => this.launchEditor(artwork)}
                  className={`btn btn-default btn-open btn-primary btn-hollow btn-block${btnStacked}`}>Edit Main Image</a>
              </div>
            }
          </div>
          { this.state.mainArtwork != '' ?
            <img src={this.state.mainArtwork.replace("http:", "https:")} id="main_artwork" style={{'display': 'none'}}/>
            : null
          }
        </div>;
      }
      else {
        artworkTemplate = <div className="file-dropper tall">
          <span className="h3 mt0 mb0">
            <Link to={`${urlPrefix}/artwork/shape`} className="btn-open btn-primary btn-hollow btn-block btn btn-default">Add Artwork</Link>

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
  templates: state.artwork.templates,
  loading: state.loading,
  userPlan: state.profile.userPlan,
  plans: state.plan.plans,
});

export default connect(mapStateToProps)(ProjectArtwork);
