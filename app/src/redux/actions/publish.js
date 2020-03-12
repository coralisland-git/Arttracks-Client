import axios from 'axios';
import cookie from 'react-cookie';
import { SERVER_URL, BASE_API_URL, RESET_PUBLISH_VIDEO,
  PUBLISH_VALIDATE_REQUEST, PUBLISH_VALIDATE_ERROR, PUBLISH_VALIDATE_SUCCESS,
  PUBLISH_VIDEO_REQUEST, PUBLISH_VIDEO_ERROR, PUBLISH_VIDEO_SUCCESS,
} from '../../constants';
import { sendRequest } from '../../services/requests';
import { checkHttpStatus } from '../../utils';

function resetPublish() {
  return dispatch => {
    dispatch({type: RESET_PUBLISH_VIDEO});
  }
}

function validateRequest(token) {
  return {
    type: PUBLISH_VALIDATE_REQUEST,
    payload: {
      token: token,
    }
  }
}

function validateFail(token) {
  return {
    type: PUBLISH_VALIDATE_ERROR,
    payload: {
      token: token,
    }
  }
}

function validateSuccess(token) {
  return {
    type: PUBLISH_VALIDATE_SUCCESS,
    payload: {
      token: token,
    }
  }
}

function refreshToken(account) {
  const extraData = JSON.parse(account.extra_data);
  const token = extraData.refreshToken;
  const provider = extraData.provider;

  if(provider == 'youtube') {
    const refreshUrl = `${SERVER_URL}refreshToken/youtube?token=${token}`;

    return axios({
      url: refreshUrl,
      method: 'GET',
      responseType: 'json',
    })
    .then(checkHttpStatus)
    .then((response) => {
      return response.data.access_token;
    });
  }
}

function updateAccessToken(account, accessToken) {
  const userId = cookie.load('userId');
  const token = cookie.load('token');
  const extraData = JSON.parse(account.extra_data);  
  const data = {
    user: userId,
    extra_data: JSON.stringify({...extraData, accessToken})
  };

  return axios({
    url: BASE_API_URL + 'profile/connections/' + account.id + '/',
    method: 'PUT',
    data: data,
    responseType: 'json',
    headers: {
      'Authorization': 'Token ' + token
    }
  });
}

function validateToken(account) {
  const extraData = JSON.parse(account.extra_data);
  const token = extraData.refreshToken;
  const provider = extraData.provider;

  if(provider == 'youtube') {
    const checkUrl = `https://www.googleapis.com/oauth2/v1/tokeninfo?access_token=`;

    return dispatch => {
      dispatch(validateRequest(token));

      refreshToken(account)
      .then((accessToken) => updateAccessToken(account, accessToken))
      .then(checkHttpStatus)
      .then((response) => {
        dispatch(validateSuccess(token));
      })
      // .then((accessToken) => {
      //   return axios({
      //     url: checkUrl + accessToken,
      //     method: 'GET',
      //     responseType: 'json',
      //   })
      // })
      // .then(checkHttpStatus)
      // .then((response) => {
      //   if(response.error) {
      //     dispatch(validateFail(token));
      //   }
      //   else {
      //     updateAccessToken(account, accessToken);
      //     dispatch(validateSuccess(token));
      //   }
      // })
      .catch((error) => {
        dispatch(validateFail(token));
      });
    };
  }
}

function publishFail(buildId, accountId, saveOnly, details="") {
  return {
    type: PUBLISH_VIDEO_ERROR,
    payload: {
      buildId, accountId, saveOnly,
      details: details!=""? details: (saveOnly? 'It has been failed to save metadata.': 'It has been failed to publish video.'),
    }
  }
}

function publishSuccess(buildId, accountId, saveOnly, data) {
  return {
    type: PUBLISH_VIDEO_SUCCESS,
    payload: {
      buildId, accountId, saveOnly,
      pub: data,
    }
  }
}

function publishVideo(build, account, metadata, saveOnly) {
  const userId = cookie.load('userId');
  const data = {
    project: build.project,
    user: userId,
    build: build.id,
    provider: account.provider,
    connection: account.id,
    metadata: JSON.stringify([metadata]),
    video_url: build.video_file,
    status: saveOnly? 'draft': 'scheduled',
  };

  if(!saveOnly)
    data.scheduled_for = new Date();

  return sendRequest({
    method: 'POST',
    url: 'projects/' + build.project + '/builds/' + build.id + '/pubs/',
    data: data,
    before: {
      type: PUBLISH_VIDEO_REQUEST,
      payload: {buildId: build.id, accountId: account.id, saveOnly}
    },
    success: function(response) {
      return publishSuccess(build.id, account.id, saveOnly, response.data);
    },
    fail: function(errorData) {
      if(errorData.details !== undefined) {
        return publishFail(build.id, account.id, saveOnly, errorData.details);
      }
      else {
        return publishFail(build.id, account.id, saveOnly);
      }
    }
  });
}

module.exports = {
  validateToken,
  publishVideo,
  resetPublish,
};
