import axios from 'axios';
import cookie from 'react-cookie';
import { SERVER_URL, BASE_TAP_URL, TAP_API_KEY, PAYMENT_FAILURE,
    PLAN_UPGRADE_REQUEST, PLAN_UPGRADE_SUCCESS,
    CUSTOMER_GET_REQUEST, CUSTOMER_GET_SUCCESS,
    CUSTOMER_CREATE_REQUEST, CUSTOMER_CREATE_SUCCESS,
    PAYMENT_CREATE_REQUEST, PAYMENT_CREATE_SUCCESS,
    CARD_CREATE_REQUEST, CARD_CREATE_SUCCESS,
    CARD_UPDATE_REQUEST, CARD_UPDATE_SUCCESS,
    CARD_REMOVE_REQUEST, CARD_REMOVE_SUCCESS,
    INVOICES_GET_REQUEST, INVOICES_GET_SUCCESS,
    PAYMENTS_GET_REQUEST, PAYMENTS_GET_SUCCESS, PAYMENTS_SET_DETAIL,
} from '../../constants';
import { sendRequest } from '../../services/requests';
import { checkHttpStatus } from '../../utils';

function failPayment(errorText) {
    return {
        type: PAYMENT_FAILURE,
        payload: {
            errorText
        }
    }
}

function upgradePlanSuccess({customer, subscription}) {
    
    /*const userId = cookie.load('userId') ? cookie.load('userId') : 0;
    var tapData = [];
    var conversionId = 0;
    var chargeAmount = subscription.plan.amount * .01;

    axios.get(`${BASE_TAP_URL}conversions/?external_id=${userId}`, {
      headers: {
        'Api-Key': TAP_API_KEY
      }
    })
    .then(checkHttpStatus)
    .then((response) => {
        console.log('Tapfiliate response', response);

        tapData = response.data;

        if (tapData.length) {
          // Create the commission
          console.log("About to create a commission for conversion: " + tapData[0].id);

          conversionId = tapData[0].id;
          
          axios.post(`${BASE_TAP_URL}conversions/${conversionId}/commissions/`, {
            conversion_sub_amount: chargeAmount,
            commission_type: "plan-upgrade",
            comment: "Someone you referred just upgraded their subscription plan."
          }, {
            headers: {
              'Api-Key': TAP_API_KEY
            }
          })
          .then(checkHttpStatus)
          .then((response) => {
              console.log('Tapfiliate commission response', response);
          })
          .catch((error) => {
              console.log('error', error.response);
          });
        }
    })
    .catch((error) => {
        console.log('error', error.response);
    });*/

    return {
        type: PLAN_UPGRADE_SUCCESS,
        payload: {
            customer,
            subscription,
        }
    }
}

function upgradePlan(options) {
    return dispatch => {
        dispatch({ type: PLAN_UPGRADE_REQUEST });

        return axios({
            url: SERVER_URL + 'stripe/subscribe',
            method: 'POST',
            data: options,
            responseType: 'json',
        })
        .then(checkHttpStatus)
        .then((response) => {
            dispatch(upgradePlanSuccess(response.data));
        })
        .catch((error) => {
            console.log('error', error.response);
            if(error.response && error.response.data)
                dispatch(failPayment(error.response.data));
            else
                dispatch(failPayment(null));
        });
    };
}

function getStripeCustomer(customerId) {
    return dispatch => {
        dispatch({ type: CUSTOMER_GET_REQUEST });

        return axios({
            url: SERVER_URL + 'stripe/customer/' + customerId,
            method: 'GET',
            responseType: 'json',
        })
        .then(checkHttpStatus)
        .then((response) => {
            console.log('customer', response);
            dispatch({
                type: CUSTOMER_GET_SUCCESS,
                payload: { data: response.data }
            });
        })
        .catch((error) => {
            console.log('error', error.response);
            dispatch(failPayment("Failed to get stripe customer info."));
        });
    };
}

function createStripeCustomer(options) {
    return dispatch => {
        dispatch({ type: CUSTOMER_CREATE_REQUEST });

        return axios({
            url: SERVER_URL + 'stripe/customer',
            method: 'POST',
            data: options,
            responseType: 'json',
        })
        .then(checkHttpStatus)
        .then((response) => {
            console.log('customer', response);
            dispatch({
                type: CUSTOMER_CREATE_SUCCESS,
                payload: { data: response.data }
            });
        })
        .catch((error) => {
            console.log('error', error.response);
            dispatch(failPayment("It has been failed to create stripe customer."));
        });
    };
}

function createPaymentSuccess({customer, charge}) {

    const userId = cookie.load('userId') ? cookie.load('userId') : 0;
    var tapData = [];
    var conversionId = 0;
    var chargeAmount = charge.amount * .01;

    axios.get(`${BASE_TAP_URL}conversions/?external_id=${userId}`, {
      headers: {
        'Api-Key': TAP_API_KEY
      }
    })
    .then(checkHttpStatus)
    .then((response) => {
        console.log('Tapfiliate response', response);

        tapData = response.data;

        if (tapData.length) {
          // Create the commission
          console.log("About to create a commission for conversion: " + tapData[0].id);

          conversionId = tapData[0].id;
          
          axios.post(`${BASE_TAP_URL}conversions/${conversionId}/commissions/`, {
            conversion_sub_amount: chargeAmount,
            commission_type: "video-time-buy",
            comment: "Someone you referred just purchased video time credtis."
          }, {
            headers: {
              'Api-Key': TAP_API_KEY
            }
          })
          .then(checkHttpStatus)
          .then((response) => {
              console.log('Tapfiliate commission response', response);
          })
          .catch((error) => {
              console.log('error', error.response);
          });
        }
    })
    .catch((error) => {
        console.log('error', error.response);
    });

    return {
        type: PAYMENT_CREATE_SUCCESS,
        payload: {
            customer,
            charge,
        }
    }
}

