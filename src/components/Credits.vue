<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>{{ creditsTitle }}</h2>
      Your credits: {{ credits }} <br />
      <br />
      Price: {{ skipPrice }} <br /><br />

      <button v-on:click="paymentModalVisible = true">
        Buy more credits
      </button>
    </template>
  </Modal>

  <Payment
    v-if="paymentModalVisible"
    @close="paymentModalVisible = false"
    @paymentSuccess="updateCredits"
  ></Payment>
</template>

<script>
import Modal from "@/components/Modal.vue";
import Payment from "@/components/Payment.vue";

export default {
  name: "Credits",
  emits: ["close"],
  components: {
    Modal,
    Payment,
  },
  data() {
    return {
      credits: parseInt(localStorage.credits),
      skipPrice: parseInt(localStorage.skipPrice),
      paymentModalVisible: false,
      creditsTitle: "",
    };
  },
  methods: {
    updateCredits() {
      this.credits = parseInt(localStorage.credits);
      this.updateModalTitle();
    },
    updateModalTitle() {
      this.creditsTitle =
        this.credits < this.skipPrice ? "Not enough credits" : "Credits";
    },
  },
  async mounted() {
    this.updateModalTitle();
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
</style>
