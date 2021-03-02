<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h1>Delete all data</h1>
      <span
        class="error"
        v-if="(boxStatus == false) & (useRemoteStorage == true)"
      >
        Problem with online storage. Only local data will be deleted.</span
      ><br />
      <button v-on:click="deleteAllData($event)">Yes, delete everything</button>
      <br /><br />
      <button v-on:click="$emit('close')">
        No, take me back
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";

import { db } from "@/services/storage";

export default {
  name: "DelteData",
  emits: ["close", "deleteAllSuccess"],
  components: {
    Modal,
  },
  props: ["boxStatus", "useRemoteStorage"],
  data() {
    return { cards: [] };
  },
  methods: {
    async deleteAllData(event) {
      // We will be deleting all cards at once. For this we will need to
      //  to create an array of promises and wait for them all to resolve
      let promDelete = [];
      for (let card of this.cards) {
        promDelete.push(db.delete(card.id, { remote: this.useRemoteStorage }));
      }

      event.target.classList.toggle("wait");

      await Promise.all(promDelete);

      event.target.classList.toggle("wait");
      this.$emit("deleteAllSuccess");
      this.$emit("close");
    },
  },
  async mounted() {
    this.cards = await db.read();
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
