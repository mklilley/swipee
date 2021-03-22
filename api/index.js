// References: https://stripe.com/docs/payments/integration-builder

/* eslint-disable  no-prototype-builtins */

const express = require("express");
var cors = require("cors");
const app = express();

// const stripe = require("stripe")(process.env.STRIPE_API_KEY_TEST);
const stripe = require("stripe")(process.env.STRIPE_API_KEY);

// const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET_TEST;
const stripeWebhookSecret = process.env.STRIPE_WEBHOOK_SECRET;

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

function authValidator(boxID, apiKey) {
  let isValidated = false;

  if (boxID && apiKey) {
    if (typeof boxID === "string" && typeof apiKey === "string") {
      // Check that the user has entered a valid boxID, i.e.
      // 20 character HEX string
      let isHex20 = boxID.match("^[0-9a-f]{20}$");
      // Check that the user has entered a valid  valid apiKey i.e a UUID
      let isUUID = apiKey.match(
        "^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$"
      );
      isValidated = !(isHex20 === null || isUUID === null);
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

async function getUserData(boxID, apiKey) {
  let user = await db.read(null, { boxID: boxID });
  if (Object.keys(user).length === 1) {
    user = Object.values(user)[0];
    if (user.apiKey === apiKey) {
      user = await resetPriceAndSeed(user);
      return user;
    } else {
      // User supplied a valid boxID but not valid apiKey
      return false;
    }
  } else {
    // If there is no user corresponding to the auth data and if not then create them.
    return await db.create({
      boxID: boxID,
      apiKey: apiKey,
      credits: 10,
      skipPrice: 1,
      lastReset: new Date(),
      seed: 1,
      receipts: [],
    });
  }
}

async function resetPriceAndSeed(user) {
  const msInDay = 1000 * 60 * 60 * 24;
  const msSinceLastReset = new Date() - Date.parse(user.lastReset);
  if (msSinceLastReset > msInDay) {
    const newReset = new Date();

    user.lastReset = newReset;
    user.seed = user.seed + 1;
    user.skipPrice = 1;

    await db.update(user.id, {
      boxID: user.boxID,
      apiKey: user.apiKey,
      credits: user.credits,
      skipPrice: 1,
      lastReset: newReset,
      seed: user.seed + 1,
      receipts: user.receipts,
    });
  }

  return user;
}

app.post("/create-payment-intent", express.json(), async (req, res) => {
  const { items, boxID, apiKey } = req.body;

  // input validation
  let itemsValidated = itemsValidator(items);
  let authValidated = authValidator(boxID, apiKey);

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
    const user = await getUserData(boxID, apiKey);
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

app.get("/prices", express.json(), async (req, res) => {
  res.send(PRICES);
});

app.post("/data", express.json(), async (req, res) => {
  const { boxID, apiKey } = req.body;

  let authValidated = authValidator(boxID, apiKey);

  if (!authValidated) {
    // error in some auth data, return error
    res.status(400).json({
      type: "error",
      message: "Badly formatted authorisation data",
    });
  } else {
    const user = await getUserData(boxID, apiKey);
    if (!user) {
      // This happens if a user exist but they've not supplied the correct apiKey
      res.status(401).json({
        type: "error",
        message: "Unauthorised request",
      });
    } else {
      res.send({
        credits: user.credits,
        skipPrice: user.skipPrice,
        seed: user.seed,
      });
    }
  }
});

app.post("/skip", express.json(), async (req, res) => {
  const { boxID, apiKey } = req.body;

  const authValidated = authValidator(boxID, apiKey);

  if (!authValidated) {
    // error in some auth data, return error
    res.status(400).json({
      type: "error",
      message: "Badly formatted authorisation data",
    });
  } else {
    const user = await getUserData(boxID, apiKey);
    if (!user) {
      // This happens if a user exist but they've not supplied the correct apiKey
      return res.status(401).json({
        type: "error",
        message: "Unauthorised request",
      });
    } else {
      let credits;
      let skipPrice;
      if (user.credits >= user.skipPrice) {
        credits = user.credits - user.skipPrice;
        skipPrice = user.skipPrice * 2;
        await db.update(user.id, {
          boxID: user.boxID,
          apiKey: user.apiKey,
          credits: credits,
          skipPrice: skipPrice,
          lastReset: user.lastReset,
          seed: user.seed,
          receipts: user.receipts,
        });
        return res.send({ credits: credits, skipPrice: skipPrice });
      } else {
        return res.status(403).json({
          type: "error",
          message: "Not enough credits to skip",
        });
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
      const user = await getUserData(metadata.boxID, metadata.apiKey);

      const totalCredits = calculateCredits(metadata.items) + user.credits;

      await db.update(user.id, {
        boxID: metadata.boxID,
        apiKey: metadata.apiKey,
        credits: totalCredits,
        skipPrice: user.skipPrice,
        lastReset: user.lastReset,
        seed: user.seed,
        receipts: user.receipts,
      });
    }

    if (event.type === "charge.succeeded") {
      const metadata = JSON.parse(event.data.object.metadata.data);
      const receipt_url = event.data.object.receipt_url;
      const user = await getUserData(metadata.boxID, metadata.apiKey);
      user.receipts.push(receipt_url);

      await db.update(user.id, {
        boxID: metadata.boxID,
        apiKey: metadata.apiKey,
        credits: user.credits,
        skipPrice: user.skipPrice,
        lastReset: user.lastReset,
        seed: user.seed,
        receipts: user.receipts,
      });
    }

    return res.json({ received: true });
  }
);

app.listen(PORT, () => console.log(`Node server listening on port ${PORT}!`));
