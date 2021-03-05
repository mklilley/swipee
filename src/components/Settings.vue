<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>Settings</h2>
      <button v-on:click="$emit('reloadCards', { remote: true })">
        Restore data from online storage
      </button>
      <br /><br />

      <button v-on:click="creditsModalVisible = true">
        Your credits
      </button>

      <br /><br />

      <button v-on:click="feedbackModalVisible = true">
        Send feedback
      </button>

      <br /><br />

      <button v-on:click="welcomeModalVisible = true">
        Show welome screen again
      </button>

      <br /><br />

      <button v-on:click="deleteDataModalVisible = true">
        Delete all your data
      </button>

      <br /><br />

      <button v-on:click="importDataModalVisible = true">
        Import data from file
      </button>

      <br /><br />

      <button v-on:click="resetAppModalVisible = true">
        Reset App
      </button>

      <br /><br />

      <button v-on:click="downloadData">
        Download your data
      </button>

      <br /><br />

      <button v-on:click="$emit('toggleAllCards')">
        <span v-if="!allCardsVisible">Show all cards</span>
        <span v-else> Hide cards</span>
      </button>
    </template>
  </Modal>

  <Welcome
    v-if="welcomeModalVisible"
    @close="welcomeModalVisible = false"
  ></Welcome>

  <Feedback
    v-if="feedbackModalVisible"
    @close="feedbackModalVisible = false"
  ></Feedback>

  <DeleteData
    v-if="deleteDataModalVisible"
    @close="deleteDataModalVisible = false"
    @deleteAllSuccess="$emit('reloadCards')"
    :boxStatus="boxStatus"
    :useRemoteStorage="useRemoteStorage"
  ></DeleteData>

  <ImportData
    v-if="importDataModalVisible"
    @close="importDataModalVisible = false"
    @importSuccess="$emit('reloadCards')"
    :useRemoteStorage="useRemoteStorage"
  ></ImportData>

  <ResetApp
    v-if="resetAppModalVisible"
    @close="resetAppModalVisible = false"
  ></ResetApp>

  <Credits
    v-if="creditsModalVisible"
    @close="creditsModalVisible = false"
  ></Credits>
</template>

<script>
import Modal from "@/components/Modal.vue";
import Credits from "@/components/Credits.vue";
import Feedback from "@/components/Feedback.vue";
import Welcome from "@/components/Welcome.vue";
import DeleteData from "@/components/DeleteData.vue";
import ImportData from "@/components/ImportData.vue";
import ResetApp from "@/components/ResetApp.vue";

import { db } from "@/services/storage";

import pick from "lodash/pick";

export default {
  name: "Settings",
  emits: ["close", "reloadCards", "toggleAllCards"],
  components: {
    Modal,
    Credits,
    Feedback,
    Welcome,
    DeleteData,
    ImportData,
    ResetApp,
  },
  props: ["allCardsVisible"],
  data() {
    return {
      credits: parseInt(localStorage.credits),
      useRemoteStorage: JSON.parse(localStorage.useRemoteStorage),
      boxStatus: {},
      creditsModalVisible: false,
      feedbackModalVisible: false,
      welcomeModalVisible: false,
      deleteDataModalVisible: false,
      importDataModalVisible: false,
      resetAppModalVisible: false,
    };
  },
  methods: {
    async downloadData() {
      //  Adapted from https://ourcodeworld.com/articles/read/189/how-to-create-a-file-and-generate-a-download-with-javascript-in-the-browser-without-a-server
      const cards = await db.read();
      let data = cards.map(function(card) {
        return pick(card, [
          "action",
          "deck",
          "description",
          "domain",
          "image",
          "skipped",
          "time",
          "title",
          "url",
        ]);
      });

      var element = document.createElement("a");
      element.setAttribute(
        "href",
        "data:text/plain;charset=utf-8," +
          encodeURIComponent(JSON.stringify(data))
      );
      element.setAttribute("download", "swipee.json");

      element.style.display = "none";
      document.body.appendChild(element);

      element.click();

      document.body.removeChild(element);
    },
    updateCredits() {
      this.credits = parseInt(localStorage.credits);
    },
  },
  async mounted() {
    this.boxStatus = await db.status();
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
