<template>
  <Modal v-on:close="$emit('cancel')">
    <template v-slot:body>
      <h2>Add new link</h2>
      <!--  -->
      <div v-if="stage === 1">
        <input
          v-on:keypress.enter="next()"
          v-model.trim="url"
          type="text"
          placeholder="Link goes here"
          autocomplete="off"
        />
        <br /><br />
        <span class="error" v-show="error"
          >Oops! Flashcards need a front and a back.</span
        >
      </div>
      <div v-if="stage === 2">
        TODO: Read/Listen/Watch
      </div>
      <div v-if="stage === 3">
        TODO: Short/Medium/Long
      </div>
      <button v-on:click="next()">Next</button>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";

export default {
  name: "AddCard",
  emits: ["cancel", "saved"],
  components: {
    Modal,
  },
  data() {
    return { url: "", stage: 1 };
  },
  methods: {
    next() {
      this.stage += 1;
    },
  },
};
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
input {
  width: 50%;
}
</style>
