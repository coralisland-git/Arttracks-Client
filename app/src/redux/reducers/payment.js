/**
 * Created by jarosanger on 5/5/17.
 */
import R from 'ramda';
import { PAYMENT_FAILURE, 
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

const initialState = {
    statusText: null,
    status: null,
    customer: null,
    invoices: [],
    payments: [],
    detail: null,
    subscription: null,
    charge: null,
};

function payment(state = initialState, action) {
    switch(action.type) {
        case PAYMENT_FAILURE:
            return Object.assign({}, state, {
                'status': 'failed',
                'statusText': action.payload.errorText,
            });

        case PLAN_UPGRADE_REQUEST:
            return Object.assign({}, state, {
                'status': 'processing',
            });

        case PLAN_UPGRADE_SUCCESS:
            return Object.assign({}, state, {
                'status': 'proceed',
                'customer': action.payload.customer,
                'subscription': action.payload.subscription,
            });

        case CUSTOMER_GET_REQUEST:
            return Object.assign({}, state, {
                'status': 'gettingCustomer',
            });

        case CUSTOMER_GET_SUCCESS:
            return Object.assign({}, state, {
                'status': 'gotCustomer',
                'customer': action.payload.data,
            });

        case CUSTOMER_CREATE_REQUEST:
            return Object.assign({}, state, {
                'status': 'creatingCustomer',
            });

        case CUSTOMER_CREATE_SUCCESS:
            return Object.assign({}, state, {
                'status': 'createdCustomer',
                'customer': action.payload.data,
            });

        case PAYMENT_CREATE_REQUEST:
            return Object.assign({}, state, {
                'status': 'processing',
            });

        case PAYMENT_CREATE_SUCCESS:
            return Object.assign({}, state, {
                'status': 'proceed',
                'customer': action.payload.customer,
                'charge': action.payload.charge,
            });

        case CARD_CREATE_REQUEST:
            return Object.assign({}, state, {
                'status': 'creating',
            });

        case CARD_CREATE_SUCCESS:
            return Object.assign({}, state, {
                'status': 'created',
                'customer': action.payload.customer,
            });

        case CARD_UPDATE_REQUEST:
            return Object.assign({}, state, {
                'status': 'updating',
            });

        case CARD_UPDATE_SUCCESS:
            return Object.assign({}, state, {
                'status': 'updated',
                'customer': action.payload.customer,
            });

        case CARD_REMOVE_REQUEST:
            return Object.assign({}, state, {
                'status': 'removing',
            });

        case CARD_REMOVE_SUCCESS:
            return Object.assign({}, state, {
                'status': 'removed',
                'customer': action.payload.customer,
            });

        case INVOICES_GET_SUCCESS:
            return Object.assign({}, state, {
                'status': 'gotInvoices',
                'invoices': action.payload.data,
            });

        case PAYMENTS_GET_SUCCESS:
            return Object.assign({}, state, {
                'status': 'gotPayments',
                'payments': action.payload.data,
            });

        case PAYMENTS_SET_DETAIL:
            return Object.assign({}, state, {
                'status': 'setDetail',
                'detail': action.payload,
            });

        default:
            return Object.assign({}, state);
    }
}

module.exports = {
    payment,
};