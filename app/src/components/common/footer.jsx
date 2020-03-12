import React from 'react';
import { connect } from 'react-redux';
import { withRouter } from 'react-router';
import {
  Row,
  Col,
  Grid,
} from '@sketchpixy/rubix';

import actions from '../../redux/actions';
import PurchasePopup from '../purchase/purchase-popup.jsx';

@withRouter
class Footer extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = { 
      version: 0,
    };
  }

  componentDidMount() {
    this.setState({
      version: document.body.getAttribute('data-version')
    });
  }

  closePurchasePopup() {
    const { dispatch } = this.props;

    dispatch(actions.closePuchasePopup());
  }

  render() {
    const year = new Date().getFullYear();
    const { dispatch, router } = this.props;

    return (
      <div id='footer-container'>
        <Grid id='footer' className='text-center'>
          <Row>
            <Col xs={12}>
              <div>© Copyright {year}  ArtTracks.com. All rights reserved. {/*v{this.state.version}*/}</div>
            </Col>
          </Row>
        </Grid>

        <PurchasePopup close={()=>this.closePurchasePopup()} dispatch={dispatch} router={router} />
      </div>
    );
  }
}

const mapStateToProps = (state) => ({
  
});

export default connect(mapStateToProps)(Footer);
