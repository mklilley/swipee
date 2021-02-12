<template>
  <TopBar
    @add="addModalVisible = true"
    @settings="settingsModalVisible = true"
    :numCards="cards.length"
    :readOnly="false"
  ></TopBar>

  <Welcome v-if="welcomeModalVisible" @close="closeWelcomeModal"></Welcome>

  <Settings
    v-if="settingsModalVisible"
    @close="settingsModalVisible = false"
  ></Settings>

  <AddCard
    v-if="addModalVisible"
    @saved="addCardToDeck"
    @close="addModalVisible = false"
  ></AddCard>

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
import Welcome from "@/components/Welcome";
import Settings from "@/components/Settings";

export default {
  name: "App",
  components: {
    Card,
    TopBar,
    AddCard,
    Welcome,
    Settings,
  },

  async mounted() {
    // If first time using the app, we need to set up some localStorage variables
    // for keeping track of the welcome screen
    if (localStorage.haveSeenWelcome === undefined) {
      localStorage.haveSeenWelcome = false;
    }

    // need to JSON prase in order for true/false to be boolean rather than string
    this.welcomeModalVisible = !JSON.parse(localStorage.haveSeenWelcome);
  },

  data() {
    return {
      cards: ["Test", "Vue.js", "Webpack"],
      addModalVisible: false,
      welcomeModalVisible: false,
      settingsModalVisible: false,
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
    addCardToDeck(card) {
      this.cards.unshift(card.title);
    },
    closeWelcomeModal() {
      this.welcomeModalVisible = false;
      localStorage.setItem("haveSeenWelcome", true);
    },
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

label {
  font-weight: 400;
  color: #333;
  margin-right: 10px;
  font-size: 16px;
}

textarea {
  font-size: 16px;
}

input {
  border-radius: 5px;
  border: 2px solid #eaeaea;
  padding: 10px;
  outline: none;
  font-size: 16px;
}

button {
  border-radius: 5px;
  border: 1px solid #df1165;
  background-color: #df1165;
  padding: 8px 15px;
  outline: none;
  font-size: 14px;
  font-weight: 700;
  color: #fff;
  cursor: pointer;
  transition: all 0.3s ease;
}

button:disabled,
button[disabled] {
  border: 1px solid #999999 !important;
  background-color: #cccccc !important;
  color: #666666 !important;
}

button.copied::after {
  content: " 👍";
}

button.wait::after {
  content: " ⌛";
}

.error {
  margin-top: 10px;
  display: block;
  color: #e44e42;
  font-weight: 600;
}
</style>
