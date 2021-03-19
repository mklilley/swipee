// References: https://stripe.com/docs/payments/integration-builder

/* eslint-disable  no-prototype-builtins */

const express = require("express");
var cors = require("cors");
const app = express();

const stripe = require("stripe")(process.env.STRIPE_API_KEY_TEST);

const db = require("./jsonbox.js");

const PORT = process.env.PORT || 9000;

const PRICES = JSON.parse(process.env.PRICES);
const CREDITS = JSON.parse(process.env.CREDITS);

app.use(cors());
app.use(express.static("."));

function calculateOrderAmount(items) {
  let totalCost = 0;
  for (const item of items) {
    totalCost += item.quantity * PRICES[item.code];
  }
  return totalCost;
}

function calculateCredits(items) {
  let totalCredits = 0;
  for (const item of items) {
    totalCredits += item.quantity * CREDITS[item.code];
  }
  return totalCredits;
}

function authValidator(auth) {
  let isValidated = false;

  if (typeof auth === "object") {
    if (auth.hasOwnProperty("apiKey") && auth.hasOwnProperty("boxID")) {
      if (typeof auth.boxID === "string" && typeof auth.apiKey === "string") {
        // Check that the user has entered a valid boxID, i.e.
        // 20 character HEX string
        let isHex20 = auth.boxID.match("^[0-9a-f]{20}$");
        // Check that the user has entered a valid  valid apiKey i.e a UUID
        let isUUID = auth.apiKey.match(
          "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
        );
        isValidated = !(isHex20 === null || isUUID === null);
      }
    }
  }

  return isValidated;
}

function itemsValidator(items) {
  let isValidated = false;
  if (typeof items === "object" && items instanceof Array) {
    isValidated = items.every((obj) => {
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
    isValidated = false;
  }
  return isValidated;
}

async function getUserData(auth) {
  let user = await db.read(null, { boxID: auth.boxID });
  if (Object.keys(user).length === 1) {
    user = Object.values(user)[0];
    if (user.auth.apiKey === auth.apiKey) {
      return user;
    } else {
      // User supplied a valid boxID but not valid apiKey
      return false;
    }
  } else {
    // If there is no user corresponding to the auth data and if not then create them.
    return await db.create({ auth: auth, credits: 10 });
  }
}

app.post("/create-payment-intent", async (req, res) => {
  const { items, auth } = req.body;

  // input validation
  let itemsValidated = itemsValidator(items);
  let authValidated = authValidator(auth);

  if (!itemsValidated) {
    // error in some input data, return error
    res.status(400).json({
      type: "error",
      message: "Badly formatted payment data",
    });
  } else if (!authValidated) {
    // error in some auth data, return error
    res.status(400).json({
      type: "error",
      message: "Badly formatted authorisation data",
    });
  } else {
    // Check that there is a user corresponding to the auth data and if not then create them.
    const user = await getUserData(auth);
    if (!user) {
      // This happens if a user exist but they've not supplied the correct apiKey
      res.status(401).json({
        type: "error",
        message: "Unauthorised request",
      });
    } else {
      //Create a PaymentIntent with the order amount and currency
      const paymentIntent = await stripe.paymentIntents.create({
        amount: calculateOrderAmount(items),
        currency: "gbp",
        metadata: { data: JSON.stringify(req.body) },
      });

      res.send({
        clientSecret: paymentIntent.client_secret,
      });
    }
  }
});

app.get("/prices", async (req, res) => {
  res.send(PRICES);
});

app.post("/credits", async (req, res) => {
  const { credits, auth } = req.body;

  // validation
  let creditsValidated = false;
  creditsValidated =
    typeof credits === "number" && credits % 1 === 0 && credits > 0;

  let authValidated = authValidator(auth);

  if (!creditsValidated) {
    // error in some input data, return error
    res.status(400).json({
      type: "error",
      message: "Badly formatted credits data",
    });
  } else if (!authValidated) {
    // error in some auth data, return error
    res.status(400).json({
      type: "error",
      message: "Badly formatted authorisation data",
    });
  } else {
    const user = await getUserData(auth);
    if (!user) {
      // This happens if a user exist but they've not supplied the correct apiKey
      res.status(401).json({
        type: "error",
        message: "Unauthorised request",
      });
    } else {
      if (credits < user.credits) {
        // Client has used some credits already. Therefore should update server record of their credits
        await db.update(user.id, {
          auth: auth,
          credits: credits,
        });
        res.send({ credits: credits });
      } else {
        // Either no credits have been used or user credits are more than recorded on the server which cannot legitimately happen.
        // In these cases we return the server credits value.
        res.send({ credits: user.credits });
      }
    }
  }
});

app.post(
  "/" + process.env.STRIPE_WEBHOOK,
  express.raw({ type: "application/json" }),
  async (req, res) => {
    const payload = req.body;

    const sig = req.headers["stripe-signature"];

    let event;

    try {
      event = stripe.webhooks.constructEvent(payload, sig, stripeWebhookSecret);
    } catch (err) {
      console.log(err);
      return res.status(400).send(`Webhook Error: ${err.message}`);
    }

  // TODO: Validate that stripe sent the message

  if (event.type === "payment_intent.succeeded") {
    const metadata = JSON.parse(event.data.object.metadata.data);
    const user = await getUserData(metadata.auth);

    const totalCredits = calculateCredits(metadata.items) + user.credits;

    await db.update(user.id, { auth: metadata.auth, credits: totalCredits });
  }
    return res.json({ received: true });
  }
);

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));
