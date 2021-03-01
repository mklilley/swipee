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

import linkPreview from "@/services/linkPreview.js";

import pick from "lodash/pick";

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
      event.target.classList.toggle("wait");

      let promCreateCards = []; // will hold promises to create many cards
      let promLinkPreviews = []; // will hold promises to create many links previews
      let promLinkPreviewCards = []; // will hold required card info of links having preview currently made for them
      let problemCards = []; // will hold url of links that don't have required info or cannot have link preview generated for them

      // Check imported data to see if it contains all the right data
      const requiredKeys = ["action", "time", "url"];
      const linkPreviewKeys = ["title", "description", "domain", "image"];
      for (let card of cards) {
        if (requiredKeys.every((key) => Object.keys(card).includes(key))) {
          // Card has all the required keys
          if (linkPreviewKeys.every((key) => Object.keys(card).includes(key))) {
            // Card has all the keys needed to create a link preview
            card.deck = card.deck || "default";
            card.flipped = card.flipped || false;
            promCreateCards.push(
              db.create(card, { remote: this.useRemoteStorage })
            );
          } else {
            // Card doens't have all the keys necessary to make a link preview so need to generate the preview for the url
            promLinkPreviews.push(linkPreview(card.url));
            promLinkPreviewCards.push(pick(card, requiredKeys));
          }
        } else {
          // Card doesn't have required keys
          problemCards.push(card.url);
        }
      }

      const linkPreviews = await Promise.all(promLinkPreviews);
      linkPreviews.forEach((element, i) => {
        if (element) {
          // link preview service success. Merge new keys with required keys.
          const card = {
            ...promLinkPreviewCards[i],
            ...element,
          };
          promCreateCards.push(
            db.create(card, { remote: this.useRemoteStorage })
          );
        } else {
          // link preview service failed to generate link preview
          problemCards.push(promLinkPreviewCards[i].url);
        }
      });

      await Promise.all(promCreateCards);
      event.target.classList.toggle("wait");
      if (problemCards.length !== 0) {
        console.log(problemCards);
        alert(
          "Some links could not be imported: " + JSON.stringify(problemCards)
        );
      }
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
