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
    @restoreData="loadCards({ remote: true })"
  ></Settings>

  <AddCard
    v-if="addModalVisible"
    @saved="loadCards"
    @close="addModalVisible = false"
  ></AddCard>

  <div class="cards">
    <Card
      v-for="(card, index) in cards"
      :key="card"
      :card="card"
      :is-current="index === 0"
      @cardAccepted="handleCardAccepted"
      @cardRejected="handleCardRejected(card.id)"
      @cardSkipped="handleCardSkipped"
      @hideCard="removeCardFromDeck"
    />
    <div class="no-card" v-if="cards.length == 0">
      <p v-on:click.stop="addModalVisible = true">
        <span>No cards, tap to create one</span>
      </p>
    </div>
  </div>
</template>

<script>
import Card from "@/components/Card";
import TopBar from "@/components/TopBar";
import AddCard from "@/components/AddCard";
import Welcome from "@/components/Welcome";
import Settings from "@/components/Settings";

import { db } from "@/services/storage";

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
    if (localStorage.useRemoteStorage === undefined) {
      localStorage.useRemoteStorage = false;
    }

    // need to JSON prase in order for true/false to be boolean rather than string
    this.welcomeModalVisible = !JSON.parse(localStorage.haveSeenWelcome);

    await this.loadCards();
  },

  data() {
    return {
      cards: [],
      addModalVisible: false,
      welcomeModalVisible: false,
      settingsModalVisible: false,
    };
  },

  methods: {
    handleCardAccepted() {
      console.log("handleCardAccepted");
    },
    async handleCardRejected(cardId) {
      console.log("handleCardRejected");
      await db.delete(cardId, {
        remote: JSON.parse(localStorage.useRemoteStorage),
      });
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
    loadCards: async function(options = {}) {
      this.cards = await db.read(options);
      return;
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

.no-card p {
  box-sizing: border-box;
  display: flex;
  justify-content: center;
  align-items: center;
  width: 280px;
  max-width: 80vw;
  height: 400px;
  padding: 0px 10%;
  background-color: #fff;
  border-color: grey;
  border-style: dashed;
  border-radius: 7px;
  margin: 5px auto;
  text-align: center;
  cursor: pointer;
  position: relative;
  color: grey;
  font-weight: 600;
  font-size: 25px;
  -webkit-box-shadow: 9px 10px 22px -8px rgba(209, 193, 209, 0.5);
  -moz-box-shadow: 9px 10px 22px -8px rgba(209, 193, 209, 0.5);
  box-shadow: 9px 10px 22px -8px rgba(209, 193, 209, 0.5);
  will-change: transform;
}

.no-card {
  list-style-type: none;
  position: relative;
  padding: 10px 10px;
  transition: all 0.3s ease;
  box-sizing: border-box;
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
