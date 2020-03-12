import React from 'react';
import { Row, Col, Grid } from '@sketchpixy/rubix';
import Subscription from './subscription.jsx';
import Credits from './credits.jsx';
import VideoTimes from './video-times.jsx';
import PaymentHistory from './payment-history.jsx';

class Dashboard extends React.Component {

  render() {
    return (
      <div className="body-container">
        <div className="container__with-scroll">
          <Grid>
            <Row><Col md={12}><h3 className="mt2">Overview</h3></Col></Row>
            <Row>
              <Subscription />
              <VideoTimes />
              {/*<Credits />*/}
            </Row>
          
            <Row className="mt5">
              <PaymentHistory />
            </Row>
          </Grid>
        </div>
      </div>
    );
  }
}

export default Dashboard;
