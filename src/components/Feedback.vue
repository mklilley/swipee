<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>Feedback</h2>
      <!-- modify this form HTML and place wherever you want your form -->

      <form v-on:submit.prevent="sendFeedback($event)">
        <input
          maxlength="10000"
          required
          v-model="feedbackEmail"
          type="email"
          name="email"
          placeholder="Your email"
        /><br /><br />
        <textarea
          maxlength="10000"
          required
          v-model="feedbackMessage"
          name="message"
          placeholder="Your message"
        ></textarea>
        <br /><br />

        <vue-recaptcha
          ref="recaptcha"
          sitekey="6Le8ZmkaAAAAAOOlH9QJx2yvTZoqcOK9FOVzQXbu"
          :loadRecaptchaScript="true"
          @verify="recaptchaOK = true"
        ></vue-recaptcha>
        <span class="error" v-show="error"
          >Problem sending your feedback. Please check your internet connection
          and try again.</span
        >

        <br />
        <button v-if="recaptchaOK" type="submit">Send</button>
      </form>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";
import VueRecaptcha from "vue-recaptcha";

export default {
  name: "Feedback",
  emits: ["close"],
  components: {
    Modal,
    VueRecaptcha,
  },
  data() {
    return {
      error: false,
      recaptchaOK: false,
      feedbackEmail: "",
      feedbackMessage: "",
    };
  },
  methods: {
    async sendFeedback(event) {
      this.error = false;
      let inputs = event.target.elements;
      let jsonForm = {};

      jsonForm.email = this.feedbackEmail;
      jsonForm.message = this.feedbackMessage;

      // Iterate over the form elements
      for (let input of inputs) {
        if (input.name === "g-recaptcha-response") {
          // Update text input
          jsonForm["g-recaptcha-response"] = input.value;
        }
      }

      let options = {
        body: JSON.stringify(jsonForm),
        headers: { "Content-Type": "application/json" },
        method: "POST",
      };

      event.submitter.classList.toggle("wait");

      const response = await fetch(
        "https://formspree.io/f/xqkgvedw",
        options
      ).catch((err) => {
        this.error = true;
        console.log(err);
        this.$refs.recaptcha.reset();
        this.recaptchaOK = false;
        event.submitter.classList.toggle("wait");
      });

      this.$refs.recaptcha.reset();
      this.recaptchaOK = false;
      event.submitter.classList.toggle("wait");

      if ((response || {}).ok) {
        this.$emit("close");
      } else {
        this.error = true;
      }

      return;

      //
    },
  },
  mounted() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input {
  width: 80%;
}
.error {
  margin-top: 10px;
  display: block;
  color: #e44e42;
  font-weight: 600;
}

textarea {
  border-radius: 5px;
  border: 2px solid #eaeaea;
  padding: 10px;
  outline: none;
  width: 80%;
  font-family: "Montserrat", sans-serif;
  height: 200px;
}

button {
  background-color: rgb(115, 52, 94);
  border-color: rgb(115, 52, 94);
}
</style>
