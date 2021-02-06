<template>
  <TopBar
    @add="openAddModal()"
    @settings="showSettingsModal()"
    :numCards="cards.length"
    :readOnly="false"
  ></TopBar>

  <AddCard v-if="addModalVisible" @cancel="addModalVisible = false"></AddCard>

  <div class="cards">
    <Card
      v-for="(card, index) in cards"
      :key="card"
      :card="card"
      :is-current="index === 0"
      @cardAccepted="handleCardAccepted"
      @cardRejected="handleCardRejected"
      @cardSkipped="handleCardSkipped"
      @hideCard="removeCardFromDeck"
    />
  </div>
</template>

<script>
import Card from "@/components/Card";
import TopBar from "@/components/TopBar";
import AddCard from "@/components/AddCard";

export default {
  name: "App",
  components: {
    Card,
    TopBar,
    AddCard,
  },

  data() {
    return {
      cards: ["Test", "Vue.js", "Webpack"],
      addModalVisible: false,
    };
  },

  methods: {
    handleCardAccepted() {
      console.log("handleCardAccepted");
    },
    handleCardRejected() {
      console.log("handleCardRejected");
    },
    handleCardSkipped() {
      console.log("handleCardSkipped");
    },
    removeCardFromDeck() {
      this.cards.shift();
    },
    openAddModal() {
      this.addModalVisible = true;
  },
    openSettingsModal() {},
  },
};
</script>

<style lang="scss">
@import "./styles/mixins.scss";
body {
  margin: 0;
}
#app {
  box-sizing: border-box;
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  height: 100vh;
}

.cards {
  padding-left: 0;
  display: flex;
  flex-flow: row wrap;
  justify-content: center;
  position: relative;
  box-sizing: border-box;
  align-items: center;
  height: calc(
    100% - 140px
  ); // 140 = 2*70, 70 comes from TopBar component height
}
</style>
