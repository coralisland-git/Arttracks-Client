import axios from 'axios';
import cookie from 'react-cookie';
import { SERVER_URL, PLAN_FAILURE,
    PLAN_GET_REQUEST, PLAN_GET_SUCCESS,
    QUOTAS_GET_REQUEST, QUOTAS_GET_SUCCESS,
    PLAN_VIEW_OPTIONS, SHOW_POPUP_PURCHASE,
    PLAN_ORDER_REQUEST, PLAN_ORDER_SUCCESS,
} from '../../constants';
import { sendRequest } from '../../services/requests';
import { checkHttpStatus } from '../../utils';

function failPlan(errorText) {
    return {
        type: PLAN_FAILURE,
        payload: {
            errorText
        }
    }
}

function planGetSuccess(data) {
    return {
        type: PLAN_GET_SUCCESS,
        payload: {
            plans: data
        }
    }
}

function getPlans() {
    return sendRequest({
        method: 'GET',
        url: 'plans/',
        before: { type: PLAN_GET_REQUEST },
        success: function(response) {
            return planGetSuccess(response.data);
        },
        fail: function(errorData) {
            return failPlan('It has been failed to get plans.');
        }
    });
}

function quotasGetSuccess(planId, data) {
    return {
        type: QUOTAS_GET_SUCCESS,
        payload: {
            planId,
            quotas: data
        }
    }
}

function getPlanQuotas(planId) {
    return sendRequest({
        method: 'GET',
        url: `plans/${planId}/quotas/`,
        before: { type: QUOTAS_GET_REQUEST },
        success: function(response) {
            return quotasGetSuccess(planId, response.data);
        },
        fail: function(errorData) {
            return failPlan('It has been failed to get plan quotas.');
        }
    });
}

function choosePlan(options) {
    return dispatch => {
        dispatch({
            type: PLAN_VIEW_OPTIONS,
            payload: options,
        })
    }
}

function orderPlanSuccess(order, plan) {
    return {
        type: PLAN_ORDER_SUCCESS,
        payload: {
            plan,
            order,
        }
    }
}

function orderPlan(plan, term) {
    const userId = cookie.load('userId');

    return sendRequest({
        method: 'POST',
        url: 'profile/plan/change/calculate/',
        data: { term: term, requested_plan: plan.id },
        before: { type: PLAN_ORDER_REQUEST, payload: { plan } },
        success: function(response) {
            return orderPlanSuccess(response.data, plan);
        },
        fail: function(errorData) {
            if(errorData.details !== undefined) {
                return failPlan(errorData.details);
            }
            else {
                return failPlan("It has been failed to order plan.");
            }
        }
    });
}


module.exports = {
    getPlans,
    getPlanQuotas,
    choosePlan,
    orderPlan,
};
