/**
 * Created by jarosanger on 8/15/16.
 */
import { LOGOUT_USER, USER_FAIL, GET_USER, SET_AVATAR, 
    SETTINGS_FAILURE, SETTINGS_GET_REQUEST, SETTINGS_GET_SUCCESS,
    SETTINGS_SAVE_REQUEST, SETTINGS_SAVE_SUCCESS,
    QUOTAS_GET_REQUEST, QUOTAS_GET_SUCCESS,
    PROFILE_CHECK_REQUEST, PROFILE_CHECK_SUCCESS,
} from '../../constants';

const initialState = {
    cmdType: null,
    status: null,
    statusText: null,
    userId: null,
    email: null,
    username: '',
    fullName: '',
    language: '',
    mugshot: null,
    userPlan: null,
    user: null,
};

function profile(state = initialState, action) {
    switch(action.type) {
        case LOGOUT_USER:
            return Object.assign({}, initialState);

        case USER_FAIL:
            return Object.assign({}, initialState);

        case SETTINGS_FAILURE:
            return Object.assign({}, state, {
                'status': 'failed',
                'cmdType': action.payload.cmdType,
                'statusText': action.payload.statusText
            });

        case SETTINGS_GET_REQUEST:
            return Object.assign({}, state, {
                'status': 'getting',
                'statusText': null
            });

        case SETTINGS_GET_SUCCESS:
            return Object.assign({}, state, action.payload.data, {
                'status': 'got',
                'cmdType': action.payload.cmdType,
                'userId': action.payload.data.user.id,
                'email': action.payload.data.user.email,
                'username': action.payload.data.user.username,
                'statusText': action.payload.data.statusText,
                'fullName': action.payload.data.full_name,
                'userPlan': action.payload.data.user_plan,
                'user': action.payload.data.user,
            });

        case GET_USER:
            return Object.assign({}, state, {
                'userId': action.payload.data.id,
                'email': action.payload.data.email,
                'username': action.payload.data.username,
            });

        case SETTINGS_SAVE_REQUEST:
            return Object.assign({}, state, action.payload.data, {
                'status': 'saving',
                'statusText': null,
                'cmdType': action.payload.cmdType,
                'fullName': action.payload.data.full_name
            });

        case SETTINGS_SAVE_SUCCESS:
            return Object.assign({}, state, action.payload.data, {
                'status': 'saved',
                'cmdType': action.payload.cmdType,
                'statusText': action.payload.data.statusText,
                'fullName': action.payload.data.full_name
            });

        case SET_AVATAR:
            return Object.assign({}, state, {
                mugshot: action.payload.mugshot
            });
        
        case PROFILE_CHECK_REQUEST:
            return Object.assign({}, state, {
                'status': 'checking',
            });

        case PROFILE_CHECK_SUCCESS:
            return Object.assign({}, state, action.payload.data, {
                'status': 'checked',
                'statusText': null,
            });

        default:
            return state;
    }
}

module.exports = {
    profile,
};
