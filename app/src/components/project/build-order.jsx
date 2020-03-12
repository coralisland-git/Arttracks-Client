import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import cookie from 'react-cookie';
import {
  Row,
  Col,
  Alert,
  Button,
} from '@sketchpixy/rubix';
import actions from '../../redux/actions';
import { getDurationFromTrack, getSecondsFromDuration } from '../../utils';
import { checkVideoResolutions } from '../../services/plan-check';
import ButtonLoader from '../common/button-loader.jsx';

class BuildTrack extends React.Component {
  render() {
    const { track, artwork, remover, resolution } = this.props;
    const thumbnail = artwork && artwork.thumbnail? <img src={artwork.thumbnail.replace("http:", "https:")} /> : <img src="/imgs/blank.gif" />;
    const duration = getDurationFromTrack(track);
    const seconds = !duration? 0: getSecondsFromDuration(duration);

    // Determine artwork shape
    const metadata = JSON.parse(artwork.metadata).length ? JSON.parse(artwork.metadata)[0]: {};
    let shape = 'horizontal';
    shape = metadata.canvas[0].settings['shape'] ? metadata.canvas[0].settings['shape']: 'horizontal';

    // Determine size dimensions for video
    let size = '';

    if(resolution == '360p') {
      if(shape == 'horizontal') {
        size = '640x360';
      } else if(shape == 'square') {
        size = '360x360';
      } else if(shape == 'vertical') {
        size = '360x640';
      }
    }
    else if(resolution == '480p') {
      if(shape == 'horizontal') {
        size = '854x480';
      } else if(shape == 'square') {
        size = '480x480';
      } else if(shape == 'vertical') {
        size = '480x854';
      }
    }
    else if(resolution == '720p') {
      if(shape == 'horizontal') {
        size = '1280x720';
      } else if(shape == 'square') {
        size = '720x720';
      } else if(shape == 'vertical') {
        size = '720x1280';
      }
    }
    else if(resolution == '1080p') {
      if(shape == 'horizontal') {
        size = '1920x1080';
      } else if(shape == 'square') {
        size = '1080x1080';
      } else if(shape == 'vertical') {
        size = '1080x1920';
      }
    }

    return (
      <li>
        <Row>
          <Col md={5}>
            <div className="preview">
              {thumbnail}
              <span className="duration">{ duration }</span>
            </div>
          </Col>
          <Col md={7}>
            <span className="track-title"><strong>{ track.title ? track.title : '---- ----' }</strong></span>
            <span className="artist">{ track.subtitle? track.subtitle : '----' }</span>
            <span className="color-primary" style={{"fontSize": "12px"}}>{ size }</span>
            <span className="color-primary" style={{'fontSize': "12px"}}>Seconds: { seconds }</span>
          </Col>
        </Row>
        <a href="javascript:;" className="closer" onClick={ remover }><span className="rubix-icon icon-fontello-cancel-5"></span></a>
      </li>
    );
  }
}

class ProjectBuildOrder extends React.Component {
  constructor(...args) {
    super(...args);

    // const { user_credits_purchased, user_credits_expiring } = this.props;
    const projectId = this.props.params.projectId ? this.props.params.projectId : null;

    this.state = {
      projectId: projectId,
      tracks: [],
      removed_tracks: [],
      resolution: '360p',
      checked: false,
    };
  }

  componentWillMount() {
    const { dispatch, router, status, project, tracks } = this.props;

    if(this.state.projectId && (!project || this.state.projectId != project.id)) {
      dispatch(actions.getProject(this.state.projectId));
    }
    
    if(status !== null) {
      this.setState({checked: true});
    }

    if(tracks.length > 0) {
      this.checkTracksOrder(tracks);
    }
  }

  componentWillReceiveProps (nextProps) {
    const { project, status, buildOrder, dispatch, router } = nextProps;
    const { tracks } = this.state;

    if (project) {
      this.setState({ projectId: project.id });

      if(!this.state.checked) {
        dispatch(actions.checkBuilding());
        router.push(`/popup/loading?prev=/project/${project.id}`);
      }
    }

    if(!tracks.length) {
      if(nextProps.tracks.length) {
        this.checkTracksOrder(nextProps.tracks);
      } 
    }

    if(this.props.status == 'buildOrdering' && status == 'buildOrdered') {
      this.buildProcess(buildOrder);
    }
  }

  checkTracksOrder(tracks) {
    const { projectId } = this.state;
    const orderString = cookie.load('project_' + projectId + '_tracks_order');
    let orderTracks = [];

    if(orderString) {
      const order = orderString.toString().split(',');

      for (let i = 0; i < order.length; i++) {
        for (let j = 0; j < tracks.length; j++) {
          if (order[i] == tracks[j].id)
            orderTracks.push(tracks[j]);
        }
      }
      if (orderTracks.length < tracks.length) {
        for (let i = orderTracks.length; i < tracks.length; i++) {
          orderTracks.push(tracks[i]);
        }
      }
    }
    else {
      orderTracks = tracks;
    }

    this.setState({tracks: orderTracks});
  }

