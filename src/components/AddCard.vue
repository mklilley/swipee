<template>
  <Modal v-on:close="$emit('cancel')">
    <template v-slot:body>
      <h2>Add new link</h2>
      <!-- First the user inputs a link -->
      <div v-if="stage === 1">
        <input
          v-on:keypress.enter="validateUrl()"
          v-model.trim="url"
          type="text"
          placeholder="Link goes here"
          autocomplete="off"
        />
        <br /><br />
        <button v-on:click="validateUrl()">Next</button>
        <span class="error" v-show="error">Oops! Not a valid url.</span>
      </div>

      <!-- Next the user selects whether the link is something to read,watch or listen -->
      <div v-if="stage === 2">
        <input type="radio" value="read" v-model="action" />
        Read <br />
        <input type="radio" value="watch" v-model="action" />
        Watch <br />
        <input type="radio" value="listen" v-model="action" />
        Listen <br /><br />

        <button v-on:click="next()">Next</button>
      </div>

      <!-- Finally, the user selects how long the context is -->
      <div v-if="stage === 3">
        <input type="radio" value="short" v-model="time" />
        Short <br />
        <input type="radio" value="medium" v-model="time" />
        Medium <br />
        <input type="radio" value="long" v-model="time" />
        Long <br /><br />

        <button v-on:click="saveCard()">Next</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";
import linkPreview from "@/services/linkPreview.js";

export default {
  name: "AddCard",
  emits: ["cancel", "saved"],
  components: {
    Modal,
  },
  data() {
    return { url: "", action: "read", time: "short", stage: 1, error: false };
  },
  methods: {
    next() {
      this.stage += 1;
    },
    validateUrl() {
      // This checks the users input to see if it corresponds to a url.

      // This regex pattern will recogise most standard links. Improvements are welcome 🙏.
      const urlRegex = /(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;

      const links = this.url.match(urlRegex);

      if (links !== null) {
        this.url = links[0];
        this.next();
      } else {
        this.error = true;
      }
    },
    async createLinkPreview() {},
    async saveCard() {
      // await this.createLinkPreview();
      const preview = await linkPreview(this.url);
      console.log(preview);
      // Then save the card data along with link preview
      // Then tell the app that the card was successfully saved
      this.$emit("saved");
    },
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
