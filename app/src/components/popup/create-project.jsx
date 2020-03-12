import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';

import actions from '../../redux/actions';

import {
    Modal,
    Form,
    FormGroup,
    FormControl,
    Button
} from '@sketchpixy/rubix';

import ButtonLoader from '../common/button-loader.jsx';

class CreateProject extends React.Component {

  constructor(...args) {
    super(...args);

    this.state = {status: null};
  }

  componentWillMount() {
    // let { dispatch } = this.props;
    // dispatch(actions.resetProject());
  }

  componentWillReceiveProps (nextProps) {
    const { router, dispatch } = this.props;
    const { status, project } = nextProps;
    if (status == "saved") {
      dispatch(actions.setProject(project));
      router.push(`/project/${project.id}`);
    }
    else if (status == "failed" && this.props.status == "saving") {
      this.setState({status: 'failed'});
    }
  }

  submit(e) {
    e.preventDefault();

    let projectTitle = ReactDOM.findDOMNode(this.projectTitle).value;
    let { dispatch } = this.props;

    dispatch(actions.createProject(projectTitle));
  }

  skip() {
    let {dispatch} = this.props;

    dispatch(actions.createProject('Untitled'));
  }

  render() {
    let alert = null;
    let {status} = this.props;

    if(this.state.status == 'failed')
      alert = <FormGroup className="has-error">
        <span className="help-block" dangerouslySetInnerHTML={{__html: this.props.statusText}}></span>
      </FormGroup>;

    return (
      <div className="modal-wrapper">
        <div className="closer"><Link to={`/videos`}><span className="rubix-icon icon-fontello-cancel-5"></span></Link></div>
        <div className="modal-content wide hollow">
          <Modal.Header className="text-center">
            <h1>Enter a title for your project.</h1>
            <h4>This can be changed later. (45-character limit)</h4>
          </Modal.Header>
          <Modal.Body className="text-center">
            <Form onSubmit={::this.submit}>
              <FormGroup>
                <FormControl type="text" placeholder="Untitled" ref={(projectTitle) => this.projectTitle = projectTitle} autoFocus maxLength="45" />
              </FormGroup>
              <FormGroup>
                <Button lg type='submit' bsStyle='primary' className="btn-block">
                  { status == 'saving' ? <ButtonLoader primary={true} />: 'Create Project' }
                </Button>
              </FormGroup>
              {alert}
            </Form>

            <hr className="transparent" />
            {/*<p>If this is not entered, it will be saved as ‘Untitled’. <a disabled={status == "saving"} href="javascript:;" onClick={::this.skip}>Skip</a></p>*/}
          </Modal.Body>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  statusText: state.project.statusText,
  status: state.project.status,
  project: state.project.project
});

export default connect(mapStateToProps)(CreateProject);
