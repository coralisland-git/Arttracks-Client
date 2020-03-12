/**
 * Created by jarosanger on 8/15/16.
 */
import cookie from 'react-cookie';
import { PAYING_FAILURE, PAYING_GET_REQUEST, PAYING_GET_SUCCESS, PAYING_SAVE_REQUEST, PAYING_SAVE_SUCCESS } from '../../constants';
import { checkHttpStatus } from '../../utils';
import { sendRequest } from '../../services/requests';

function fail(errorText) {
    return {
        type: PAYING_FAILURE,
        payload: {
            statusText: errorText
        }
    }
}

function payingGetSuccess(data) {
    return {
        type: PAYING_GET_SUCCESS,
        payload: {
            data,
        }
    }
}

function getPayingInfo() {
    const userId = cookie.load('userId');

    return sendRequest({
        method: 'GET',
        url: 'profile/paying/',
        before: { type: PAYING_GET_REQUEST },
        success: function(response) {
            return payingGetSuccess(response.data);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return fail(errorData.details);
            }
            else {
                return fail("It has been failed to get paying information.");
            }
        }
    });
}

function payingSaveSuccess(data) {
    return {
        type: PAYING_SAVE_SUCCESS,
        payload: {
            data,
        }
    }
}

function savePayingInfo(customer) {
    const userId = cookie.load('userId');
    let data = {
        user: userId,
        stripe_token: customer.id,
    };

    if(customer.sources.data.length) {
        const source = customer.sources.data[0];
        data = Object.assign(data, {
            card_fingerprint: source.fingerprint,
            card_last_4: source.last4,
            card_kind: source.brand,
            card_name: source.name,
            card_exp_month: source.exp_month,
            card_exp_year: source.exp_year,
        });
    }

    return sendRequest({
        method: 'PATCH',
        url: 'profile/paying/',
        data: data,
        before: { type: PAYING_SAVE_REQUEST },
        success: function(response) {
            return payingSaveSuccess(response.data);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return fail(errorData.details);
            }
            else {
                return fail("It has been failed to save paying information.");
            }
        }
    });
}

module.exports = {
    savePayingInfo,
    getPayingInfo,
};
