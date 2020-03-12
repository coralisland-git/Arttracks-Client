/**
 * Created by jarosanger on 5/5/17.
 */
import R from 'ramda';
import {
    CREDIT_SET_SELECTION,
    VIDEOTIME_SET_TIMES,
    VIDEOTIME_SET_TIMES_DISCOUNT_RATE,
    VIDEOTIME_SET_TIMES_TOTAL_PRICE,
    TIMES_COST_STANDARD,
    TIMES_COST_MULTIPLIER,
    TIMES_COST_DISCOUNT_FACTOR,
    TIMES_COST_LOWEST_DISCOUNT,
} from '../../constants';

const initialState = {
    selection: [],
    credits: {
        count: 0,
        price: 0.0,
        discount: 0.0,
        oldCredits: 0,
    },
    times: {
        count: 0,
        totalPrice: 0.0,
        discountRate: TIMES_COST_STANDARD,
        oldTimes: 0,
    },
};

function buy(state = initialState, action) {
    switch(action.type) {
        case CREDIT_SET_SELECTION:
            const { selection, oldCredits } = action.payload;

            let totalCount = 0;
            let totalPrice = 0.0;
            let totalDiscount = 0.0;

            selection.forEach(credit => {
                let price = credit.count * credit.price;
                totalCount = totalCount + credit.count;
                totalDiscount = totalDiscount + (credit.count - price);
                totalPrice = totalPrice + price;
            });

            return Object.assign({}, state, {
                'selection': selection.concat(),
                'credits': {
                    count: totalCount,
                    price: totalPrice,
                    discount: totalDiscount,
                    oldCredits,
                }
            });

        case VIDEOTIME_SET_TIMES:
            const { times, oldTimes } = action.payload;

            let totalTimeCount = 0;
            let totalTimePrice = 0.0;
            let discountRate = TIMES_COST_STANDARD;
            let discountPrice = 0.0;

            totalTimeCount = totalTimeCount + times.count;

            discountPrice = discountPrice + (TIMES_COST_MULTIPLIER * (times.count**TIMES_COST_DISCOUNT_FACTOR));

            if(times.count) {
              discountRate = (discountPrice/times.count);
              if(discountRate > TIMES_COST_STANDARD) {
                discountRate = TIMES_COST_STANDARD;
              } else if (discountRate < TIMES_COST_LOWEST_DISCOUNT) {
                discountRate = TIMES_COST_LOWEST_DISCOUNT;
              }
            }

            let price = times.count * discountRate;
            totalTimePrice = totalTimePrice + price;

            return Object.assign({}, state, {
                'times': {
                  count: totalTimeCount,
                  discountRate: discountRate,
                  totalPrice: totalTimePrice,
                  oldTimes,
                },
            });

        default:
            return Object.assign({}, state);
    }
}

module.exports = {
    buy,
};