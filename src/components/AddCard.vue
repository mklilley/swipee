<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>Add new link</h2>
      <!-- First the user inputs a link -->
      <div v-if="stage === 1" class="flex">
        <input
          v-on:keypress.enter="validateUrl()"
          v-model.trim="url"
          type="text"
          placeholder="Link goes here"
          autocomplete="off"
          ref="urlInput"
        /><br />
        <button v-on:click="validateUrl()">Next</button>
        <span class="error" v-show="error">{{ errorText }}</span>
      </div>

      <!-- Next the user selects whether the link is something to read,watch or listen -->
      <!-- Custom checkbox from https://www.w3schools.com/howto/howto_css_custom_checkbox.asp -->
      <div v-if="stage === 2" class="flex">
        <label class="container">
          📚 Read
          <input type="radio" value="read" v-model="action" />
          <span class="checkmark"></span>
        </label>

        <label class="container"
          >📺 Watch
          <input type="radio" value="watch" v-model="action" />
          <span class="checkmark"></span>
        </label>

        <label class="container"
          >🎧 Listen
          <input type="radio" value="listen" v-model="action" />
          <span class="checkmark"></span>
        </label>

        <button v-on:click="next()">Next</button>
      </div>

      <!-- Finally, the user selects how long the context is -->
      <div v-if="stage === 3" class="flex">
        <label class="container"
          >⚡️ Short
          <input type="radio" value="short" v-model="time" />
          <span class="checkmark"></span>
        </label>

        <label class="container"
          >⏳ Medium
          <input type="radio" value="medium" v-model="time" />
          <span class="checkmark"></span>
        </label>

        <label class="container"
          >⏰ Long
          <input type="radio" value="long" v-model="time" />
          <span class="checkmark"></span>
        </label>

        <button v-on:click="saveCard($event)">Next</button>
      </div>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";
import linkPreview from "@/services/linkPreview.js";
import { db } from "@/services/storage";

import find from "lodash/find";

export default {
  name: "AddCard",
  emits: ["close", "saved"],
  props: {
    cards: {
      type: Array,
      required: true,
    },
  },
  components: {
    Modal,
  },
  data() {
    return {
      url: "",
      deck: "default",
      action: "read",
      time: "short",
      stage: 1,
      error: false,
      errorText: "",
    };
  },
  methods: {
    next() {
      this.stage += 1;
    },
    validateUrl() {
      // This checks the users input to see if it corresponds to a url. Also checks to see if
      // this url has already been added

      // This regex pattern will recogise most standard links. Improvements are welcome 🙏.
      const urlRegex = /(\b(https?):\/\/[-A-Z0-9+&@#/%?=~_|!:,.;]*[-A-Z0-9+&@#/%=~_|])/gi;

      const links = this.url.match(urlRegex);

      if (links !== null) {
        const duplicate = find(this.cards, { url: links[0] });
        if (!duplicate) {
          this.url = links[0];
          this.next();
        } else {
          this.error = true;
          this.errorText = "Oops! You've already saved this link.";
        }
      } else {
        this.error = true;
        this.errorText = "Oops! Not a valid link";
      }
    },
    async saveCard(event) {
      event.target.classList.toggle("wait");
      const preview = await linkPreview(this.url).catch((err) => {
        console.log(err);
        alert("Sorry, something went wrong generating a preview for the link");
        event.target.classList.toggle("wait");
      });
      event.target.classList.toggle("wait");

      if (preview) {
        // Then save the card data along with link preview
        // Then tell the app that the card was successfully saved
        preview.action = this.action;
        preview.time = this.time;
        preview.deck = this.deck;
        preview.skipped = false;
        const newCard = await db.create(preview, {
          remote: JSON.parse(localStorage.useRemoteStorage),
        });
        this.$emit("saved", newCard);
        this.$emit("close");
      }
    },
  },
  mounted() {
    this.$refs.urlInput.focus();
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input[type="text"] {
  width: 50%;
}
.error {
  margin-top: 10px;
  display: block;
  color: #e44e42;
  font-weight: 600;
}

.flex {
  display: flex;
  flex-direction: column;
  align-items: center;
}

/* Custom checkbox code from https://www.w3schools.com/howto/howto_css_custom_checkbox.asp */
.container {
  display: block;
  position: relative;
  padding-left: 35px;
  margin-bottom: 12px;
  cursor: pointer;
  font-size: 22px;
  -webkit-user-select: none;
  -moz-user-select: none;
  -ms-user-select: none;
  user-select: none;
  width: 40%;
  text-align: left;
}

/* Hide the browser's default radio button */
.container input {
  position: absolute;
  opacity: 0;
  cursor: pointer;
}

/* Create a custom radio button */
.checkmark {
  position: absolute;
  top: 0;
  left: 0;
  height: 25px;
  width: 25px;
  background-color: #eee;
  border-radius: 50%;
}

/* On mouse-over, add a grey background color */
.container:hover input ~ .checkmark {
  background-color: #ccc;
}

/* When the radio button is checked, add a blue background */
.container input:checked ~ .checkmark {
  background-color: #df1165;
}

/* Create the indicator (the dot/circle - hidden when not checked) */
.checkmark:after {
  content: "";
  position: absolute;
  display: none;
}

/* Show the indicator (dot/circle) when checked */
.container input:checked ~ .checkmark:after {
  display: block;
}

/* Style the indicator (dot/circle) */
.container .checkmark:after {
  top: 9px;
  left: 9px;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: white;
}
</style>
