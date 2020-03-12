/**
 * Created by jarosanger on 5/5/17.
 */
import R from 'ramda';
import { SHOW_POPUP_PURCHASE, CLOSE_POPUP_PURCHASE } from '../../constants';

const initialState = {
    purchase: {
        show: false,
        section: null,
        quota: null,
    },
};

function popup(state = initialState, action) {
    switch(action.type) {
        case SHOW_POPUP_PURCHASE:
            return Object.assign({}, state, {
                'purchase': Object.assign({}, state.purchase, {
                    "show": true,
                    ...action.payload,
                })
            });
        
        case CLOSE_POPUP_PURCHASE:
            return Object.assign({}, state, {
                'purchase': Object.assign({}, state.purchase, {
                    "show": false,
                })
            });
        
        default:
            return Object.assign({}, state);
    }
}

module.exports = {
    popup,
};