  cancelAndExit() {
    const { router } = this.props;
    router.push('/project/' + this.state.projectId);
  }

  buildOrder() {
    const { dispatch, project } = this.props;

    if(confirm("You are now submitting a video job for this project.")) {
      dispatch(actions.createBuildOrder(project));
    }
  }

  buildProcess(buildOrder) {
    const { dispatch, router, project, artworks } = this.props;
    const { tracks, resolution } = this.state;
    const totalSeconds = this.calcTotalSeconds();

    // Determine artwork shape
    let shape = 'horizontal';
    const artwork_metadata = JSON.parse(artworks[0].metadata).length ? JSON.parse(artworks[0].metadata)[0]: {};
    shape = artwork_metadata.canvas[0].settings['shape'] ? artwork_metadata.canvas[0].settings['shape']: 'horizontal';

    // Determine size dimensions for video
    let size = '';

    if(resolution == '360p') {
      if(shape == 'horizontal') {
        size = '640x360';
      } else if(shape == 'square') {
        size = '360x360';
      } else if(shape == 'vertical') {
        size = '360x640';
      }
    }
    else if(resolution == '480p') {
      if(shape == 'horizontal') {
        size = '854x480';
      } else if(shape == 'square') {
        size = '480x480';
      } else if(shape == 'vertical') {
        size = '480x854';
      }
    }
    else if(resolution == '720p') {
      if(shape == 'horizontal') {
        size = '1280x720';
      } else if(shape == 'square') {
        size = '720x720';
      } else if(shape == 'vertical') {
        size = '720x1280';
      }
    }
    else if(resolution == '1080p') {
      if(shape == 'horizontal') {
        size = '1920x1080';
      } else if(shape == 'square') {
        size = '1080x1080';
      } else if(shape == 'vertical') {
        size = '1080x1920';
      }
    } else {
      // If all fails, use default assumptions
      if(shape == 'horizontal') {
        size = '640x360';
      } else if(shape == 'square') {
        size = '640x360';
      } else if(shape == 'vertical') {
        size = '360x640';
      }
    }

    dispatch(actions.addBuildingTracks(project, artworks[0], tracks));
    tracks.forEach(function(track) {
      dispatch(actions.buildTrack(project, artworks[0], track, size, totalSeconds, buildOrder));
    });

    router.push(`/popup/loading?prev=/project/${project.id}`);
  }

  setResolution(resolution, e) {
    const { dispatch, userPlan, plans } = this.props;

    if(!checkVideoResolutions(userPlan, plans, parseInt(resolution))) {
      dispatch(actions.showPuchasePopup({ section: "upgradePlan", quota: "video_resolutions" }));
    }
    else {
      // this.setState({credit: CREDIT_RATES[resolution]});
      this.setState({resolution: resolution});
      document.querySelector('.white-box.active').classList.remove('active');
      document.querySelector('#white-box-' + resolution).classList.add('active');
    }
  }

  removeTrack(index) {
    const { tracks } = this.state;

    tracks.splice(index, 1);
    this.setState({tracks: tracks});
  }

  calcTotalSeconds() {
    const { tracks } = this.state;
    let total = 0;

    tracks.forEach((track) => {
      const duration = getDurationFromTrack(track);
      total += !duration? 0: getSecondsFromDuration(duration);
    });

    return total;
  }

  getMoreTime(e) {
    e.preventDefault();

    this.props.dispatch(actions.showPuchasePopup({section: 'buyTimes'}));
  }

