import * as Stripe from '../services/stripe';

const activeCustomer = (customerId, cardId, cmdCard, makeDefault=true) => {
  if(customerId != undefined) {
    return Stripe.activeCard(customerId, cardId, cmdCard, makeDefault);
  }
  else {
    return Stripe.createCustomer({source: cardId});
  }
}

export const getCustomer = (req, res) => {
  const { customerId } = req.params;

  if(customerId) {
    Stripe.getCustomer(customerId)
      .then((customer) => {
        res.status(200).send(customer);
      })
      .catch((error) => {
        console.log(error);
        if(error.statusCode && error.message)
          res.status(error.statusCode).json(error.message);
        else
          res.status(500).json('Internal server error!');
      });
  }
  else {
    res.status(400).json("You must provide valid customer ID");
  }
};

export const createCustomer = (req, res) => {
  const { email } = req.body;
  const description = "Account on Arttracks.com";

  Stripe.createCustomer({email, description})
    .then((customer) => Stripe.createSubscription(customer.id, 'starter-monthly'))
    .then((subscription) => Stripe.getCustomer(subscription.customer))
    .then((customer) => {
      res.status(200).send(customer);
    })
    .catch((error) => {
      console.log(error);
      if(error.statusCode && error.message)
        res.status(error.statusCode).json(error.message);
      else
        res.status(500).json('Internal server error!');
    });
};

export const updateSubscribe = (req, res) => {
  const { customerId, cardId, cmdCard, plan } = req.body;

  if(plan) {
    if(cardId) {
      activeCustomer(customerId, cardId, cmdCard)
        .then((customer) => Stripe.createSubscription(customer.id, plan))
        .then((subscription) => Stripe.getCustomer(subscription.customer).then((customer) => ({customer, subscription})))
        .then(({customer, subscription}) => {
          res.status(200).send({customer, subscription});
        })
        .catch((error) => {
          console.log(error);
          if(error.statusCode && error.message)
            res.status(error.statusCode).json(error.message);
          else
            res.status(500).json('Internal server error!');
        });
    }
    else if(customerId) {
      Stripe.createSubscription(customerId, plan)
        // .then((subscription) => Stripe.getCustomer(subscription.customer))
        .then((subscription) => Stripe.getCustomer(subscription.customer).then((customer) => ({customer, subscription})))
        .then(({customer, subscription}) => {
          res.status(200).send({customer, subscription});
        })
        .catch((error) => {
          console.log(error);
          if(error.statusCode && error.message)
            res.status(error.statusCode).json(error.message);
          else
            res.status(500).json('Internal server error!');
        });
    }
    else {
      res.status(400).json("You must provide valid token and plan");
    }
  }
  else {
    res.status(400).json("You must provide plan");
  }
};

export const createPayment = (req, res) => {
  const { customerId, cardId, cmdCard, price, item, quantity } = req.body;
  let amount = parseInt(parseFloat(price) * 100);

  if(cardId && amount > 50) {
    activeCustomer(customerId, cardId, cmdCard)
      .then((customer) => Stripe.createCharge(customer.id, amount, item, quantity))
      // .then((charge) => Stripe.getCustomer(charge.customer))
      .then((charge) => Stripe.getCustomer(charge.customer).then((customer) => ({customer, charge})))
      .then(({customer, charge}) => {
        res.status(200).send({customer, charge});
      })
      .catch((error) => {
        console.log(error);
        if(error.statusCode && error.message)
          res.status(error.statusCode).json(error.message);
        else
          res.status(500).json('Internal server error!');
      });
  }
  else {
    res.status(400).json("You must provide valid token and price > 0.5");
  }
};

export const createCard = (req, res) => {
  const { customerId, cardId, cmdCard, makeDefault } = req.body;

  if(cardId) {
    activeCustomer(customerId, cardId, cmdCard, makeDefault)
      .then((customer) => {
        res.status(200).send(customer);
      })
      .catch((error) => {
        console.log(error);
        if(error.statusCode && error.message)
          res.status(error.statusCode).json(error.message);
        else
          res.status(500).json('Internal server error!');
      });
  }
  else {
    res.status(400).json("You must provide valid token");
  }
};

export const makeDefaultCard = (req, res) => {
  const { customerId, cardId } = req.body;

  if(customerId && cardId) {
    Stripe.updateCustomer(customerId, {default_source: cardId})
      .then((customer) => {
        res.status(200).send(customer);
      })
      .catch((error) => {
        console.log(error);
        if(error.statusCode && error.message)
          res.status(error.statusCode).json(error.message);
        else
          res.status(500).json('Internal server error!');
      });
  }
  else {
    res.status(400).json("You must provide valid customer and card");
  }
};

export const deleteCard = (req, res) => {
  const { customerId, cardId } = req.params;

  if(customerId && cardId) {
    Stripe.deleteCard(customerId, cardId)
      .then(() => Stripe.getCustomer(customerId))
      .then((customer) => {
        res.status(200).send(customer);
      })
      .catch((error) => {
        console.log(error);
        if(error.statusCode && error.message)
          res.status(error.statusCode).json(error.message);
        else
          res.status(500).json('Internal server error!');
      });
  }
  else {
    res.status(400).json("You must provide valid customer and card");
  }
};

export const getInvoices = (req, res) => {
  const { customerId } = req.params;

  if(customerId) {
    Stripe.getCustomerInvoices(customerId)
      .then((invoices) => {
        res.status(200).send(invoices);
      })
      .catch((error) => {
        console.log(error);
        if(error.statusCode && error.message)
          res.status(error.statusCode).json(error.message);
        else
          res.status(500).json('Internal server error!');
      });
  }
  else {
    res.status(400).json("You must provide valid customer ID");
  }
};

export const getPayments = (req, res) => {
  const { customerId } = req.params;

  if(customerId) {
    Stripe.getCustomerPayments(customerId)
      .then((charges) => {
        res.status(200).send(charges);
      })
      .catch((error) => {
        console.log(error);
        if(error.statusCode && error.message)
          res.status(error.statusCode).json(error.message);
        else
          res.status(500).json('Internal server error!');
      });
  }
  else {
    res.status(400).json("You must provide valid customer ID");
  }
};
