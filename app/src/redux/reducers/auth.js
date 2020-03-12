/**
 * Created by jarosanger on 8/15/16.
 */
import { RESET_USER_AUTH, LOGOUT_USER, SET_USER_AUTH,
    LOGIN_USER_REQUEST, LOGIN_USER_FAILURE, LOGIN_USER_SUCCESS,
    SIGNUP_USER_REQUEST, SIGNUP_USER_FAILURE, SIGNUP_USER_SUCCESS, SIGNUP_USER_RESET,
    FORGOT_PASSWORD_REQUEST, FORGOT_PASSWORD_FAILURE, FORGOT_PASSWORD_SENT,
    RESET_PASSWORD_REQUEST, RESET_PASSWORD_FAILURE, RESET_PASSWORD_SUCCESS,
    VERIFY_CODE_REQUEST, VERIFY_CODE_FAILURE, VERIFY_CODE_SUCCESS,
    CONFIRM_EMAIL_REQUEST, CONFIRM_EMAIL_FAILURE, CONFIRM_EMAIL_SUCCESS,
} from '../../constants';

const initialState = {
    token: null,
    username: null,
    isAuthenticated: false,
    isAuthenticating: false,
    authStatusText: null,

    isSigningUp: false,
    isSignedUp: false,
    signupStatusText: null,

    isSendingEmail: false,
    isSentEmail: false,
    forgotStatusText: null,

    isResetting: false,
    isReset: false,
    resetStatusText: null,

    verified: false,
    verifying: false,
    verifyStatusText: null,
    invites: null,

    confirmed: false,
    confirming: false,
    confirmStatusText: null,
};

function auth(state = initialState, action) {
    switch(action.type) {

        case RESET_USER_AUTH:
            return Object.assign({}, initialState);
        case LOGOUT_USER:
            return Object.assign({}, initialState);

        case SET_USER_AUTH:
            return Object.assign({}, state, {
                'isAuthenticated': true
            });
        case LOGIN_USER_REQUEST:
            return Object.assign({}, state, {
                'isAuthenticating': true,
                'authStatusText': null
            });
        case LOGIN_USER_SUCCESS:
            return Object.assign({}, state, {
                'isAuthenticating': false,
                'isAuthenticated': true,
                'token': action.payload.token,
                'username': action.payload.username,
                'authStatusText': 'You have been successfully logged in.'
            });
        case LOGIN_USER_FAILURE:
            return Object.assign({}, state, {
                'isAuthenticating': false,
                'isAuthenticated': false,
                'token': null,
                'username': null,
                'authStatusText': action.payload.statusText
            });

        case SIGNUP_USER_REQUEST:
            return Object.assign({}, state, {
                'isSigningUp': true,
                'signupStatusText': null
            });
        case SIGNUP_USER_SUCCESS:
            return Object.assign({}, state, {
                'isSigningUp': false,
                'isSignedUp': true,
                'signupStatusText': `You have been successfully signed up with \nusername '${action.payload.username}' and email '${action.payload.email}'.`,
                'signupUserId': action.payload.id,
                'signupUsername': action.payload.username,
            });
        case SIGNUP_USER_FAILURE:
            return Object.assign({}, state, {
                'isSigningUp': false,
                'isSignedUp': false,
                'signupStatusText': action.payload.statusText
            });
        case SIGNUP_USER_RESET:
            return Object.assign({}, state, {
                'isSigningUp': false,
                'isSignedUp': false,
                'signupStatusText': null,
            });

        case FORGOT_PASSWORD_REQUEST:
            return Object.assign({}, state, {
                'isSendingEmail': true,
                'forgotStatusText': null
            });
        case FORGOT_PASSWORD_SENT:
            return Object.assign({}, state, {
                'isSendingEmail': false,
                'isSentEmail': true,
                'forgotStatusText': 'An e-mail has been sent to you which explains how to reset your password.'
            });
        case FORGOT_PASSWORD_FAILURE:
            return Object.assign({}, state, {
                'isSending': false,
                'isSent': false,
                'forgotStatusText': action.payload.statusText
            });

        case RESET_PASSWORD_REQUEST:
            return Object.assign({}, state, {
                'isResetting': true,
                'resetStatusText': null
            });
        case RESET_PASSWORD_SUCCESS:
            return Object.assign({}, state, {
                'isResetting': false,
                'isReset': true,
                'resetStatusText': 'Your password has successfully been reset.'
            });
        case RESET_PASSWORD_FAILURE:
            return Object.assign({}, state, {
                'isResetting': false,
                'isReset': false,
                'resetStatusText': action.payload.statusText
            });

        case VERIFY_CODE_REQUEST:
            return Object.assign({}, state, {
                'verifying': true,
                'verified': false,
                'verifyStatusText': null
            });
        case VERIFY_CODE_SUCCESS:
            return Object.assign({}, state, {
                'verifying': false,
                'verified': true,
                'verifyStatusText': 'Your code has successfully been verified.',
                'invites': action.payload,
            });
        case VERIFY_CODE_FAILURE:
            return Object.assign({}, state, {
                'verifying': false,
                'verified': false,
                'verifyStatusText': action.statusText,
                'invites': null,
            });

        case CONFIRM_EMAIL_REQUEST:
            return Object.assign({}, state, {
                'confirming': true,
                'confirmed': false,
                'confirmStatusText': null,
            });
        case CONFIRM_EMAIL_SUCCESS:
            return Object.assign({}, state, {
                'confirming': false,
                'confirmed': true,
                'confirmStatusText': 'Your email address has successfully been confirmed.',
            });
        case CONFIRM_EMAIL_FAILURE:
            return Object.assign({}, state, {
                'confirming': false,
                'confirmed': false,
                'confirmStatusText': action.statusText,
            });

        default:
            return Object.assign({}, state);
    }
}

module.exports = {
    auth,
};
