/**
 * Created by jarosanger on 8/15/16.
 */
import { BILLING_FAILURE, BILLING_GET_REQUEST, BILLING_GET_SUCCESS, BILLING_SAVE_REQUEST, BILLING_SAVE_SUCCESS } from '../../constants';

const initialState = {
    status: null,
    statusText: null,
    billing: null,
};

function billing(state = initialState, action) {
    switch(action.type) {
        case BILLING_FAILURE:
            return Object.assign({}, state, {
                'status': 'failed',
                'statusText': action.payload.statusText
            });

        case BILLING_GET_REQUEST:
            return Object.assign({}, state, {
                'status': 'getting',
            });

        case BILLING_GET_SUCCESS:
            return Object.assign({}, state, {
                'status': 'got',
                'billing': action.payload.data,
            });

        case BILLING_SAVE_REQUEST:
            return Object.assign({}, state, {
                'status': 'saving',
            });

        case BILLING_SAVE_SUCCESS:
            return Object.assign({}, state, {
                'status': 'saved',
                'billing': action.payload.data
            });

        default:
            return state;
    }
}

module.exports = {
    billing,
};
