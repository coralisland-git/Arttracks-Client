/**
 * Created by jarosanger on 8/15/16.
 */
import { PAYING_FAILURE, PAYING_GET_REQUEST, PAYING_GET_SUCCESS, PAYING_SAVE_REQUEST, PAYING_SAVE_SUCCESS } from '../../constants';

const initialState = {
    status: null,
    statusText: null,
    paying: null,
};

function paying(state = initialState, action) {
    switch(action.type) {
        case PAYING_FAILURE:
            return Object.assign({}, state, {
                'status': 'failed',
                'statusText': action.payload.statusText
            });

        case PAYING_GET_REQUEST:
            return Object.assign({}, state, {
                'status': 'getting',
            });

        case PAYING_GET_SUCCESS:
            return Object.assign({}, state, {
                'status': 'got',
                'paying': action.payload.data,
            });

        case PAYING_SAVE_REQUEST:
            return Object.assign({}, state, {
                'status': 'saving',
            });

        case PAYING_SAVE_SUCCESS:
            return Object.assign({}, state, {
                'status': 'saved',
                'paying': action.payload.data
            });

        default:
            return state;
    }
}

module.exports = {
    paying,
};
