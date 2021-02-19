<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <!-- Display a payment form -->
      <form @submit="payWithCard($event)">
        <div id="card-element">⏳<!--Stripe.js injects the Card Element--></div>
        <button :disabled="canPayNow == false">
          Pay now
        </button>
        <p id="card-error" role="alert" class="error">{{ cardError }}</p>
      </form>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";
import { loadStripe } from "@stripe/stripe-js/pure";

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
        items: [{ creditsBundle10: 1 }],
      },
      paymentIntent: {},
      card: {},
      canPayNow: false,
      cardError: "",
    };
  },
  methods: {
    async payWithCard(event) {
      event.preventDefault();
      event.submitter.classList.toggle("wait");
      const result = await this.stripe.confirmCardPayment(
        this.paymentIntent.clientSecret,
        {
          payment_method: {
            card: this.card,
          },
        }
      );
      event.submitter.classList.toggle("wait");
      if (result.error) {
        // Show error to your customer
        console.log(result.error.message);
      } else {
        // The payment succeeded!
        console.log(result.paymentIntent.id);
        localStorage.credits = parseInt(localStorage.credits) + 10;
        this.$emit("paymentSuccess");
        event.submitter.classList.toggle("success");
        let successTimer = setTimeout(() => {
          event.submitter.classList.toggle("success");
          clearTimeout(successTimer);
          this.$emit("close");
        }, 1000);
        this.card.destroy();
      }
    },
  },
  async mounted() {
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
    ).then(function(result) {
      return result.json();
    });

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

button.wait::after {
  content: " ⏳";
}

button.success::after {
  content: " 👍";
}
</style>
