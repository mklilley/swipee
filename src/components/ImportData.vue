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
    csvToJs(csv) {
      // https://gist.github.com/jonmaim/7b896cf5c8cfe932a3dd
      // Start from https://gist.github.com/iwek/7154578#file-csv-to-json-js
      // and fix the issue with double quoted values
      try {
        var lines = csv.split("\n");
        var result = [];
        var headers = lines[0].split(",");

        for (var i = 1; i < lines.length; i++) {
          var obj = {};

          var row = lines[i],
            queryIdx = 0,
            startValueIdx = 0,
            idx = 0;

          if (row.trim() === "") {
            continue;
          }

          while (idx < row.length) {
            /* if we meet a double quote we skip until the next one */
            var c = row[idx];

            if (c === '"') {
              do {
                c = row[++idx];
              } while (c !== '"' && idx < row.length - 1);
            }

            if (
              c === "," ||
              /* handle end of line with no comma */ idx === row.length - 1
            ) {
              let length = idx - startValueIdx;
              if (idx === row.length - 1) {
                length++;
              }
              /*we've got a value */

              var value = row.substr(startValueIdx, length).trim();

              /* skip first double quote */
              if (value[0] === '"') {
                value = value.substr(1);
              }
              /* skip last comma */
              if (value[value.length - 1] === ",") {
                value = value.substr(0, value.length - 1);
              }
              /* skip last double quote */
              if (value[value.length - 1] === '"') {
                value = value.substr(0, value.length - 1);
              }

              var key = headers[queryIdx++];
              obj[key] = value;
              startValueIdx = idx + 1;
            }

            ++idx;
          }

          result.push(obj);
        }
        return result;
      } catch (err) {
        console.log(err);
        return false;
      }
    },
    readFile(event) {
      this.fileOK = false;
      this.error = false;

      let file = event.target.files[0];

      if (
        file.type.includes("text/csv") ||
        file.type.includes("application/json")
      ) {
        let reader = new FileReader();

        reader.readAsText(file);

        reader.onload = () => {
          if (file.type.includes("application/json")) {
            // File is JSON
          try {
            this.file = JSON.parse(reader.result);
            if (!Array.isArray(this.file)) {
                throw new Error("JSON data not in array format.");
            }
            this.fileOK = true;
            } catch (err) {
              this.error = true;
              this.fileOK = false;
              console.log(err);
              this.addFromFileError =
                "Error: File format looks like JSON, but it cannot be processed.";
            }
          } else {
            // File is CSV
            this.file = this.csvToJs(reader.result);
            if (!this.file) {
              this.error = true;
              this.fileOK = false;
              this.addFromFileError =
                "Error: File format looks like CSV, but it cannot be processed.";
            } else {
              this.fileOK = true;
            }
          }
        };

        reader.onerror = () => {
          this.error = true;
          this.fileOK = false;
          this.addFromFileError = reader.error;
        };
      } else {
        this.error = true;
        this.fileOK = false;
        this.addFromFileError = "File must be in CSV of JSON format";
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
            card.skipped =
              card.skipped === undefined ? false : JSON.parse(card.skipped);
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
