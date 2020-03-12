/**
 * Created by leolarkpor on 7/12/18.
 */
import moment from 'moment';
import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { Link } from 'react-router';
import {
  Modal,
  Form,
  FormGroup,
  FormControl,
  Button
} from '@sketchpixy/rubix';
import ReactTimeout from 'react-timeout';
import actions from '../../redux/actions';
import { IconLogoLarge } from '../common/svg-icon.jsx';

class TrackAffiliate extends React.Component {

  componentWillMount() {

  }

  componentDidMount() {
    // Tapfiliate stuff
    (function(t,a,p){t.TapfiliateObject=a;t[a]=t[a]||function(){(t[a].q=t[a].q||[]).push(arguments)}})(window,'tap');
    
    // Initialize Tapfiliate
    tap('create', '4533-6c3a54');
    tap('detect');
    setTimeout(function() {
      window.location = 'http://www.arttracks.com';
    }, 2000);
  }

  render() {
    return (
      <div className="modal-wrapper modal-white">
        <div className="modal-content">
          <Modal.Header>
            <IconLogoLarge />
          </Modal.Header>
        </div>
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  
});

export default connect(mapStateToProps)(TrackAffiliate);
