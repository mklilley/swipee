<template>
  <TopBar
    @add="addModalVisible = true"
    @settings="settingsModalVisible = true"
    @filter="toggleFilterBar()"
    :numCards="cards.length"
    :filterBarVisible="filterVisible"
    :readOnly="false"
  ></TopBar>

  <ChipsMultiselect
    v-if="filterVisible"
    v-model="selectedFilterItems"
    :items="filterItems"
    @update:modelValue="updateFilterItems"
  ></ChipsMultiselect>

  <Welcome v-if="welcomeModalVisible" @close="closeWelcomeModal"></Welcome>

  <Settings
    v-if="settingsModalVisible"
    @close="settingsModalVisible = false"
    @restoreData="loadCards({ remote: true })"
  ></Settings>

  <Credits
    v-if="creditsModalVisible"
    @close="creditsModalVisible = false"
  ></Credits>

  <AddCard
    v-if="addModalVisible"
    @saved="addSavedCardToDeck"
    @close="addModalVisible = false"
    :cards="cards"
  ></AddCard>

  <div class="cards">
    <Card
      v-for="(card, index) in cards"
      :key="card"
      :card="card"
      :is-current="index === 0"
      @cardAccepted="handleCardSkipped(card.id)"
      @cardRejected="handleCardRejected(card.id)"
      @hideCard="removeCardFromDeck"
      @failCardAccepted="creditsModalVisible = true"
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
import Credits from "@/components/Credits";
import ChipsMultiselect from "@/components/ChipsMultiselect";

import isEqual from "lodash/isEqual";
import pick from "lodash/pick";

import { db } from "@/services/storage";

import * as shuffleSeed from "shuffle-seed";

