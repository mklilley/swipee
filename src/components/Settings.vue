<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>Settings</h2>
      <button v-on:click="$emit('restoreData')">
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

export default {
  name: "Settings",
  emits: ["close", "restoreData"],
  components: {
    Modal,
    Credits,
    Feedback,
    Welcome,
  },
  data() {
    return {
      credits: parseInt(localStorage.credits),
      creditsModalVisible: false,
      feedbackModalVisible: false,
      welcomeModalVisible: false,
    };
  },
  methods: {
    updateCredits() {
      this.credits = parseInt(localStorage.credits);
    },
  },
  async mounted() {},
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
