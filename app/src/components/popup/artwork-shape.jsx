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

class ArtworkShape extends React.Component {
  constructor(...args) {
    super(...args);

    const projectId = this.props.params.projectId ? this.props.params.projectId : null;
    this.state = {
      projectId: projectId,
      playSample: false,
    }
  }

  componentWillMount() {
    const { dispatch, templates, project } = this.props;

    if(templates.length == 0) {
      dispatch(actions.getArtworkTemplates());
    }

    if(this.state.projectId && (!project || this.state.projectId != project.id)) {
      dispatch(actions.getProject(this.state.projectId));
    }

    dispatch(actions.resetArtworkSetting());
  }

  componentWillReceiveProps (nextProps) {
    const { router, project } = this.props;
    const { setting } = nextProps;

    if (setting && setting.shape) {
      router.push(`/project/${this.state.projectId}/artwork/layout`);
    }
  }

  setShape(shape) {
    const { dispatch, templates } = this.props;
    dispatch(actions.setArtShape(shape));
  }

  openSample(e) {
    e.preventDefault();
    this.setState({playSample: true});
  }

  closeSample() {
    this.setState({playSample: false});
  }

  render() {
    const { projectId } = this.state;

    return (
      <div className="modal-wrapper">
        <div className="closer"><Link to={`/project/${projectId}`}><span className="rubix-icon icon-fontello-cancel-5"></span></Link></div>
        <div className="modal-content wide hollow">
          <Modal.Header className="text-center">
            <h1>Pick an artwork canvas shape</h1>
            <h4>All videos you build using this artwork will take on its shape.</h4>
          </Modal.Header>
          <Modal.Body className="text-center">
            <Row>
              <Col md={4} className="col-horizontal">
                <Button lg bsStyle='primary' className="btn-sq btn-shape btn-shape__horizontal" onClick={() => this.setShape('horizontal')}>Horizontal</Button>
                <p>The most popular videos shape. Great for networks like Youtube, Facebook and most video sites.</p>
                {/*}<a className="example" onClick={::this.openSample}><IconVideoPlay hover={true} /> See example</a>*/}
              </Col>
              <Col md={4} className="col-square">
                <Button lg bsStyle='primary' className="btn-sq btn-shape btn-shape__square unavailable" onClick={() => this.setShape('square')}>Square<br />{/*<span className="helper">( Locked )</span>*/}</Button>
                <p>Another popular shape. Square videos are great for popular mobile apps like Instagram.</p>
              </Col>
              <Col md={4} className="col-vertical">
                <Button lg bsStyle='primary' className="btn-sq btn-shape btn-shape__vertical unavailable" onClick={() => this.setShape('vertical')}>Vertical<br />{/*<span className="helper">( Locked )</span>*/}</Button>
                <p>Create vertical videos that are great for viewing on mobile phones and popular apps like Snapchat.</p>
              </Col>
            </Row>

            <VideoModal open={this.state.playSample} close={() => this.closeSample()}/>
          </Modal.Body>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  statusText: state.artwork.statusText,
  status: state.artwork.status,
  setting: state.artwork.setting,
  templates: state.artwork.templates,
  project: state.project.project,
});

export default connect(mapStateToProps)(ArtworkShape);