export default {
  name: "App",
  components: {
    Card,
    TopBar,
    AddCard,
    Welcome,
    Settings,
    Credits,
    ChipsMultiselect,
  },

  async mounted() {
    // If first time using the app, we need to set up some localStorage variables
    if (localStorage.haveSeenWelcome === undefined) {
      localStorage.haveSeenWelcome = false;
    }
    if (localStorage.useRemoteStorage === undefined) {
      localStorage.useRemoteStorage = false;
    }
    if (localStorage.seed === undefined) {
      localStorage.seed = 1;
    }
    if (localStorage.lastShuffle === undefined) {
      localStorage.lastShuffle = new Date();
    }
    if (localStorage.skipPrice === undefined) {
      localStorage.skipPrice = 1;
    }
    if (localStorage.credits === undefined) {
      localStorage.credits = 10;
    }

    this.filterItems = this.initialFilterItems();

    // need to JSON prase in order for true/false to be boolean rather than string
    this.welcomeModalVisible = !JSON.parse(localStorage.haveSeenWelcome);

    // If it's been longer than 24 hours since last app load then change shuffleSeed - this shuffles up the deck in a new way
    const msInDay = 1000 * 60 * 60 * 24;
    const daySinceLastLoad =
      (new Date() - Date.parse(localStorage.lastShuffle)) / msInDay;
    if (daySinceLastLoad > 1) {
      this.newShuffleSeed();
    }

    await this.loadCards();
  },

  data() {
    return {
      cards: [],
      addModalVisible: false,
      welcomeModalVisible: false,
      settingsModalVisible: false,
      creditsModalVisible: false,
      filterVisible: false,
      selectedFilterItems: null,
      selectedFilterItemsObject: {},
      filterItems: [],
    };
  },

  methods: {
    async toggleFilterBar() {
      this.filterItems = this.initialFilterItems();
      this.selectedFilterItems = null;
      this.selectedFilterItemsObject = {};
      this.filterVisible = !this.filterVisible;
      await this.loadCards();
    },
    initialFilterItems() {
      return [
        {
          id: 1,
          label: "📚 Read",
          _label: "read",
          type: "action",
        },
        {
          id: 2,
          label: "📺 Watch",
          _label: "watch",
          type: "action",
        },
        {
          id: 3,
          label: "🎧 Listen",
          _label: "listen",
          type: "action",
        },
        {
          id: 4,
          label: "⚡️ Short",
          _label: "short",
          type: "time",
        },
        {
          id: 5,
          label: "⏳ Medium",
          _label: "medium",
          type: "time",
        },
        {
          id: 6,
          label: "⏰ Long",
          _label: "long",
          type: "time",
        },
      ];
    },
    async updateFilterItems(filterItemsSelected) {
      let items = this.initialFilterItems();

      this.selectedFilterItemsObject = {};
      filterItemsSelected.forEach((element) => {
        // This creates an object describing which filters are currently enabled.
        // It makes it easier to filter cards, cf function removedFilteredCards
        this.selectedFilterItemsObject[element.type] = element._label;

        // This ensures that once you've picked a filter of a certain type you cannot choose another filter of the same type
        // i.e. if you have selected "watch" then you cannot select "read"
        items = items.filter((item) => item.type !== element.type);
      });
      this.filterItems = items;
      await this.loadCards();
    },
    handleCardAccepted() {
      console.log("handleCardAccepted");
    },
    async handleCardRejected(cardId) {
      console.log("handleCardRejected");
      await db.delete(cardId, {
        remote: JSON.parse(localStorage.useRemoteStorage),
      });
    },
    async handleCardSkipped(cardId) {
      console.log("handleCardSkipped");
      const now = new Date();
      await db.update(
        cardId,
        {
          skipped: now,
        },
        { remote: JSON.parse(localStorage.useRemoteStorage) }
      );
      localStorage.credits =
        parseInt(localStorage.credits) - parseInt(localStorage.skipPrice);
      localStorage.skipPrice = parseInt(localStorage.skipPrice) * 2;
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
    removeSkippedCards(cards) {
      const msInDay = 1000 * 60 * 60 * 24;
      const now = new Date();
      const cardsWithoutSkipped = cards.filter(function(card) {
        if (!card.skipped) {
          // If card hasn't been skipped then show it
          return true;
        } else {
          if ((now - Date.parse(card.skipped)) / msInDay > 1) {
            // After 1 day, return skipped cards back to the deck. Don't await for the
            // storage to update - to that async so the filter can run quickly
            db.update(
              card.id,
              {
                skipped: false,
              },
              { remote: JSON.parse(localStorage.useRemoteStorage) }
            );
            return true;
          } else {
            // Card was skipped less than 24 hours ago, keep it hidden.
            return false;
          }
        }
      });
      return cardsWithoutSkipped;
    },
    removedFilteredCards(cards) {
      if (isEqual(this.selectedFilterItemsObject, {})) {
        return cards;
      } else {
        const filteredCards = cards.filter((card) => {
          const itemsToFilterBy = pick(card, ["action", "time"]);
          // This line below takes current filter object and overwrites the
          // newly created itemsToFilterBy object. The idea is that if this
          // overwriting process leaves the itemsToFilterBy unchanged then
          // the card passes through the filter. Otherwise it is stopped from being shown.
          const filteredItems = {
            ...itemsToFilterBy,
            ...this.selectedFilterItemsObject,
          };
          return isEqual(filteredItems, itemsToFilterBy);
        });
        return filteredCards;
      }
    },
    newShuffleSeed() {
      localStorage.seed = parseInt(localStorage.seed) + 1;
      localStorage.lastShuffle = new Date();
    },
    shuffle(cards) {
      const shuffledDeck = shuffleSeed.shuffle(
        cards,
        parseInt(localStorage.seed)
      );
      return shuffledDeck;
    },
    loadCards: async function(options = {}) {
      // First read all cards from storage
      let cards = await db.read(options);
      // Next shuffle the cards
      cards = this.shuffle(cards);
      // Next remove cards that were skipped less than 24 hours ago
      cards = this.removeSkippedCards(cards);
      // Next remove cards that have been filterd out
      cards = this.removedFilteredCards(cards);
      this.cards = cards;
    },
    addSavedCardToDeck(newCard) {
      this.cards.push(newCard);
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
  content: " ⏳";
}

.error {
  margin-top: 10px;
  display: block;
  color: #e44e42;
  font-weight: 600;
}
</style>
