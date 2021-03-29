<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <div class="settings">
        <h2>Settings</h2>

        <div class="your-data">
          <h3
            :class="{ open: yourDataVisible }"
            @click.prevent="yourDataVisible = !yourDataVisible"
          >
            Your data
          </h3>
          <div v-if="yourDataVisible" class="items">
            Number of cards: <strong>{{ numberOfCards }}</strong> <br /><br />

            <button
              :disabled="numberOfCards <= 1"
              v-if="!allCardsVisible"
              v-on:click="toggleAllCards($event)"
            >
              Show all cards <br />
              PRICE: {{ skipPrice }}
            </button>
            <button v-else v-on:click="toggleAllCards($event)">
              Hide cards
            </button>

            <br /><br />
            <button v-on:click="downloadData">
              Download your data
            </button>

            <br /><br />

            <button v-on:click="deleteDataModalVisible = true">
              Delete all your data
            </button>

            <br /><br />

            <button v-on:click="importDataModalVisible = true">
              Import data from file
            </button>
          </div>
        </div>
        <br />

        <div class="online-storage">
          <h3
            :class="{ open: onlineStorageVisible }"
            @click.prevent="onlineStorageVisible = !onlineStorageVisible"
          >
            Online storage
          </h3>
          <div v-if="onlineStorageVisible" class="items">
            <!-- <button v-on:click="$emit('reloadCards', { remote: true })">
              Restore data from online storage
            </button> -->

            <span class="error" v-if="boxStatus == false">
              Problem with online storage</span
            ><br />

            <div>
              <label class="container">
                Toggle online storage
                <input
                  :disabled="boxStatus == false"
                  type="checkbox"
                  v-model="useRemoteStorage"
                  @change="toggleRemoteStorage($event)"
                />
                <span class="checkmark"></span>
              </label>
              <br />
            </div>

            <!-- <div v-if="useRemoteStorage">
              <label class="container">
                Toggle sync warnings
                <input
                  :disabled="boxStatus == false"
                  type="checkbox"
                  v-model="showSyncWarnings"
                  @change="toggleSyncWarnings()"
                />
                <span class="checkmark"></span>
              </label>
              <br />
            </div> -->

            <div v-if="useRemoteStorage">
              My storage box ID:<br />
              <strong>{{ boxID }}</strong>
              <button @click.prevent="copyToClipboard(boxID, $event)">
                copy</button
              ><br /><br />
              My storage box key:<br />
              <strong>{{ apiKey }}</strong>
              <button @click.prevent="copyToClipboard(apiKey, $event)">
                copy</button
              ><br /><br />
            </div>
          </div>
          <br />
        </div>

        <div class="purchases">
          <h3
            :class="{ open: purchasesVisible }"
            @click.prevent="purchasesVisible = !purchasesVisible"
          >
            Purchases
          </h3>
          <div v-if="purchasesVisible" class="items">
            <button v-on:click="creditsModalVisible = true">
              Your credits
            </button>
          </div>
        </div>

        <br />

        <div class="help">
          <h3
            :class="{ open: helpVisible }"
            @click.prevent="helpVisible = !helpVisible"
          >
            Help
          </h3>
          <div v-if="helpVisible" class="items">
            <button v-on:click="feedbackModalVisible = true">
              Send feedback
            </button>

            <br /><br />

            <button v-on:click="syncHelpModalVisible = true">
              Sync data across multiple devices
            </button>

            <br /><br />

            <button v-on:click="migrateModalVisible = true">
              Migrating links from Pocket
            </button>

            <br /><br />

            <button v-on:click="welcomeModalVisible = true">
              Show welcome screen again
            </button>

            <br /><br />

            <button v-on:click="resetAppModalVisible = true">
              Reset App
            </button>
          </div>
        </div>
      </div>
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
    :skipPrice="skipPrice"
    :credits="credits"
    @updateCredits="$emit('updateCredits')"
  ></Credits>

  <SyncHelp
    v-if="syncHelpModalVisible"
    @close="syncHelpModalVisible = false"
    @switchedBox="reloadStorageDetails"
  ></SyncHelp>

  <Migrate
    v-if="migrateModalVisible"
    @close="migrateModalVisible = false"
  ></Migrate>
</template>

<script>
import Modal from "@/components/Modal.vue";
import Credits from "@/components/Credits.vue";
import Feedback from "@/components/Feedback.vue";
import Welcome from "@/components/Welcome.vue";
import DeleteData from "@/components/DeleteData.vue";
import ImportData from "@/components/ImportData.vue";
import ResetApp from "@/components/ResetApp.vue";
import SyncHelp from "@/components/SyncHelp.vue";
import Migrate from "@/components/Migrate.vue";

import { db } from "@/services/storage";

import pick from "lodash/pick";

