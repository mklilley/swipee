# Swipee Api

Node server that

- Initiates Stripe payments for Swipee credits via `/create-payment-intent`
- Provides up to date price for Swipee credits `/prices`
- Provides user data containing number of credits, skipPrice and random seed at `/data`
- Updates user credits and skipPrice price when user skips card at `/skip`
- Confirms stripe payments via a secret wehbook `/{SECRET}`

## How I made Swipee Api

I use [express](https://github.com/expressjs/express) to create the server.

To limit api requests from the web to only swipee.lilley.io, I use the [express cors middleware](https://expressjs.com/en/resources/middleware/cors.html).

I am using an an open-source json storage system ([jsonbox](https://jsonbox.io/)) to store user data. I [slightly adapted it](https://github.com/mklilley/jsonbox/) and deployed it on my server using the [instructions](https://github.com/mklilley/jsonbox#how-to-run-locally) that jsonbox provides. This storage system is the same as that used on the front end. To avoid having to re-code the storage logic, I decided to use [node-fetch](https://github.com/node-fetch/node-fetch) to bring the `fetch` function to node.

To initiate stripe payments I followed their [Integration builder](https://stripe.com/docs/checkout/integration-builder) selecting the `Custom payment flow`. I adapted their `server.js` file to [include user meta data](https://stripe.com/docs/payments/payment-intents#storing-information-in-metadata) when creating the paymentIntent. This then allows me to connect payment webhook events to a specific user in order to update their credits.

To make the api respond to `payment_intent.succeeded` and `charge.succeeded` webhooks, I followed Stripe's [Fulfill your orders](https://stripe.com/docs/payments/checkout/fulfill-orders) docs, where I had to replace the deprecated `bodyParser.raw` middleware with `express.raw` middleware to make things work.
