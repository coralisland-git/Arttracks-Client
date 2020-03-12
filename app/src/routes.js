import React from 'react';
import { IndexRoute, Route, Router } from 'react-router';

/* Google Analytics */
import ReactGA from 'react-ga';

/* Containers */
import { DefaultContainer, PopupContainer } from './containers/index.jsx';
import AppContainer from './containers/app.jsx';
import MainContainer from './containers/main.jsx';
import ProjectContainer from './containers/project.jsx';

/* Common Components */
import { checkAuthentication } from './components/auth/checkauth.jsx';
import TrackAffiliate from './components/affiliate/start.jsx';

/* Without Sidebar */
import Login from './components/auth/login.jsx';
import Signup from './components/auth/signup.jsx';
import ForgotPassword from './components/auth/forgotpassword.jsx';
import ResetPassword from './components/auth/resetpassword.jsx';
import VerifyCode from './components/auth/verifycode.jsx';
import ConfirmEmail from './components/auth/confirmemail.jsx';

/* With Sidebar */
import Dashboard from './components/dashboard/index.jsx';
import PaymentDetail from './components/dashboard/payment-detail.jsx';
import Settings from './components/settings/index.jsx';
import Profile from './components/settings/profile.jsx';
import ChangePassword from './components/settings/change-password.jsx';
import ConnectedAccounts from './components/settings/connected-accounts.jsx';
import BillingInfo from './components/settings/billing-info.jsx';
import Notifications from './components/settings/notifications.jsx';

/* Videos & Project */
import Videos from './components/videos/videos.jsx';
import ProjectArtwork from './components/project/artwork.jsx';
import ProjectTracks from './components/project/tracks.jsx';
import ProjectBuildOrder from './components/project/build-order.jsx';
import ProjectBuilds from './components/project/builds.jsx';
import ProjectSettings from './components/project/settings.jsx';

/* Popup window */
import CreateProject from './components/popup/create-project.jsx';
import ArtworkShape from './components/popup/artwork-shape.jsx';
import ArtworkLayout from './components/popup/artwork-layout.jsx';
import ArtworkUpload from './components/popup/artwork-upload.jsx';
import ProjectLoading from './components/popup/project-loading.jsx';
import BuildSuccess from './components/popup/build-success.jsx';
import ChoosePlan from './components/purchase/choose-plan.jsx';

export default (

  <Route path="/" component={AppContainer}>

    <Route component={DefaultContainer}>
      <Route path='/login' component={Login} />
      <Route path='/signup' component={Signup} />
      <Route path='/forgot-password' component={ForgotPassword} />
      <Route path='/reset-password/:uid/:token' component={ResetPassword} />
      <Route path='/signup/invite' component={VerifyCode} />
      <Route path='/confirm/email/:confirmationKey' component={ConfirmEmail} />
      <Route path='/go' component={TrackAffiliate} />

      <Route component={checkAuthentication(PopupContainer)}>
        <Route path='/project/create' component={CreateProject} />
        <Route path='/project/:projectId/artwork/shape' component={ArtworkShape} />
        <Route path='/project/:projectId/artwork/layout' component={ArtworkLayout} />
        <Route path='/project/:projectId/artwork/upload' component={ArtworkUpload} />
        <Route path='/project/:projectId/build-success' component={BuildSuccess} />
        <Route path='/popup/loading' component={ProjectLoading} />
        <Route path='/purchase/choose-plan' component={ChoosePlan} />
      </Route>
    </Route>

    <Route component={checkAuthentication(MainContainer)}>
      <IndexRoute component={Videos} />

      <Route path='/settings' component={Settings}>
        <IndexRoute component={Dashboard} />
        <Route path='/settings/profile' component={Profile} />
        <Route path='/settings/change-password' component={ChangePassword} />
        <Route path='/settings/connected-accounts/:providerName/:returnStatus' component={ConnectedAccounts} />
        <Route path='/settings/connected-accounts' component={ConnectedAccounts} />
        <Route path='/settings/billing-info' component={BillingInfo} />
        <Route path='/settings/notifications' component={Notifications} />
        <Route path='/settings/purchase/detail' component={PaymentDetail} />
      </Route>

      <Route path='/videos' component={Videos} />
    </Route>

    <Route path='/project' component={checkAuthentication(ProjectContainer)}>
      <IndexRoute component={ProjectArtwork} />
      <Route path='/project/:projectId' component={ProjectArtwork} />
      <Route path='/project/:projectId/audio' component={ProjectTracks} />
      <Route path='/project/:projectId/build-order' component={ProjectBuildOrder} />
      <Route path='/project/:projectId/builds' component={ProjectBuilds} />
      <Route path='/project/:projectId/settings' component={ProjectSettings} />
    </Route>

  </Route>
);
