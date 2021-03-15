<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h3>Buy 10 credits for GBP £{{ price }}</h3>
      <!-- Display a payment form -->
      <form @submit="payWithCard($event)">
        <input
          v-model="email"
          type="text"
          id="email"
          placeholder="Email for receipt (optional)"
        />
        <div id="card-element">⏳<!--Stripe.js injects the Card Element--></div>
        <button :disabled="canPayNow == false">
          Pay now
        </button>
        <p id="card-error" role="alert" class="error">{{ cardError }}</p>
      </form>
      <div class="Footer-PoweredBy">
        <a
          class="Link Link--primary"
          href="https://stripe.com"
          target="_blank"
          rel="noopener"
          ><span
            class="Text Text-color--gray400 Text-fontSize--12 Text-fontWeight--400"
            >Powered by
            <svg
              class="InlineSVG Icon Footer-PoweredBy-Icon Icon--md"
              focusable="false"
              width="33"
              height="15"
            >
              <g fill-rule="evenodd">
                <path
                  d="M32.956 7.925c0-2.313-1.12-4.138-3.261-4.138-2.15 0-3.451 1.825-3.451 4.12 0 2.719 1.535 4.092 3.74 4.092 1.075 0 1.888-.244 2.502-.587V9.605c-.614.307-1.319.497-2.213.497-.876 0-1.653-.307-1.753-1.373h4.418c0-.118.018-.588.018-.804zm-4.463-.859c0-1.02.624-1.445 1.193-1.445.55 0 1.138.424 1.138 1.445h-2.33zM22.756 3.787c-.885 0-1.454.415-1.77.704l-.118-.56H18.88v10.535l2.259-.48.009-2.556c.325.235.804.57 1.6.57 1.616 0 3.089-1.302 3.089-4.166-.01-2.62-1.5-4.047-3.08-4.047zm-.542 6.225c-.533 0-.85-.19-1.066-.425l-.009-3.352c.235-.262.56-.443 1.075-.443.822 0 1.391.922 1.391 2.105 0 1.211-.56 2.115-1.39 2.115zM18.04 2.766V.932l-2.268.479v1.843zM15.772 3.94h2.268v7.905h-2.268zM13.342 4.609l-.144-.669h-1.952v7.906h2.259V6.488c.533-.696 1.436-.57 1.716-.47V3.94c-.289-.108-1.346-.307-1.879.669zM8.825 1.98l-2.205.47-.009 7.236c0 1.337 1.003 2.322 2.34 2.322.741 0 1.283-.135 1.581-.298V9.876c-.289.117-1.716.533-1.716-.804V5.865h1.716V3.94H8.816l.009-1.96zM2.718 6.235c0-.352.289-.488.767-.488.687 0 1.554.208 2.241.578V4.202a5.958 5.958 0 0 0-2.24-.415c-1.835 0-3.054.957-3.054 2.557 0 2.493 3.433 2.096 3.433 3.17 0 .416-.361.552-.867.552-.75 0-1.708-.307-2.467-.723v2.15c.84.362 1.69.515 2.467.515 1.879 0 3.17-.93 3.17-2.548-.008-2.692-3.45-2.213-3.45-3.225z"
                ></path>
              </g></svg></span
        ></a>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";
import { loadStripe } from "@stripe/stripe-js/pure";

import { db } from "@/services/storage";

// import checkCredits from "@/services/credits";