function createPayment(options) {
    return dispatch => {
        dispatch({ type: PAYMENT_CREATE_REQUEST });

        return axios({
            url: SERVER_URL + 'stripe/payment',
            method: 'POST',
            data: options,
            responseType: 'json',
        })
        .then(checkHttpStatus)
        .then((response) => {
            console.log('payment', response);
            dispatch(createPaymentSuccess(response.data));
        })
        .catch((error) => {
            console.log('error', error.response);
            if(error.response && error.response.data)
                dispatch(failPayment(error.response.data));
            else
                dispatch(failPayment(null));
        });
    };
}

function createCardSuccess(customer) {
    return {
        type: CARD_CREATE_SUCCESS,
        payload: {
            customer
        }
    }
}

function createCard(options) {
    return dispatch => {
        dispatch({ type: CARD_CREATE_REQUEST });

        return axios({
            url: SERVER_URL + 'stripe/card',
            method: 'POST',
            data: options,
            responseType: 'json',
        })
        .then(checkHttpStatus)
        .then((response) => {
            console.log('card', response);
            dispatch(createCardSuccess(response.data));
        })
        .catch((error) => {
            console.log('error', error.response);
            if(error.response && error.response.data)
                dispatch(failPayment(error.response.data));
            else
                dispatch(failPayment("It has been failed to create card."));
        });
    };
}

function makeDefaultCardSuccess(customer) {
    return {
        type: CARD_UPDATE_SUCCESS,
        payload: {
            customer
        }
    }
}

function makeDefaultCard(customerId, cardId) {
    return dispatch => {
        dispatch({ type: CARD_UPDATE_REQUEST });

        return axios({
            url: SERVER_URL + 'stripe/card',
            method: 'PATCH',
            data: {customerId, cardId},
            responseType: 'json',
        })
        .then(checkHttpStatus)
        .then((response) => {
            console.log('card', response);
            dispatch(makeDefaultCardSuccess(response.data));
        })
        .catch((error) => {
            console.log('error', error.response);
            if(error.response && error.response.data)
                dispatch(failPayment(error.response.data));
            else
                dispatch(failPayment("It has been failed to change card."));
        });
    };
}

function removeCardSuccess(customer) {
    return {
        type: CARD_REMOVE_SUCCESS,
        payload: {
            customer
        }
    }
}

function removeCard(customerId, cardId) {
    return dispatch => {
        dispatch({ type: CARD_REMOVE_REQUEST });

        return axios({
            url: SERVER_URL + 'stripe/card/' + customerId + '/' + cardId,
            method: 'DELETE',
            responseType: 'json',
        })
        .then(checkHttpStatus)
        .then((response) => {
            console.log('card', response);
            dispatch(removeCardSuccess(response.data));
        })
        .catch((error) => {
            console.log('error', error.response);
            if(error.response && error.response.data)
                dispatch(failPayment(error.response.data));
            else
                dispatch(failPayment("It has been failed to remove card."));
        });
    };
}

function invoiceGetSuccess(data) {
    return {
        type: INVOICES_GET_SUCCESS,
        payload: {
            data,
        }
    }
}

function getInvoices(customerId) {
    return dispatch => {
        dispatch({ type: INVOICES_GET_REQUEST });

        return axios({
            url: SERVER_URL + 'stripe/invoices/' + customerId,
            method: 'GET',
            responseType: 'json',
        })
        .then(checkHttpStatus)
        .then((response) => {
            console.log('invoices', response);
            dispatch(invoiceGetSuccess(response.data));
        })
        .catch((error) => {
            console.log('error', error.response);
            if(error.response && error.response.data)
                dispatch(failPayment(error.response.data));
            else
                dispatch(failPayment("It has been failed to get invoices."));
        });
    };
}

function paymentGetSuccess(data) {
    return {
        type: PAYMENTS_GET_SUCCESS,
        payload: {
            data,
        }
    }
}

function getPayments(customerId) {
    return dispatch => {
        dispatch({ type: PAYMENTS_GET_REQUEST });

        return axios({
            url: SERVER_URL + 'stripe/payments/' + customerId,
            method: 'GET',
            responseType: 'json',
        })
        .then(checkHttpStatus)
        .then((response) => {
            console.log('payments', response);
            dispatch(paymentGetSuccess(response.data));
        })
        .catch((error) => {
            console.log('error', error.response);
            if(error.response && error.response.data)
                dispatch(failPayment(error.response.data));
            else
                dispatch(failPayment("It has been failed to get payments."));
        });
    };
}

function setPaymentDetail(detail) {
    return dispatch => {
        dispatch({ type: PAYMENTS_SET_DETAIL, payload: detail });
    };
}

module.exports = {
    upgradePlan,
    createStripeCustomer,
    getStripeCustomer,
    createPayment,
    createCard,
    makeDefaultCard,
    removeCard,
    getInvoices,
    getPayments,
    setPaymentDetail,
};
