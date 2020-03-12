import { SHOW_POPUP_PURCHASE, CLOSE_POPUP_PURCHASE } from '../../constants';

function showPuchasePopup(options) {
    return dispatch => {
        dispatch({
            type: SHOW_POPUP_PURCHASE,
            payload: options,
        })
    }
}

function closePuchasePopup() {
    return dispatch => {
        dispatch({
            type: CLOSE_POPUP_PURCHASE,
        })
    }
}

module.exports = {
    showPuchasePopup,
    closePuchasePopup,
};
