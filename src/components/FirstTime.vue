<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>First time: {{ action }}</h2>
      You just did you first "{{ action }}" <br /><br />

      <strong
        >It cost you {{ skipPrice / 2 }} credit{{ skipPrice >= 2 ? "s" : "" }}
      </strong>
      <br /><br />

      <div class="left">
        Just in case you missed this on the tutorial card, I wanted to quickly
        explain a few things:
      </div>
      <br />

      <div class="left"><strong>1.</strong> {{ action }} costs credits</div>
      <div class="left">
        <strong>2.</strong> The price doubles each time you {{ action }}
      </div>
      <div class="left">
        <strong>3.</strong> The price resets every 24 hours when the deck is
        reshuffled.
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";

export default {
  name: "Migrate",
  emits: ["close"],
  props: ["action", "skipPrice"],
  components: {
    Modal,
  },
  data() {
    return {};
  },
  methods: {},
  mounted() {},
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

.left {
  text-align: left;
}
</style>