export default {
  name: "Settings",
  emits: ["close", "reloadCards", "hideCards", "showCards", "updateCredits"],
  components: {
    Modal,
    Credits,
    Feedback,
    Welcome,
    DeleteData,
    ImportData,
    ResetApp,
    SyncHelp,
    Migrate,
  },
  props: ["allCardsVisible", "skipPrice", "numberOfCards", "credits"],
  data() {
    return {
      useRemoteStorage: JSON.parse(localStorage.useRemoteStorage),
      boxStatus: {},
      creditsModalVisible: false,
      feedbackModalVisible: false,
      welcomeModalVisible: false,
      deleteDataModalVisible: false,
      importDataModalVisible: false,
      resetAppModalVisible: false,
      yourDataVisible: false,
      onlineStorageVisible: false,
      helpVisible: false,
      purchasesVisible: false,
      syncHelpModalVisible: false,
      migrateModalVisible: false,
      boxID: "",
      apiKey: "",
      showSyncWarnings: localStorage.showSyncWarnings,
    };
  },
  methods: {
    async toggleRemoteStorage(event) {
      // if useRemoteStorage has been turned off, we need to remove any
      // cards from the remote storage and then recreate locally, else we need to delete
      // locally and recreate on remote
      event.target.classList.add("wait");
      const cards = await db.read();

      let promDelete = [];
      let promCreate = [];
      for (let card of cards) {
        promDelete.push(db.delete(card.id, { remote: !this.useRemoteStorage }));
        promCreate.push(
          db.create(
            pick(card, [
              "action",
              "deck",
              "description",
              "domain",
              "image",
              "skipped",
              "time",
              "title",
              "url",
            ]),
            { remote: this.useRemoteStorage }
          )
        );
      }
      await Promise.all(promDelete);
      await Promise.all(promCreate);

      event.target.classList.remove("wait");

      // persist useRemoteStorage in local storage
      localStorage.useRemoteStorage = this.useRemoteStorage;

      // Reload the cards from the data store to update the view
      this.$emit("reloadCards");
    },
    toggleSyncWarnings() {
      localStorage.showSyncWarnings = this.showSyncWarnings;
    },
    copyToClipboard(text, event) {
      navigator.clipboard.writeText(text).then(
        () => {
          console.log("Async: Copying to clipboard was successful!");
          event.target.classList.toggle("copied");
          let copyTimer = setTimeout(() => {
            event.target.classList.toggle("copied");
            clearTimeout(copyTimer);
          }, 1000);
        },
        function(err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
    },
    toggleAllCards(event) {
      if (this.allCardsVisible) {
        this.$emit("hideCards");
        this.$emit("close");
      } else {
        if (this.credits >= this.skipPrice) {
          event.target.classList.add("success");
          let successTimer = setTimeout(() => {
            event.target.classList.remove("success");
            clearTimeout(successTimer);
            this.$emit("showCards");
            this.$emit("close");
          }, 700);
        } else {
          this.creditsModalVisible = true;
        }
      }
    },
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
    async reloadStorageDetails() {
      this.boxStatus = await db.status();
      this.boxID = await db.id({ my: true });
      this.apiKey = await db.apiKey({ my: true });

      this.$emit("switchedBox");
    },
  },
  async mounted() {
    this.boxStatus = await db.status();
    this.boxID = await db.id({ my: true });
    this.apiKey = await db.apiKey({ my: true });
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

.settings {
  text-align: left;
}

.settings h2 {
  text-align: center;
}

.settings h3 {
  box-sizing: border-box;
  border-radius: 5px;
  margin: 0;
  width: 100%;
  color: white;
  padding: 10px;
}

.settings h3.open {
  border-radius: 5px 5px 0px 0px;
}

.settings .items {
  box-sizing: border-box;
  border-radius: 0px 0px 5px 5px;
  width: 100%;
  padding: 10px;
}

.your-data button {
  background-color: rgb(223, 17, 101);
  border-color: rgb(223, 17, 101);
}

.your-data .items {
  background-color: rgb(223, 17, 101, 0.1);
}

.your-data h3 {
  background-color: rgb(223, 17, 101);
}

.online-storage button {
  background-color: rgb(115, 52, 94);
  border-color: rgb(115, 52, 94);
}

.online-storage .items {
  background-color: rgb(115, 52, 94, 0.1);
}

.online-storage h3 {
  background-color: rgb(115, 52, 94);
}

.help button {
  background-color: rgb(223, 17, 101);
  border-color: rgb(223, 17, 101);
}

.help .items {
  background-color: rgb(223, 17, 101, 0.1);
}

.help h3 {
  background-color: rgb(223, 17, 101);
}

.purchases button {
  background-color: rgb(67, 41, 88);
  border-color: rgb(67, 41, 88);
}

.purchases .items {
  background-color: rgb(67, 41, 88, 0.1);
}

.purchases h3 {
  background-color: rgb(67, 41, 88);
}

/* Custom checkbox code from https://www.w3schools.com/howto/howto_css_custom_checkbox.asp */
.container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 16px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
}

/* Hide the browser's default checkbox */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
  height: 0;
  width: 0;
}

/* Create a custom checkbox */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #ccc;
}

/* On mouse-over, add a grey background color */
.container:hover input ~ .checkmark {
  background-color: rgb(182, 182, 182);
}

/* When the checkbox is checked, add a purple background */
.container input:checked ~ .checkmark {
  background-color: rgb(115, 52, 94);
}

/* Create the checkmark/indicator (hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the checkmark when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the checkmark/indicator */
.container .checkmark:after {
  left: 9px;
  top: 5px;
  width: 5px;
  height: 10px;
  border: solid white;
  border-width: 0 3px 3px 0;
  -webkit-transform: rotate(45deg);
  -ms-transform: rotate(45deg);
  transform: rotate(45deg);
}

.container input.wait ~ .checkmark:after {
  position: absolute;
  display: block;
  content: "⏳";
  left: 2px;
  top: -1px;
  width: 0px;
  height: 0px;
  border: none;
  -webkit-transform: rotate(0deg);
  -ms-transform: rotate(0deg);
  transform: rotate(0deg);
}
</style>
