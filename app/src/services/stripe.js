/**
 * Created by jarosanger on 05/16/17.
 */
import { STRIPE_SECRET_KEY } from '../constants';

const stripe = require("stripe")(STRIPE_SECRET_KEY);

export const getCustomer = (customerId) => {
    return new Promise((resolve, reject) => {
        stripe.customers.retrieve(customerId, function(err, customer) {
            if(err) {
                reject(err);
            }
            else {
                resolve(customer);
            }
        });
    });
};

export const createCustomer = (options) => {
    return new Promise((resolve, reject) => {
        stripe.customers.create(options, function(err, customer) {
            if(err) {
                reject(err);
            }
            else {
                resolve(customer);
            }
        });
    });
};

export const updateCustomer = (customerId, options) => {
    return new Promise((resolve, reject) => {
        stripe.customers.update(customerId, options, function(err, customer) {
            if(err) {
                reject(err);
            }
            else {
                resolve(customer);
            }
        });
    });
};

export const deleteCard = (customerId, cardId) => {
    return new Promise((resolve, reject) => {
        stripe.customers.deleteCard(customerId, cardId, function(err, response) {
            if(err) {
                reject(err);
            }
            else {
                resolve();
            }
        });
    });
};

export const activeCard = (customerId, cardId, cmdCard, makeDefault) => {
    return new Promise((resolve, reject) => {
        if(cmdCard == 'create') {
            stripe.customers.createSource(customerId, {
                source: cardId
            }, function(err, card) {
                if(err) {
                    reject(err);
                }
                else {
                    if(makeDefault) {
                        stripe.customers.update(customerId, {
                            default_source: card.id
                        }, function(err, customer) {
                            if(err) {
                                reject(err);
                            }
                            else {
                                resolve(customer);
                            }
                        });
                    }
                    else {
                        stripe.customers.retrieve(customerId, function(err, customer) {
                            if(err) {
                                reject(err);
                            }
                            else {
                                resolve(customer);
                            }
                        });
                    }
                }
            });
        }
        else {
            stripe.customers.update(customerId, {
                default_source: cardId
            }, function(err, customer) {
                if(err) {
                    reject(err);
                }
                else {
                    resolve(customer);
                }
            });
        }
    });
}

export const createSubscription = (customerId, plan) => {
    return new Promise((resolve, reject) => {
        stripe.customers.retrieve(customerId, function(err, customer) {
            if(err) {
                reject(err);
            }
            else {
                const subscriptions = customer.subscriptions;
                if(subscriptions && subscriptions.data && subscriptions.data.length > 0) {
                    console.log('Updating subscription', customerId, subscriptions.data[0].id, plan);

                    stripe.subscriptions.update(subscriptions.data[0].id, { 
                        plan: plan,
                    }, function(err, subscription) {
                        if(err) {
                            reject(err);
                        }
                        else {
                            resolve(subscription);
                        }
                    });
                }
                else {
                    console.log('Creating subscription', customerId, plan);

                    stripe.subscriptions.create({
                        customer: customerId,
                        plan: plan
                    }, function(err, subscription) {
                        if(err) {
                            reject(err);
                        }
                        else {
                            resolve(subscription);
                        }
                    });
                }
            }
        });
    });
};

export const createCharge = (customerId, amount, item, quantity) => {
    return new Promise((resolve, reject) => {
        stripe.charges.create({
            amount,
            currency: "usd",
            customer: customerId,
            metadata: { item, quantity },
            description: `Payment for ${quantity} ${item}`,
        }, function(err, charge) {
            if(err) {
                reject(err);
            }
            else {
                console.log('Creating charge', charge.id, charge.amount);
                resolve(charge);
            }
        });
    });
};

export const getCustomerInvoices = (customerId) => {
    return new Promise((resolve, reject) => {
        stripe.invoiceItems.list({
            customer: customerId,
        }, function(err, invoiceitems) {
            if(err) {
                reject(err);
            }
            else {
                resolve(invoiceitems.data);
            }
        });
    });
};

export const getCustomerPayments = (customerId) => {
    return new Promise((resolve, reject) => {
        stripe.charges.list({
            customer: customerId,
        }, function(err, charges) {
            if(err) {
                reject(err);
            }
            else {
                resolve(charges.data);
            }
        });
    });
};
