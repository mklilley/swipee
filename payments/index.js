// References: https://stripe.com/docs/payments/integration-builder

/* eslint-disable  no-prototype-builtins */

const express = require("express");
var cors = require("cors");
const app = express();

const stripe = require("stripe")(process.env.API_KEY_TEST);

const PORT = process.env.PORT || 9000;

const PRICES = JSON.parse(process.env.PRICES);

app.use(cors());
app.use(express.static("."));
app.use(express.json());

const calculateOrderAmount = (items) => {
  let totalCost = 0;
  for (const item of items) {
    totalCost += item.quantity * PRICES[item.code];
  }
  return totalCost;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;

  // validate input
  let itemsValidated = false;
  if (typeof items === "object" && items instanceof Array) {
    itemsValidated = items.every((obj) => {
      if (obj) {
        if (obj.hasOwnProperty("code") && obj.hasOwnProperty("quantity")) {
          const check_code =
            typeof obj.code === "string" && PRICES[obj.code] !== undefined;
          const check_quantity =
            typeof obj.quantity === "number" &&
            obj.quantity % 1 === 0 &&
            obj.quantity > 0;
          return check_code && check_quantity;
        } else {
          // element of array does not have "code" and "quantity" keys
          return false;
        }
      } else {
        // element of a array is empty, i.e. null, or undefined or ""
        return false;
      }
    });
  } else {
    // not js array return error
    itemsValidated = false;
  }

  if (itemsValidated) {
    //Create a PaymentIntent with the order amount and currency
    const paymentIntent = await stripe.paymentIntents.create({
      amount: calculateOrderAmount(items),
      currency: "gbp",
    });

    res.send({
      clientSecret: paymentIntent.client_secret,
    });
  } else {
    // error in some input data, return error
    res
      .status(400)
      .json({ type: "error", message: "Badly formatted payment data" });
  }
});

app.get("/");

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));
