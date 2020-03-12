import React from 'react';
import { connect } from 'react-redux';
import filesize from 'filesize';
import { getTimeFromSeconds } from '../../utils';
import {
  Col,
  Button,
} from '@sketchpixy/rubix';
import { getQuotaValueByCode } from '../../services/plan-check';
import ButtonLoader from '../common/button-loader.jsx';
import actions from '../../redux/actions';

class Plan extends React.Component {
  constructor(...args) {
    super(...args);

    this.state = {
      disabled: false,
      processing: false,
    };
  }

  componentWillReceiveProps(newProps) {
    const { status, selectedPlan } = newProps;
    const { router, dispatch, returnUrl, plan } = this.props;

    if(status == 'ordering') {
      if(plan.id == selectedPlan.id) {
        this.setState({processing: true});
      }
      else {
        this.setState({disabled: true});
      }
    }
    else if(status == 'ordered' || status == 'failed') {
      if(plan.id == selectedPlan.id) {
        dispatch(actions.getBillingInfo());
        dispatch(actions.showPuchasePopup({section: 'billingInfo', rightSide: 'plan'}));
        router.push(returnUrl);
      }
    }
  }

  handleSelect() {
    const {plan, dispatch} = this.props;

    dispatch(actions.orderPlan(plan, 'monthly'));
  }

  render() {
    const { userPlan, plan, close } = this.props;
    const { disabled, processing } = this.state;

    let projects = getQuotaValueByCode(plan.quotas, 'max_projects');

    let tracks = getQuotaValueByCode(plan.quotas, 'max_project_tracks');

    let max_duration = getQuotaValueByCode(plan.quotas, 'max_video_minutes');
    let branding = "ArtTracks watermark on videos"
    let unbranded_videos = getQuotaValueByCode(plan.quotas, 'unbranded_videos');
    let custom_branded_videos = getQuotaValueByCode(plan.quotas, 'video_branding');
    if(unbranded_videos) {
      branding = "Non-watermarked videos";
      if(custom_branded_videos){
        branding = "Custom branded videos";
      }
    }

    let max_resolution = getQuotaValueByCode(plan.quotas, 'video_resolutions');
    if (max_resolution <= 480) {
      max_resolution = max_resolution + 'p Mobile HD';
    } else {
      max_resolution = max_resolution + 'p HD';
    }

    let media_storage = filesize(getQuotaValueByCode(plan.quotas, 'storage_data')*1024*1024);

    let monthly_time = getQuotaValueByCode(plan.quotas, 'expiring_monthly_time');
    let { h, m, s } = getTimeFromSeconds(monthly_time);
    if(h){
      if(h > 1){
        h = h + " hours";
      } else {
        h = h + " hour";
      }
    } else {
      h = "";
    }

    if(m){
      if(m > 1){
        m = m + " minutes";
      } else {
        m = m + " minute";
      }
    } else {
      m = "";
    }

    if(s){
      if(s > 1){
        s = s + " seconds";
      } else {
        s = s + " second";
      }
    } else {
      s = "";
    }

    let best = false;
    let price = null;

    if(plan.name == 'Starter')
      price = 'free';
    else if(plan.name == 'Indie')
      price = <span className="big-number">$9<span className="month">/mo</span></span>;
    else if(plan.name == 'Pro') {
      price = <span className="big-number">$49<span className="month">/mo</span></span>;
      //best = true;
    }
    else if(plan.name == 'Business')
      price = <span className="big-number">$99<span className="month">/mo</span></span>;

    if(plan.name != 'Starter' && projects == 0)
      projects = 'Unlimited';

    return (
      <Col md={3}>
        <div className="plan-card">
          { best ? <div className="bestvalue">Best Value</div>: null }
          <div className="title">
            <h2>{plan.name}</h2>
            <h2 className="price">{price}</h2>
            <p className="description">{plan.description}</p>
          </div>
          <div className="info">
            <div className="plan-items">
              <p className="plan-item">{h} {m} {s} monthly video time</p>
              <p className="plan-item">{projects} active projects</p>
              <p className="plan-item">Bulk build up to {tracks} tracks</p>
              <p className="plan-item">{max_duration}-minute max video length</p>
              <p className="plan-item">{max_resolution} videos</p>
              <p className="plan-item">{media_storage} media storage space</p>
              <p className="plan-item">{branding}</p>
            </div>
            { userPlan.name == plan.name ?
              <Button lg type='button' className="btn-block btn-hollow btn-cancel" onClick={close}>Your plan</Button>
              : <Button lg type='button' bsStyle='primary' className="btn-block btn-wider" onClick={::this.handleSelect} disabled={disabled}>
                  {processing? <ButtonLoader primary={true} />: <span>Choose plan</span>}
                </Button>
            }
          </div>
        </div>
      </Col>
    );
  }
}

const mapStateToProps = (state) => ({
  status: state.plan.status,
  selectedPlan: state.plan.selectedPlan,
  returnUrl: state.plan.returnUrl,
});

export default connect(mapStateToProps)(Plan);
