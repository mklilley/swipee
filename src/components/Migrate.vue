<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h2>Migrating from Pocket</h2>

      <div class="left">
        Moving your links from
        <a href="https://getpocket.com/" rel="noopener" target="_blank"
          >Pocket</a
        >
        to Swipee is a bit clunky at the moment. I'm working on making this
        process better. For now this is what you need to do:
      </div>
      <br />
      <div class="left">
        <strong>1.</strong> Export your data from Pocket as an HTML file
        <a
          href="https://getpocket.com/export.php"
          rel="noopener"
          target="_blank"
        >
          here</a
        >. <br /><br />

        <strong>2.</strong> Extract the links from the Pocket HTML file using a
        free online tool like
        <a
          href="https://www.convertcsv.com/url-extractor.htm"
          rel="noopener"
          target="_blank"
          >url-extractor</a
        >. <br /><br />
        <strong>3.</strong> Follow the
        <a
          href="https://github.com/mklilley/swipee/blob/main/import-data-help.md"
          rel="noopener"
          target="_blank"
          >How do I import links into Swipee?</a
        >
        instructions - it's easiest to follow the CSV guide.
      </div>
      <br />
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";

export default {
  name: "Migrate",
  emits: ["close"],
  components: {
    Modal,
  },
  data() {
    return {};
  },
  methods: {},
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
