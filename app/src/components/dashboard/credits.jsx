import React from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import actions from '../../redux/actions';
import { Col, Button } from '@sketchpixy/rubix';

class Credits extends React.Component {
  handleBuy(e) {
    e.preventDefault();
    this.props.showBuyCredits();
  }

  render() {
    const { creditsTotal } = this.props;

    return (
      <Col md={3}>
        <div className="white-block credit-balance">
          <h5 className="text-center">Credit Balance</h5>
          <div className="balance">{creditsTotal}</div>
          <p><span className="small">Use credits for video effects and premium upgrades</span></p>
          <div className="flex-space"></div>
          <Button lg type='button' bsStyle='primary' className="btn-block btn-hollow" onClick={::this.handleBuy}>Buy More Credits</Button>
        </div>
      </Col>
    );
  }
}

const mapStateToProps = (state) => ({
  creditsTotal: state.profile.credits_total,
});

const mapDispatchToProps = (dispatch) => ({
  showBuyCredits: () => {
    dispatch(actions.showPuchasePopup({section: 'buyCredits'}));
  },
});

export default connect(mapStateToProps, mapDispatchToProps)(Credits);
