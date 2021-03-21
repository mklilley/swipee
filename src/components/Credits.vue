<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>{{ creditsTitle }}</h2>
      Your credits: {{ credits }} <br />
      <br />
      Save for later / See all cards price: {{ skipPrice }} <br /><br />

      <button v-on:click="paymentModalVisible = true">
        Buy more credits
      </button>
    </template>
  </Modal>

  <Payment
    v-if="paymentModalVisible"
    @close="paymentModalVisible = false"
    @paymentSuccess="$emit('updateCredits')"
  ></Payment>
</template>

<script>
import Modal from "@/components/Modal.vue";
import Payment from "@/components/Payment.vue";

import checkCredits from "@/services/credits";

export default {
  name: "Credits",
  emits: ["close", "updateCredits"],
  props: ["skipPrice", "credits"],
  components: {
    Modal,
    Payment,
  },
  data() {
    return {
      paymentModalVisible: false,
    };
  },
  computed: {
    creditsTitle() {
      return this.credits < this.skipPrice ? "Not enough credits" : "Credits";
    },
  },
  methods: {},
  async mounted() {
    checkCredits(this.credits);
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
