<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>Warning</h2>
      Local storage is out of sync with online storage. {{ message }}
      <br /><br />
      <button
        v-on:click="
          $emit('reloadCards', { remote: true });
          $emit('close');
        "
      >
        Restore data from online storage
      </button>

      <br /><br />
      <button v-on:click="ignoreSyncWarnings()">
        Ignore future sync warnings
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";

export default {
  name: "SyncWarning",
  emits: ["close", "reloadCards"],
  components: {
    Modal,
  },
  props: ["message"],
  data() {
    return {};
  },
  methods: {
    ignoreSyncWarnings() {
      localStorage.showSyncWarnings = false;
      this.$emit("close");
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
</style>
