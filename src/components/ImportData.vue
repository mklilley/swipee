<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h1>Import data from file</h1>

      <input type="file" @change="readFile" /><br /><br />
      <span class="error" v-show="error"
        >{{ addFromFileError }} <br />
        See
        <a href="https://github.com/mklilley/swipee" refl="noopener"
          >Swipee Github</a
        >
        for more help formatting your data.</span
      >
      <button v-show="fileOK" v-on:click="addDataFromFile(file, $event)">
        Add data
      </button>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";

import { db } from "@/services/storage";

export default {
  name: "ImportData",
  emits: ["close", "importSuccess"],
  props: { useRemoteStorage: Boolean },
  components: {
    Modal,
  },
  data() {
    return { fileOK: false, file: {}, addFromFileError: "", error: false };
  },
  methods: {
    readFile(event) {
      this.fileOK = false;
      this.error = false;

      let file = event.target.files[0];

      if (file) {
        let reader = new FileReader();

        reader.readAsText(file);

        reader.onload = () => {
          try {
            this.file = JSON.parse(reader.result);
            if (!Array.isArray(this.file)) {
              throw new Error("Data not in array format.");
            }
            this.fileOK = true;
          } catch (error) {
            this.error = true;
            this.fileOK = false;
            this.addFromFileError = "Error: Data not in correct format.";
          }
        };

        reader.onerror = () => {
          this.error = true;
          this.fileOK = false;
          this.addFromFileError = reader.error;
        };
      }
    },
    async addDataFromFile(cards, event) {
      let promCreate = [];
      for (let card of cards) {
        promCreate.push(db.create(card, { remote: this.useRemoteStorage }));
      }

      event.target.classList.toggle("wait");
      await Promise.all(promCreate);
      event.target.classList.toggle("wait");
      this.$emit("importSuccess");
      this.$emit("close");
    },
  },
  mounted() {},
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.error {
  margin-top: 10px;
  display: block;
  color: #e44e42;
  font-weight: 600;
}
</style>
