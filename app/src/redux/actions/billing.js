/**
 * Created by jarosanger on 8/15/16.
 */
import cookie from 'react-cookie';
import { BILLING_FAILURE, BILLING_GET_REQUEST, BILLING_GET_SUCCESS, BILLING_SAVE_REQUEST, BILLING_SAVE_SUCCESS } from '../../constants';
import { checkHttpStatus } from '../../utils';
import { sendRequest } from '../../services/requests';

function fail(errorText) {
    return {
        type: BILLING_FAILURE,
        payload: {
            statusText: errorText
        }
    }
}

function billingGetSuccess(data) {
    return {
        type: BILLING_GET_SUCCESS,
        payload: {
            data,
        }
    }
}

function getBillingInfo() {
    const userId = cookie.load('userId');

    return sendRequest({
        method: 'GET',
        url: 'profile/billing/',
        before: { type: BILLING_GET_REQUEST },
        success: function(response) {
            return billingGetSuccess(response.data);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return fail(errorData.details);
            }
            else {
                return fail("It has been failed to get billing information.");
            }
        }
    });
}

function billingSaveSuccess(data) {
    return {
        type: BILLING_SAVE_SUCCESS,
        payload: {
            data,
        }
    }
}

function saveBillingInfo(formdata, isUpdate) {
    const userId = cookie.load('userId');
    const data = {
        user: userId,
        first_name: formdata.firstName,
        last_name: formdata.lastName,
        street: formdata.street,
        zipcode: formdata.zipcode,
        city: formdata.city,
        unit: formdata.unit,
        state: formdata.province,
        country: formdata.country,
    };

    if(formdata.companyName !== undefined) {
        data.company_name = formdata.companyName;
    }

    return sendRequest({
        method: isUpdate? 'PATCH': 'POST',
        url: 'profile/billing/',
        data: data,
        before: { type: BILLING_SAVE_REQUEST },
        success: function(response) {
            return billingSaveSuccess(response.data);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return fail(errorData.details);
            }
            else {
                return fail("We're sorry something went wrong when trying to save your billing information.");
            }
        }
    });
}

module.exports = {
    saveBillingInfo,
    getBillingInfo,
};