export default {
  name: "Payment",
  emits: ["close", "paymentSuccess"],
  components: {
    Modal,
  },
  data() {
    return {
      stripe: {},
      purchase: {
        items: [{ code: "creditsBundle10", quantity: 1 }],
        auth: {
          boxID: "",
          apiKey: "",
        },
      },
      paymentIntent: {},
      card: {},
      canPayNow: false,
      cardError: "",
      price: "...",
      email: "",
    };
  },
  methods: {
    async payWithCard(event) {
      event.preventDefault();
      event.submitter.classList.toggle("wait");
      const result = await this.stripe.confirmCardPayment(
        this.paymentIntent.clientSecret,
        {
          receipt_email: this.email,
          payment_method: {
            card: this.card,
          },
        }
      );
      event.submitter.classList.toggle("wait");
      if (result.error) {
        // Show error to your customer
        console.log(result.error.message);
        this.cardError = result.error.message;
      } else {
        // The payment succeeded!
        this.$emit("paymentSuccess");
        event.submitter.classList.add("success");
        let successTimer = setTimeout(() => {
          event.submitter.classList.remove("success");
          clearTimeout(successTimer);
          this.$emit("close");
        }, 1000);
        this.card.destroy();
      }
    },
  },
  async mounted() {
    this.purchase.auth.boxID = await db.id();
    this.purchase.auth.apiKey = await db.apiKey();

    this.price = await fetch("https://dev.lilley.io/payments/prices")
      .then(async (result) => {
        const json = await result.json();
        if (result.status == 200) {
          return (json.creditsBundle10 / 100).toFixed(2);
        } else throw Error(json.message);
      })
      .catch((error) => {
        console.log(error);
        this.cardError += error;
      });

    this.stripe = await loadStripe(
      "pk_test_51IMXW3AQfv8gg5JbltVApZu0UrsGNTl1UzzWTV80QRclffQdb9V7HUNasEblD1yNmrTsFP0QrJ1ehFFAwldVq7uP00XKzGPort"
    );

    this.paymentIntent = await fetch(
      "http://localhost:9000/create-payment-intent",
      {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(this.purchase),
      }
    )
      .then(async (result) => {
        const json = await result.json();
        if (result.status == 200) {
          return json;
        } else throw Error(json.message);
      })
      .catch((error) => {
        console.log(error);
        this.cardError += error;
      });

    if (this.paymentIntent) {
      var elements = this.stripe.elements();

      var style = {
        base: {
          color: "#32325d",
          fontFamily: "Arial, sans-serif",
          fontSmoothing: "antialiased",
          fontSize: "16px",
          "::placeholder": {
            color: "#32325d",
          },
        },
        invalid: {
          fontFamily: "Arial, sans-serif",
          color: "#fa755a",
          iconColor: "#fa755a",
        },
      };

      this.card = elements.create("card", { style: style });
      // Stripe injects an iframe into the DOM
      this.card.mount("#card-element");

      this.card.on("change", (event) => {
        this.canPayNow = !event.empty;
        this.cardError = event.error ? event.error.message : "";
      });
    } else {
      alert(
        "Unable to take payments for credit bundles. See error messages for more detail."
      );
    }
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input {
  width: 50%;
}
.error {
  margin-top: 10px;
  display: block;
  color: #e44e42;
  font-weight: 600;
}

/* Variables */
* {
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, sans-serif;
  font-size: 16px;
  -webkit-font-smoothing: antialiased;
  display: flex;
  justify-content: center;
  align-content: center;
  height: 100vh;
  width: 100vw;
}

form {
  /* width: 30vw;
  min-width: 500px; */
  align-self: center;
  box-shadow: 0px 0px 0px 0.5px rgba(50, 50, 93, 0.1),
    0px 2px 5px 0px rgba(50, 50, 93, 0.1), 0px 1px 1.5px 0px rgba(0, 0, 0, 0.07);
  border-radius: 7px;
  /* padding: 40px; */
}

input {
  border-radius: 6px;
  margin-bottom: 6px;
  padding: 12px;
  border: 1px solid rgba(50, 50, 93, 0.1);
  height: 44px;
  font-size: 16px;
  width: 100%;
  background: white;
}

.result-message {
  line-height: 22px;
  font-size: 16px;
}

.result-message a {
  color: rgb(89, 111, 214);
  font-weight: 600;
  text-decoration: none;
}

.hidden {
  display: none;
}

#card-error {
  color: #e44e42;
  text-align: left;
  font-size: 13px;
  line-height: 17px;
  margin-top: 12px;
}

#card-element {
  border-radius: 4px 4px 0 0;
  padding: 12px;
  border: 1px solid rgba(50, 50, 93, 0.1);
  height: 44px;
  width: 100%;
  background: white;
}

#payment-request-button {
  margin-bottom: 32px;
}

/* Buttons and links */
button {
  background: #5469d4;
  color: #ffffff;
  font-family: Arial, sans-serif;
  border-radius: 0 0 4px 4px;
  border: 0;
  padding: 12px 16px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  display: block;
  transition: all 0.2s ease;
  box-shadow: 0px 4px 5.5px 0px rgba(0, 0, 0, 0.07);
  width: 100%;
}
button:hover {
  filter: contrast(115%);
}
button:disabled {
  opacity: 0.5;
  cursor: default;
}

/* spinner/processing state, errors */
.spinner,
.spinner:before,
.spinner:after {
  border-radius: 50%;
}
.spinner {
  color: #ffffff;
  font-size: 22px;
  text-indent: -99999px;
  margin: 0px auto;
  position: relative;
  width: 20px;
  height: 20px;
  box-shadow: inset 0 0 0 2px;
  -webkit-transform: translateZ(0);
  -ms-transform: translateZ(0);
  transform: translateZ(0);
}
.spinner:before,
.spinner:after {
  position: absolute;
  content: "";
}
.spinner:before {
  width: 10.4px;
  height: 20.4px;
  background: #5469d4;
  border-radius: 20.4px 0 0 20.4px;
  top: -0.2px;
  left: -0.2px;
  -webkit-transform-origin: 10.4px 10.2px;
  transform-origin: 10.4px 10.2px;
  -webkit-animation: loading 2s infinite ease 1.5s;
  animation: loading 2s infinite ease 1.5s;
}
.spinner:after {
  width: 10.4px;
  height: 10.2px;
  background: #5469d4;
  border-radius: 0 10.2px 10.2px 0;
  top: -0.1px;
  left: 10.2px;
  -webkit-transform-origin: 0px 10.2px;
  transform-origin: 0px 10.2px;
  -webkit-animation: loading 2s infinite ease;
  animation: loading 2s infinite ease;
}

@-webkit-keyframes loading {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}
@keyframes loading {
  0% {
    -webkit-transform: rotate(0deg);
    transform: rotate(0deg);
  }
  100% {
    -webkit-transform: rotate(360deg);
    transform: rotate(360deg);
  }
}

/* @media only screen and (max-width: 600px) {
  form {
    width: 80vw;
  }
} */

.Text-color--gray400 {
  color: rgba(26, 26, 26, 0.5);
}

.Text-fontWeight--400 {
  font-weight: 400;
}

.Text-fontSize--12 {
  font-size: 12px;
}

.Text {
  margin: 0;
}

.Link {
  text-decoration: none;
  cursor: pointer;
}

a {
  background-color: transparent;
}

.Footer-Links,
.Footer-PoweredBy {
  padding: 4px;
}

.Footer-PoweredBy {
  width: 100%;
  text-align: center;
}

.Footer-PoweredBy-Icon {
  vertical-align: text-bottom;
  -webkit-transform: translateY(1.5px);
  -ms-transform: translateY(1.5px);
  transform: translateY(1.5px);
  fill: rgba(26, 26, 26, 0.4);
}
</style>
