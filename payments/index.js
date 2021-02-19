// References: https://stripe.com/docs/payments/integration-builder

const express = require("express");
var cors = require("cors");
const app = express();

const stripe = require("stripe")(process.env.API_KEY_TEST);

const PORT = process.env.PORT || 9000;

app.use(cors());
app.use(express.static("."));
app.use(express.json());

const calculateOrderAmount = (items) => {
  const costOfCreditsBundle10 = 100;
  const totalCost = items[0].creditsBundle10 * costOfCreditsBundle10;
  return totalCost;
};

app.post("/create-payment-intent", async (req, res) => {
  const { items } = req.body;
  // Create a PaymentIntent with the order amount and currency
  const paymentIntent = await stripe.paymentIntents.create({
    amount: calculateOrderAmount(items),
    currency: "gbp",
  });

  res.send({
    clientSecret: paymentIntent.client_secret,
  });
});

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));
