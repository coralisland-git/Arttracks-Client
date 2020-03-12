/**
 * Created by jarosanger on 5/5/17.
 */
import R from 'ramda';
import {
    PLAN_FAILURE, PLAN_GET_REQUEST, PLAN_GET_SUCCESS,
    QUOTAS_GET_REQUEST, QUOTAS_GET_SUCCESS,
    PLAN_VIEW_OPTIONS, 
    PLAN_ORDER_REQUEST, PLAN_ORDER_SUCCESS,
} from '../../constants';

const initialState = {
    statusText: null,
    status: null,
    plans: null,
    selectedPlan: null,
    returnUrl: '/settings',
    order: null,
};

function plan(state = initialState, action) {
    switch(action.type) {
        case PLAN_FAILURE:
            return Object.assign({}, state, {
                'status': 'failed',
                'statusText': action.payload.errorText,
            });
        
        case PLAN_GET_REQUEST:
            return Object.assign({}, state, {
                'status': 'gettingPlans',
            });
        
        case PLAN_GET_SUCCESS:
            return Object.assign({}, state, {
                'status': 'gotPlans',
                'plans': action.payload.plans
            });
        
        case QUOTAS_GET_REQUEST:
            return Object.assign({}, state, {
                'status': 'gettingQuotas',
            });
        
        case QUOTAS_GET_SUCCESS:
            const { plans } = state;
            if(plans) {
                const index = R.findIndex(R.propEq('id', action.payload.planId))(plans);
                if(index !== -1) {
                    plans[index] = Object.assign({}, plans[index], {
                        'quotas': action.payload.quotas,
                        'hasQuotas': true,
                    })
                }

                return Object.assign({}, state, {
                    'status': 'gotQuotas',
                    'plans': plans.concat([]),
                });
            }

            return state;

        case PLAN_VIEW_OPTIONS:
            return Object.assign({}, state, {
                'status': 'choosePlan',
                'returnUrl': action.payload.returnUrl,
            });
        
        case PLAN_ORDER_REQUEST:
            return Object.assign({}, state, {
                'status': 'ordering',
                'selectedPlan': action.payload.plan,
            });

        case PLAN_ORDER_SUCCESS:
            return Object.assign({}, state, {
                'status': 'ordered',
                'selectedPlan': action.payload.plan,
                'order': action.payload.order,
            });

        default:
            return Object.assign({}, state);
    }
}

module.exports = {
    plan,
};