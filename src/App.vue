<template>
  <TopBar
    @add="addModalVisible = true"
    @settings="settingsModalVisible = true"
    @filter="toggleFilterBar()"
    :numCards="cards.length"
    :filterBarVisible="filterVisible"
    :readOnly="false"
    :onLine="onLine"
  ></TopBar>

  <ChipsMultiselect
    v-if="filterVisible"
    v-model="selectedFilterItems"
    :items="filterItems"
    @update:modelValue="updateFilterItems"
  ></ChipsMultiselect>

  <Welcome v-if="welcomeModalVisible" @close="closeWelcomeModal"></Welcome>

  <Settings
    :allCardsVisible="allCardsVisible"
    :skipPrice="skipPrice"
    :credits="credits"
    :numberOfCards="numberOfCards"
    v-if="settingsModalVisible"
    @close="settingsModalVisible = false"
    @reloadCards="loadCards"
    @showCards="showAllCards"
    @hideCards="allCardsVisible = false"
    @updateCredits="updateCredits"
    @switchedBox="switchedBox"
  ></Settings>

  <Credits
    v-if="creditsModalVisible"
    @close="creditsModalVisible = false"
    :skipPrice="skipPrice"
    :credits="credits"
    @updateCredits="updateCredits"
  ></Credits>

  <AddCard
    v-if="addModalVisible"
    @saved="addSavedCardToDeck"
    @close="addModalVisible = false"
    :cards="cards"
  ></AddCard>

  <SyncWarning
    v-if="syncWarningVisible"
    @close="syncWarningVisible = false"
    :message="syncInfo"
    @reloadCards="loadCards"
  ></SyncWarning>

  <div
    class="cards"
    :class="{ stacked: !allCardsVisible, filterVisible: filterVisible }"
  >
    <Card
      v-for="(card, index) in cards"
      :key="card"
      :card="card"
      :is-current="index === 0 || allCardsVisible"
      :stacked="!allCardsVisible"
      :skipPrice="skipPrice"
      :credits="credits"
      :onLine="onLine"
      @cardAccepted="handleCardSkipped(card.id)"
      @cardRejected="handleCardRejected(card.id)"
      @hideCard="removeCardFromDeck(index)"
      @failCardAccepted="skipCardFail"
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
import SyncWarning from "@/components/SyncWarning";

import isEqual from "lodash/isEqual";
import pick from "lodash/pick";

import { db } from "@/services/storage";

