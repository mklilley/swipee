import { box as remote } from "@/services/jsonbox";

// function to create random id for each flash card - inspired by
// https://stackoverflow.com/questions/105034/how-to-create-guid-uuid
function id() {
  return "xxxxxxxxxxxxxxxxxxxx".replace(/[xy]/g, function(c) {
    var r = (Math.random() * 16) | 0,
      v = c == "x" ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// If remote database fails to respond, store the id of the failed card and
// also what function failed, e.g. "create", "update" etc
function recordRemoteFail(id, typeOfFail) {
  let remoteFails = JSON.parse(localStorage.getItem("remoteFails")) || {};
  remoteFails[id] = typeOfFail;
  localStorage.setItem("remoteFails", JSON.stringify(remoteFails));
}

// key to identify the collection of cards in the data store
const key = "cards";

const db = {
  id: async function(options = {}) {
    return await remote.id(options);
  },
  apiKey: async function(options = {}) {
    return await remote.apiKey(options);
  },
  status: async function() {
    return await remote.status();
  },
  switch: async function(storageID, apiKey) {
    return await remote.switch(storageID, apiKey);
  },
  keepAlive: async function() {
    return await remote.read();
  },
  create: async function(newCard, options = {}) {
    // Only create data on the remote database if remote flag is true
    if (options.remote === true) {
      let result = await remote.create(newCard);

      // The call to the remote is successful
      if (result) {
        // The output from remote.create() should be to echo back the card data
        // with an extra key "id" which is provided by the remote database
        newCard = result;
        // Store last update time in local storage so we can check when local storage
        // is out of sync with server
        localStorage.setItem("remoteUpdatedOn", result["_createdOn"]);
      }
      // The call to the remote is unsuccessful
      if (!result) {
        // If the remote database fails, we need to log the failure and provide
        // an id for the card so we can save it in the localStorage
        let i = id();
        newCard.id = i;
        recordRemoteFail(i, "create");
      }
    } else {
      // If only using local storage we need to provide an
      //  id for the card so we can save it in the localStorage
      let i = id();
      newCard.id = i;
    }

    // Get all the cards
    let allCards = JSON.parse(localStorage.getItem(key)) || {};

    // Add the new card to cards collection
    allCards[newCard.id] = newCard;

    // Save the updated cards collection
    localStorage.setItem(key, JSON.stringify(allCards));
  },
  read: async function(options = {}) {
    let cards;

    // Go get all data from remote database if remote flag is true
    if (options.remote === true) {
      // Get all the cards
      cards = await remote.read();

      // The call to the remote is successful
      if (cards) {
        // Save the cards to the localStorage
        localStorage.setItem(key, JSON.stringify(cards));
        // If there are cards in the remote storage then add the last update time
        // to local storage
        if (Object.keys(cards).length !== 0) {
          let status = await this.status();
          localStorage.setItem("remoteUpdatedOn", status.remoteUpdatedOn);
        }
      }
      //
      else {
        // TODO
      }
    }
    // If no remote flag, then read all data from local storage
    else {
      // Get all the cards
      cards = JSON.parse(localStorage.getItem(key)) || {};
    }

    // Return the cards as an array
    return Object.values(cards);
  },
  update: async function(id, newData, options = {}) {
    // Get all the cards
    let allCards = JSON.parse(localStorage.getItem(key)) || {};

    // Update the specific card with the new data
    allCards[id] = { ...allCards[id], ...newData };

    // Only update data on the remote database if remote flag is true
    if (options.remote === true) {
      let result = await remote.update(id, allCards[id]);

      // The call to the remote is successful
      if (result) {
        allCards[id]["_updatedOn"] = result["_updatedOn"];
        // Store last update time in local storage so we can check when local storage
        // is out of sync with server
        localStorage.setItem("remoteUpdatedOn", result["_updatedOn"]);
      }
      // The call to the remote is unsuccessful
      else {
        // If the remote database fails, we need to log the failure
        recordRemoteFail(id, "update");
      }
    }

    // Save the updated cards collection
    localStorage.setItem(key, JSON.stringify(allCards));
  },
  delete: async function(id, options = {}) {
    // Get all the cards
    let allCards = JSON.parse(localStorage.getItem(key)) || {};

    // delete the card from the cards collection
    delete allCards[id];

    // Save the updated cards collection
    localStorage.setItem(key, JSON.stringify(allCards));

    // Only delete data on the remote database if remote flag is true
    if (options.remote === true) {
      await remote.delete(id).then(success => {
        // If the remote database fails, we need to log the failure
        if (!success) {
          recordRemoteFail(id, "delete");
        }
      });
    }
  }
};

export { db };
