<template>
  <Modal v-on:close="$emit('close')">
    <template v-slot:body>
      <h1><img src="@/assets/logo.svg" alt="Swipee logo" /><br />Swipee</h1>
      <h2>The no-list reading list app</h2>
      <a
        href="https://www.buymeacoffee.com/mklilley"
        target="_blank"
        rel="noopener"
        ><img
          src="https://cdn.buymeacoffee.com/buttons/v2/default-yellow.png"
          alt="Buy Me A Coffee"
          class="coffee"
      /></a>
      <br /><br />
      <div class="left">
        <h3 class="open">Reading lists suck!</h3>
        <div class="items">
          If you're anything like me, then you're interested in everything but
          see opportunity cost around every corner. Save everything for later
          and then get paralysed by choice. Hunker down for a long read, watch a
          quick video or catch up with one of the dozens of podcasts you
          subscribe to ? 😣
        </div>
        <br />
        <h3 class="open">The joy of Swipee</h3>
        <div class="items">
          Swipee makes the choice for you. Instead of a reading list, Swipee
          uses a deck of swipeable cards - left to discard, right to save for
          later. This way, you'll never have to see your ever growing list of
          content 🙌 . Swipee also helps you to be more honest about the content
          you want to save for later. By using financial incentives, Swipee
          encourages you to think twice before you swipe right.
        </div>
        <br />

        <h3 class="open">The history of Swipee</h3>
        <div class="items">
          I built a basic version of Swipee in the Spring of 2018 and have been
          using it every day since. I thought other people might also find it
          useful, so in Spring 2021 I decided to clean it up and make it
          available to everyone for free. You can find the source code on
          <a
            target="_blank"
            href="https://github.com/mklilley/swipee"
            rel="noopener"
            >GitHub
            <img src="@/assets/github.png" height="20" alt="GitHub logo"/></a
          >. Enjoy!
        </div>
        <br />

        <div v-if="isMobileDevice">
          <h3 class="open">Add to home screen</h3>
          <div class="items">
            For the best experience, add Swipee to your home screen - you can
            then view your cards in full screen mode.
            <a
              vue-if="addToHomeScreenURL"
              target="_blank"
              rel="noopener"
              :href="addToHomeScreenURL"
              >Here's help on how to do that.</a
            >
          </div>
          <br />
        </div>
        <h3 class="open">Local data storage</h3>
        <div class="items">
          Your reading list cards are stored on your device using your browser's
          <a
            href="https://blog.logrocket.com/the-complete-guide-to-using-localstorage-in-javascript-apps-ba44edb53a36/."
            target="_blank"
            rel="noopener"
            >localStorage</a
          >.
        </div>
        <br />
        <h3 class="open">Online data storage</h3>
        <div class="items">
          <span v-if="useRemoteStorage">
            I don't want your data, so I've made a deliberate choice not to
            create personally identifiable Swipee accounts. I have however
            created a free online storage option (which you can turn off in
            settings). <br /><br />
            The online storage works as a backup of your reading list data and
            also allows you to sync that data across devices (see help for more
            details). <br /><br />
            If you want to restore/sync data to a new device, you'll need your
            unique storage box ID (think of this like a username):<br /><br />
            <strong>{{ boxID }}</strong> <br /><br />

            and storage key (think of this like a password):<br /><br />
            <strong>{{ apiKey }}</strong> <br /><br />
            <button
              @click.prevent="
                copyToClipboard(
                  'boxID: ' + boxID + '\nstorageKey: ' + apiKey,
                  $event
                )
              "
            >
              Copy your box ID and key
            </button>
            and store them outside of Swipee. Anyone with your box ID can view
            your data and anyone with your key can edit and delete your data so
            please keep them safe.
            <br /><br />

            Now for some disclaimers:<br />

            <li>
              If you don't use the app for a year, your data will be deleted.
            </li>

            <li>
              There is no backup of the online data, so if your data is lost due
              to some technical issues, it's lost forever.
            </li>

            <li>
              Please don't use this app to store sensitive information - it's
              not been stress tested for data security bugs.
            </li>
          </span>
          <span v-else>
            Currently disabled in settings
          </span>
        </div>
      </div>
      <br />
      <button @click.prevent="$emit('close')">OK</button>
    </template>
  </Modal>
</template>

<script>
import Modal from "@/components/Modal.vue";
import { db } from "@/services/storage";

export default {
  name: "Welcome",
  emits: ["close"],
  components: {
    Modal,
  },
  data() {
    return {
      useRemoteStorage: JSON.parse(localStorage.useRemoteStorage),
      boxID: "",
      apiKey: "",
      isMobileDevice: true,
      addToHomeScreenURL: "",
    };
  },
  methods: {
    copyToClipboard(text, event) {
      navigator.clipboard.writeText(text).then(
        () => {
          console.log("Async: Copying to clipboard was successful!");
          event.target.classList.toggle("copied");
          let copyTimer = setTimeout(() => {
            event.target.classList.toggle("copied");
            clearTimeout(copyTimer);
          }, 1000);
        },
        function(err) {
          console.error("Async: Could not copy text: ", err);
        }
      );
    },
  },
  async mounted() {
    this.boxID = await db.id({ my: true });
    this.apiKey = await db.apiKey({ my: true });

    if (
      /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
        navigator.userAgent
      )
    ) {
      this.isMobileDevice = true;
      if (/Android/i.test(navigator.userAgent)) {
        this.addToHomeScreenURL =
          "https://browserhow.com/how-to-add-to-home-screen-shortcut-links-with-chrome-android/";
      }
      if (/iPhone|iPad|iPod/i.test(navigator.userAgent)) {
        this.addToHomeScreenURL =
          "https://www.macrumors.com/how-to/add-a-web-link-to-home-screen-iphone-ipad/";
      }
    } else {
      this.isMobileDevice = false;
    }
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

h2 {
  text-align: center;
}

h3 {
  box-sizing: border-box;
  border-radius: 5px;
  margin: 0;
  width: 100%;
  color: white;
  padding: 10px;
}

h3.open {
  border-radius: 5px 5px 0px 0px;
  background-color: rgb(223, 17, 101);
}

.items {
  box-sizing: border-box;
  border-radius: 0px 0px 5px 5px;
  width: 100%;
  padding: 10px;
  background-color: rgb(223, 17, 101, 0.1);
}

button {
  background-color: rgb(223, 17, 101);
  border-color: rgb(223, 17, 101);
}

.left {
  text-align: left;
}

.coffee {
  height: 60px !important;
  width: 217px !important;
}
</style>