import getAppData from "@/services/data";
import skipCard from "@/services/skip";

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
    SyncWarning,
  },

  async mounted() {
    window.addEventListener("online", this.updateConnectionStatus);
    window.addEventListener("offline", this.updateConnectionStatus);

    // If first time using the app, we need to set up some localStorage variables
    if (localStorage.haveSeenWelcome === undefined) {
      localStorage.haveSeenWelcome = false;
      // Create a local welcome card to show the user how to use the app.
      await db.create(
        {
          action: "read",
          time: "short",
          url: "",
          image: "https://swipee.lilley.io/swipe.png",
          description:
            "Swipe left to discard. Swipe right to save for later. Save with caution - it'll cost you. The price doubles for each card saved but it does reset every 24 hours as the deck is reshuffled. We've given you 10 free credits to get you started. Enjoy!",
          domain: "",
          skipped: false,
          title: "How to use Swipee",
          id: 1,
        },
        { remote: true }
      );
    }
    if (localStorage.useRemoteStorage === undefined) {
      localStorage.useRemoteStorage = true;
    }
    if (localStorage.seed === undefined) {
      localStorage.seed = 1;
    }
    if (localStorage.lastReset === undefined) {
      localStorage.lastReset = new Date();
    }
    // if (localStorage.showSyncWarnings === undefined) {
    //   localStorage.showSyncWarnings = true;
    // }
    if (localStorage.lastKeepAliveDate === undefined) {
      localStorage.lastKeepAliveDate = new Date();
    }

    this.seed = parseInt(localStorage.seed);

    this.filterItems = this.initialFilterItems();

    // need to JSON prase in order for true/false to be boolean rather than string
    this.welcomeModalVisible = !JSON.parse(localStorage.haveSeenWelcome);

    // If it's been longer than 24 hours since card shuffle then reset random seed and also set timer
    // for another 24 hours to reset seed and check for skipPrice from server
    this.checkResetTimer();

    await this.loadCards();

    this.boxStatus = await db.status();

    const data = await getAppData();
    if (data) {
      this.credits = data.credits;
      this.skipPrice = data.skipPrice;
      if (this.seed !== data.seed) {
        this.seed = data.seed;
        localStorage.seed = data.seed;
        await this.loadCards();
      }
    } else {
      alert("Problem getting your 'Save for later' credits balance. ");
    }

    if (JSON.parse(localStorage.useRemoteStorage)) {
      this.keepDataAlive();
      if (this.boxStatus) {
        this.checkForRemoteCardChanges();
      }
    }
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
      allCardsVisible: false,
      skipPrice: 1,
      boxStatus: {},
      syncWarningVisible: false,
      numberOfCards: 0,
      credits: 0,
      seed: 1,
      msInDay: 1000 * 60 * 60 * 24,
      onLine: navigator.onLine,
    };
  },

  methods: {
    skipCardFail() {
      if (this.onLine) {
        this.creditsModalVisible = true;
      } else {
        alert("Cannot skip cards without an internet connection");
      }
    },
    updateConnectionStatus() {
      this.onLine = navigator.onLine;
    },
    updateCredits() {
      this.credits += 10;
    },
    checkResetTimer() {
      const msSinceLastReset = new Date() - Date.parse(localStorage.lastReset);
      if (msSinceLastReset > 0) {
        // this prevents user from messing with local storage to get a free reset
        if (msSinceLastReset > this.msInDay) {
          this.newShuffleSeed();
          localStorage.lastReset = new Date();
          this.createResetTimer(this.msInDay);
        } else {
          this.createResetTimer(this.msInDay - msSinceLastReset);
        }
      }
    },
    createResetTimer(timeInMs) {
      const resetTimer = setTimeout(() => {
        this.newShuffleSeed();
        this.loadCards();
        localStorage.lastReset = new Date();
        getAppData().then((data) => {
          this.credits = data.credits;
          this.skipPrice = data.skipPrice;
          if (this.seed !== data.seed) {
            this.seed = data.seed;
            localStorage.seed = data.seed;
            this.loadCards();
          }
          localStorage.seed = data.seed;
        });
        clearTimeout(resetTimer);
        this.createResetTimer(this.msInDay);
      }, timeInMs);
    },
    async checkForRemoteCardChanges() {
      this.syncInfo = "";
      //First check if local card number is different to what's on remote
      if (this.boxStatus.numCards !== this.numberOfCards) {
        // Show sync warning to user
        //this.syncInfo = `Local cards: ${this.numberOfCards}, Remote cards: ${this.boxStatus.numCards}.`;
        //this.syncWarningVisible = true;
        await this.loadCards({ remote: true });
      } else if (this.boxStatus.remoteUpdatedOn) {
        // Next check if the online storage has been updated since the user last did
        // an update from this device. If so then show sync warning screen
        if (
          new Date(this.boxStatus.remoteUpdatedOn) >
          new Date(localStorage.remoteUpdatedOn)
        ) {
          await this.loadCards({ remote: true });
          //this.syncWarningVisible = true;
        }
      }
    },
    async keepDataAlive() {
      let numDaysSinceKeepAlive =
        (new Date() - Date.parse(localStorage.lastKeepAliveDate)) /
        this.msInDay;
      if (numDaysSinceKeepAlive > 90) {
        let keepAliveSuccess = await db.keepAlive();
        if (keepAliveSuccess) {
          localStorage.lastKeepAliveDate = new Date();
        } else {
          alert(
            `Your online storage data will be deleted in ${Math.round(
              360 - numDaysSinceKeepAlive
            )} days`
          );
        }
      }
    },
    showAllCards() {
      this.allCardsVisible = true;
      this.useCreditsUpdatePrice();
    },
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
      this.useCreditsUpdatePrice();
    },
    async useCreditsUpdatePrice() {
      this.credits = this.credits - this.skipPrice;
      this.skipPrice = this.skipPrice * 2;
      const creditsAndPrice = await skipCard();
      if (creditsAndPrice) {
        this.credits = creditsAndPrice.credits;
        this.skipPrice = creditsAndPrice.skipPrice;
      }
    },
    removeCardFromDeck(i) {
      this.cards.splice(i, 1);
    },
    closeWelcomeModal() {
      this.welcomeModalVisible = false;
      localStorage.setItem("haveSeenWelcome", true);
    },
    removeSkippedCards(cards) {
      const now = new Date();
      const cardsWithoutSkipped = cards.filter((card) => {
        if (!card.skipped) {
          // If card hasn't been skipped then show it
          return true;
        } else {
          if ((now - Date.parse(card.skipped)) / this.msInDay > 1) {
            // After 1 day, return skipped cards back to the deck. Don't await for the
            // storage to update so that async so the filter can run quickly
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
      this.seed += 1;
      localStorage.seed = this.seed;
    },
    shuffle(cards) {
      const shuffledDeck = shuffleSeed.shuffle(cards, this.seed);
      return shuffledDeck;
    },
    loadCards: async function(options = {}) {
      // First read all cards from storage
      let cards = await db.read(options);

      // Save number of cards to variable to feed into settings component
      this.numberOfCards = cards.length;

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
    async switchedBox() {
      const data = await getAppData();
      if (data) {
        this.credits = data.credits;
        this.skipPrice = data.skipPrice;
        this.seed = data.seed;
        localStorage.seed = data.seed;
      }
      await this.loadCards({ remote: true });
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
  flex-direction: column;
  justify-content: center;
  position: absolute;
  top: 90px;
  left: 0;
  right: 0;
  box-sizing: border-box;
  align-items: center;
}

.cards.filterVisible {
  top: 120px;
}

.cards.stacked {
  height: calc(
    100% - 140px
  ); // 140 = 2*70, 70 comes from TopBar component height}
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

button.success::after {
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
