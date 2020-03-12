import React from 'react';
import ReactDOM from 'react-dom';
import { Link } from 'react-router';
import actions from '../../redux/actions';

import {
  Button,
} from '@sketchpixy/rubix';

export default class VideoItem extends React.Component {

  detailProject() {
    const { video, dispatch, router } = this.props;
    dispatch(actions.setProject(video));
    router.push(`/project/${video.id}`);
  }

  removeProject() {
    if(confirm("Are you sure to delete this video project?")) {
      const { video, dispatch} = this.props;
      dispatch(actions.deleteProject(video.id));
    }
  }

  mouseOver(e) {
    e.preventDefault();
    $(ReactDOM.findDOMNode(this)).find(".overlay").fadeIn(300);
  }

  mouseOut(e) {
    e.preventDefault();
    $(ReactDOM.findDOMNode(this)).find(".overlay").hide();
  }

  render() {
    const { video } = this.props;
    const tracks = video.track_count? video.track_count: 0;
    const thumb_url = video.thumbnail ? video.thumbnail.replace("http:", "https:") : "/imgs/no-artwork-2.png";

    return (
      <li onMouseEnter={::this.mouseOver} onMouseLeave={::this.mouseOut}>
        <img src="/imgs/blank.gif" className="background" />
        <div className="track-image">
          <img src={thumb_url} />
        </div>
        <div className="track-details">
          <span className="track-details__title">{video.title}</span>
          <span className="track-details__tracks">{tracks} Tracks</span>
        </div>
        <div className="overlay">
          <a href="javascript:;" onClick={::this.removeProject}><span className="rubix-icon icon-dripicons-trash"></span></a>
          <Button className="btn-open btn-primary btn-hollow btn-block" onClick={::this.detailProject}>View Project</Button>
        </div>
      </li>
    );
  }
}
