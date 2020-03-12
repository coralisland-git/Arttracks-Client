import { COUPON_GET_REQUEST, COUPON_GET_ERROR, COUPON_GET_SUCCESS } from '../../constants';
import { sendRequest } from '../../services/requests';

function getCoupon(code) {
    return sendRequest({
        method: 'GET',
        url: `redemptions/${code}/redeem/`,
        before: { type: COUPON_GET_REQUEST },
        success: (response) => ({
            type: COUPON_GET_SUCCESS,
            payload: response.data
        }),
        fail: (errorData) => ({
            type: COUPON_GET_ERROR,
            payload: "We're sorry, no valid coupon can be found for this code.",
        }),
    });
}

module.exports = {
    getCoupon,
};