  render() {
    const { status, statusText, project, artworks, availableSeconds } = this.props;
    
    const { tracks, resolution } = this.state;
    const totalSeconds = this.calcTotalSeconds();

    let alert = null;
    if(status == 'failed') {
      alert = <Alert danger>{ statusText }</Alert>;
    }
    else if(availableSeconds < totalSeconds) {
      alert = <Alert danger>Your available video time balance is less than required.</Alert>;
    }

    const disabled = availableSeconds < totalSeconds || tracks.length == 0 ? true: false;

    return this.state.checked? 
      (
        <div id='body' className="project-body build-order-page">
          <div id="body-header">
            <div className="pull-right">
              <Button lg onClick={::this.cancelAndExit} className="btn-hollow btn-sq">Cancel & Exit</Button>
            </div>
            <h2>{ project? project.title: '' }</h2>
          </div>

          <div className="body-sidebar__container wide-sidebar">
            <div className="container__with-scroll">
              <Row>
                <Col sm={4}>
                  <h3 className="mt0">
                    <span className="ml2">Select Video Size</span>
                  </h3>
                </Col>
                <Col sm={8} className="mt2 text-right">
                  <span className="mr2">Your available video time:&nbsp; <strong>{ availableSeconds.toLocaleString("en") } seconds</strong> &nbsp;|&nbsp;</span>
                  <a href="javascript:;" onClick={::this.getMoreTime} style={{'display': 'inline-block', 'marginRight': '10px'}}>Get more time</a>
                </Col>
              </Row>
              <hr className="mt0" />
              <div id="alert-box">{ alert }</div>
              <div className="video-size-cards">
                <Row>
                  <Col sm={3}>
                    <div className={`white-box${resolution == '360p' ? ' active':''}`} id="white-box-360p" onClick={(e) => this.setResolution('360p', e)}>
                      <span className="dp">360p</span>
                      <span className="color-primary">Small</span>
                      <p className="credits">
                        <b>Standard</b>
                      </p>
                      <div className="flex-space"></div>
                      <p><b>Best for:</b><br />Viewing on smartphones <br />and smaller mobile <br />devices</p>
                    </div>
                  </Col>
                  <Col sm={3}>
                    <div className={`white-box${resolution == '480p' ? ' active':''}`} id="white-box-480p" onClick={(e) => this.setResolution('480p', e)}>
                      <span className="dp">480p</span>
                      <span className="color-primary">Medium</span>
                      <p className="credits">
                        <b>Mobile HD</b>
                      </p>
                      <div className="flex-space"></div>
                      <p><b>Best for:</b><br />Viewing on tablets, <br />embedded video players <br />on websites</p>
                    </div>
                  </Col>
                  <Col sm={3}>
                    <div className={`white-box${resolution == '720p' ? ' active':''}`} id="white-box-720p" onClick={(e) => this.setResolution('720p', e)}>
                      <span className="dp">720p</span>
                      <span className="color-primary">Large</span>
                      <p className="credits">
                        <b>HD</b>
                      </p>
                      <div className="flex-space"></div>
                      <p><b>Best for:</b><br />Desktop and/or laptop <br />computer full-screen <br />viewing</p>
                    </div>
                  </Col>
                  <Col sm={3}>
                    <div className={`white-box${resolution == '1280p' ? ' active':''}`} id="white-box-1080p" onClick={(e) => this.setResolution('1080p', e)}>
                      <span className="dp">1080p</span>
                      <span className="color-primary">XL</span>
                      <p className="credits">
                        <b>HD</b>
                      </p>
                      <div className="flex-space"></div>
                      <p><b>Best for:</b><br />Large screens and <br />home entertainment<br />viewing</p>
                    </div>
                  </Col>
                </Row>
              </div>
            </div>

            <div className="body-sidebar__element">
              <Row className="mt3 pr5-imp pl5-imp">
                <Col sm={6} style={{'paddingLeft': '0px'}}>
                  <h4 className="mt2">
                    <span className="">Videos <span className="label">{tracks.length}</span></span>
                  </h4>
                </Col>
                <Col sm={6} className="mt2 text-right">
                  <Link to={"/project/" + this.state.projectId + "/audio"}>Add more tracks</Link>
                </Col>
              </Row>
              <hr className="mt0 mb0 mr3 ml5" />

              <ul className="tracks">
                {((thisInstance) => {
                  return tracks.map((track, i) => {
                    return <BuildTrack key={track.id} track={track} artwork={artworks[0]} resolution={resolution} remover={() => thisInstance.removeTrack(i)} />
                  });
                })(this)}
              </ul>

              <Row className="pr5-imp pl5-imp">
                <Col sm={12} className="pl0 pr0">
                  <h4 className="mt0">
                    <span>Total:</span> <span className="pull-right color-primary">{ totalSeconds.toLocaleString("en") } seconds</span>
                  </h4>
                </Col>
              </Row>

              <Row>
                <Col sm={12}>
                  <Button lg bsStyle='primary' className="btn-text-large btn-block btn-order" disabled={ disabled } onClick={::this.buildOrder}>
                    { status == 'buildOrdering'? <ButtonLoader primary={true} />: 'Generate Video' + (tracks.length > 1 ? 's':'') }
                  </Button>
                </Col>
              </Row>
            </div>
          </div>

        </div>
      )
    : null;
  }
}

const mapStateToProps = (state) => ({
  status: state.build.status,
  statusText: state.build.statusText,
  project: state.project.project,
  tracks: state.tracks.tracks,
  artworks: state.artwork.artworks,
  // user_credits_purchased: state.profile.credits_purchased,
  // user_credits_expiring: state.profile.credits_expiring,
  availableCredts: state.profile.credits_total,
  availableSeconds: state.profile.time_total,
  buildOrder: state.build.buildOrder,
  userPlan: state.profile.userPlan,
  plans: state.plan.plans,
});

export default connect(mapStateToProps)(ProjectBuildOrder);
