import axios from 'axios';
import cookie from 'react-cookie';
import {
    CREDIT_SET_SELECTION,
    VIDEOTIME_SET_TIMES,
    VIDEOTIME_SET_TIMES_DISCOUNT_RATE,
    VIDEOTIME_SET_TIMES_TOTAL_PRICE,
} from '../../constants';
import { sendRequest } from '../../services/requests';
import { checkHttpStatus } from '../../utils';

function selectCredits(selection, oldCredits) {
    return dispatch => {
        dispatch({
            type: CREDIT_SET_SELECTION,
            payload: {
                selection,
                oldCredits,
            },
        })
    }
}

function setVideoTimes(times, oldTimes) {
    return dispatch => {
        dispatch({
            type: VIDEOTIME_SET_TIMES,
            payload: {
                times,
                oldTimes,
            }
        })
    }
}

function setVideoTimesDiscountRate(rate) {
    return dispatch => {
        dispatch({
            type: VIDEOTIME_SET_TIMES_DISCOUNT_RATE,
            payload: rate,
        })
    }
}

function setVideoTimesTotalPrice(price) {
    return dispatch => {
        dispatch({
            type: VIDEOTIME_SET_TIMES_TOTAL_PRICE,
            payload: price,
        })
    }
}

module.exports = {
    selectCredits,
    setVideoTimes,
};
