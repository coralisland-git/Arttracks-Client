import React from 'react';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {
    Modal,
    Row,
    Col,
    Button
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import VideoModal from './video-modal.jsx';
import { IconVideoPlay } from '../common/svg-icon.jsx';

class ArtworkLayout extends React.Component {
  constructor(...args) {
    super(...args);

    const projectId = this.props.params.projectId ? this.props.params.projectId : null;
    this.state = {
      projectId: projectId,
      playSample: false,
    }
  }

  componentWillMount() {
    const { dispatch, router, project, setting } = this.props;

    if(!(setting && setting.shape)) {
      router.push(`/project/${this.state.projectId}/artwork/shape`);
    }
    else if(this.state.projectId && (!project || this.state.projectId != project.id)) {
      dispatch(actions.getProject(this.state.projectId));
    }
  }

  componentWillReceiveProps (nextProps) {
    const { router } = this.props;
    const { setting } = nextProps;
    if (setting && setting.template) {
      router.push(`/project/${this.state.projectId}/artwork/upload`);
    }
  }

  setLayout(template) {
    let { dispatch } = this.props;
    dispatch(actions.setArtLayout(template));
  }

  openSample(e) {
    e.preventDefault();
    this.setState({playSample: true});
  }

  closeSample() {
    this.setState({playSample: false});
  }

  render() {
    const { templates, setting } = this.props;

    return setting && setting.shape ? 
      (
        <div className="modal-wrapper">
          <div className="closer"><Link to={`/project/${this.state.projectId}`}><span className="rubix-icon icon-fontello-cancel-5"></span></Link></div>
          <div className="back"><Link to={`/project/${this.state.projectId}/artwork/shape`}>&larr; Back to shapes</Link></div>
          <div className="modal-content wider hollow">
            <Modal.Header className="text-center">
              <h1>Select an artwork layout</h1>
              <h4>Pick a design from below</h4>
            </Modal.Header>
            <Modal.Body className="text-center">
              <Row>
                {((thisInstance) => {
                  if(templates.length) {
                    return templates.map((template, i) => {
                      if(template.classification == setting.shape && template.active) {
                        return <Col key={i} md={4} className="template-layout template-layout__{setting.shape}">
                          <p className={`layout-thumbnail layout-thumbnail__${setting.shape}`}><img src={template.thumbnail}/></p>
                          <h4>{template.name}</h4>
                          <Button lg bsStyle='primary' className="btn-sq" onClick={() => thisInstance.setLayout(template.id)}>Select Template</Button>
                          <p className="layout-description"><strong>Description:</strong><br/>{template.description}</p>
                          {/*}<a className="example" onClick={::this.openSample}><IconVideoPlay hover={true} /> See example</a>*/}
                        </Col>;
                      }
                      else {
                        return null;
                      }
                    });
                  }
                  else {
                    return <Col md={12} className="text-center">No templates found for the shape '{setting.shape}'.<br/><a href="javascript: history.back(-1);">&larr; Go back to shapes menu</a></Col>;
                  }
                })(this)}
              </Row>

              <VideoModal open={this.state.playSample} close={() => this.closeSample()}/>
            </Modal.Body>
          </div>
        </div>
      )
    : null;
  }
}

const mapStateToProps = (state) => ({
  statusText: state.artwork.statusText,
  status: state.artwork.status,
  setting: state.artwork.setting,
  templates: state.artwork.templates,
  project: state.project.project,
});

export default connect(mapStateToProps)(ArtworkLayout);
