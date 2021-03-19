<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>Reset App</h2>
      Resetting the app will delete all local data and give you new online
      storage credentials. Your online data will persist, but you will lose
      access to it unless you have taken note of your storage ID and key.
      <br /><br />
      <button v-on:click="resetApp()">Yes, reset app</button> <br /><br />
      <button v-on:click="$emit('close')">No, take me back</button>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";

export default {
  name: "ResetApp",
  emits: ["close"],
  components: {
    Modal,
  },
  data() {
    return {};
  },
  methods: {
    resetApp() {
      localStorage.clear();
      location.reload();
    },
  },
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

button {
  background-color: rgb(115, 52, 94);
  border-color: rgb(115, 52, 94);
}
</style>
