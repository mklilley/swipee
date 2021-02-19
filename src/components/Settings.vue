<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>Settings</h2>
      <button v-on:click="$emit('restoreData')">
        Restore data from online storage
      </button>
      <br /><br />
      Credits: {{ credits }}

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
  name: "Settings",
  emits: ["close", "restoreData"],
  components: {
    Modal,
    Payment,
  },
  data() {
    return {
      credits: parseInt(localStorage.credits),
      paymentModalVisible: false,
    };
  },
  methods: {
    updateCredits() {
      this.credits = parseInt(localStorage.credits);
    },
  },
  async mounted() {},
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
