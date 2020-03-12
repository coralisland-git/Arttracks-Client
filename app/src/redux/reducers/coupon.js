/**
 * Created by jarosanger on 10/15/16.
 */
import { COUPON_GET_REQUEST, COUPON_GET_ERROR, COUPON_GET_SUCCESS } from '../../constants';

const initialState = {
    statusText: null,
    status: null,
    code: null,
};

function coupon(state = initialState, action) {
    switch(action.type) {
        case COUPON_GET_REQUEST:
            return {...state, status: 'getting' };
        case COUPON_GET_ERROR:
            return {...state, status: 'failed', statusText: action.payload };
        case COUPON_GET_SUCCESS:
            return {...state, status: 'got', code: action.payload };
        default:
            return Object.assign({}, state);
    }
}

module.exports = {
    coupon,
};
