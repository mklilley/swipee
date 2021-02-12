<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body> <h2>Settings</h2> </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";

export default {
  name: "Settings",
  emits: ["close"],
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
</style>
