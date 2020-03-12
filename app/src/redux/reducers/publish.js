import { RESET_PUBLISH_VIDEO,
  PUBLISH_VALIDATE_REQUEST, PUBLISH_VALIDATE_ERROR, PUBLISH_VALIDATE_SUCCESS, 
  PUBLISH_VIDEO_REQUEST, PUBLISH_VIDEO_ERROR, PUBLISH_VIDEO_SUCCESS, 
} from '../../constants';

const initialState = {
  status: null,
  statusText: null,
  token: null,
  buildId: null,
  accountId: null,
  pub: null,
  saveOnly: null,
};

function publish(state = initialState, action) {
  switch(action.type) {
    case RESET_PUBLISH_VIDEO:
      return Object.assign({}, initialState);

    case PUBLISH_VALIDATE_REQUEST:
      return Object.assign({}, state, {
        'status': 'validating',
        'token': action.payload.token,
      });

    case PUBLISH_VALIDATE_ERROR:
      return Object.assign({}, state, {
        'status': 'invalid',
        'token': action.payload.token,
      });

    case PUBLISH_VALIDATE_SUCCESS:
      return Object.assign({}, state, {
        'status': 'valid',
        'token': action.payload.token
      });

    case PUBLISH_VIDEO_REQUEST:
      return Object.assign({}, state, action.payload, {
        'status': 'publishing',
      });

    case PUBLISH_VIDEO_ERROR:
      return Object.assign({}, state, action.payload, {
        'status': 'failed',
        'statusText': action.payload.details,
      });

    case PUBLISH_VIDEO_SUCCESS:
      return Object.assign({}, state, action.payload, {
        'status': 'published',
      });

    default:
      return Object.assign({}, state);
  }
}

module.exports = {
  publish,
};
