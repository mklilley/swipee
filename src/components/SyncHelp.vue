<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>Restore/sync data</h2>

      <div v-if="useRemoteStorage">
        Enter a storage box ID and key below. This will: <br />
        <br />
        <div class="left">
          <strong>1.</strong> Remove all reading list data from this device and
          replace it with data from the online storage box provided.
        </div>
        <br />
        <div class="left">
          <strong>2.</strong> Keep this device in sync with any other device
          using the same online storage box.
        </div>
        <br />

        <input
          v-on:keypress.enter="switchBox()"
          v-model.trim="switchBoxID"
          type="text"
          placeholder="Box ID"
        /><br /><br />
        <input
          v-on:keypress.enter="switchBox()"
          v-model.trim="switchApiKey"
          type="text"
          placeholder="Key"
        /><br /><br />
        <button v-on:click="switchBox()">Restore and Sync</button>
        <span class="error" v-show="error">{{ switchBoxError }}</span>
      </div>
      <div v-else>
        You need to enable online storage to sync data with another device.
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";

import { db } from "@/services/storage";

export default {
  name: "SyncHelp",
  emits: ["close", "switchedBox"],
  components: {
    Modal,
  },
  props: ["message"],
  data() {
    return {
      useRemoteStorage: JSON.parse(localStorage.useRemoteStorage),
      switchBoxError: "",
      switchApiKey: "",
      switchBoxID: "",
      error: false,
    };
  },
  methods: {
    async switchBox() {
      this.error = false;
      // lowercase the data before trying to switch
      this.switchBoxID = this.switchBoxID.toLowerCase();
      this.switchApiKey = this.switchApiKey.toLowerCase();

      let switchedOK = await db
        .switch(this.switchBoxID, this.switchApiKey)
        .catch((error) => {
          this.switchBoxError = error;
          this.error = true;
        });
      if (switchedOK) {
        this.switchBoxID = "";
        this.switchApiKey = "";
        this.$emit("switchedBox");
        this.$emit("close");
      }
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

.left {
  text-align: left;
}
</style>
