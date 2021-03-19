const querystring = require("querystring");
const fetch = require("node-fetch");

const apiKey = process.env.JSON_BOX_API_KEY;

// const API_URL = "http://localhost:5000/swipee_" + process.env.JSON_BOX_ID;
const API_URL = "https://json.lilley.io/swipee_" + process.env.JSON_BOX_ID;

// Box object is composed of:
// create : Function to create a new "document" in the jsonbox
// read   : Function to get data for a specific "document" from the jsonbox or
//          get all documents
// update : Function to update the data for a specific "document" from the jsonbox
// delete : Function to delete a specific "document" from the jsonbox
const box = {
  create: async function(data) {
    const options = {
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      method: "POST",
    };
    if (apiKey) {
      options.headers["X-API-KEY"] = apiKey;
    }

    const response = await fetch(API_URL, options).catch((err) => {
      console.log(err);
    });

    if ((response || {}).ok) {
      // if response is ok then return the response with some modifications
      //  the response echos back the data with _id, and _createdOn. We will rename
      // the _id for convenience in referencing in the app.
      let json = await response.json();
      json.id = json["_id"];
      delete json["_id"];
      return json;
    } else {
      return false;
    }
  },
  read: async function(id, query) {
    const options = {
      method: "GET",
    };
    let response;

    if (!id) {
      let fetchURL = API_URL + "?limit=1000";
      fetchURL = query
        ? fetchURL + "&q=" + querystring.encode(query, ",", ":")
        : fetchURL;
      response = await fetch(fetchURL, options).catch((err) => {
        console.log(err);
      });
    } else {
      response = await fetch(API_URL + "/" + id, options).catch((err) => {
        console.log(err);
      });
    }

    if ((response || {}).ok) {
      let json = await response.json();

      let allItems = {};

      // Rename the json data "_id" keys to "id"
      json.forEach((item) => {
        item.id = item["_id"];
        delete item["_id"];
        // Add the update item to allItems
        allItems[item.id] = item;
      });

      return allItems;
    } else {
      return false;
    }
  },
  update: async function(id, data) {
    const options = {
      body: JSON.stringify(data),
      headers: { "Content-Type": "application/json" },
      method: "PUT",
    };
    if (apiKey) {
      options.headers["X-API-KEY"] = apiKey;
    }

    const response = await fetch(API_URL + "/" + id, options).catch((err) => {
      console.log(err);
    });

    if ((response || {}).ok) {
      let json = await response.json();
      return json;
    } else {
      return false;
    }
  },
  delete: async function(id) {
    const options = {
      method: "DELETE",
    };
    if (apiKey) {
      options.headers = { "X-API-KEY": apiKey };
    }
    let response;

    response = await fetch(API_URL + "/" + id, options).catch((err) => {
      console.log(err);
    });

    if ((response || {}).ok) {
      let json = await response.json();
      return json;
    } else {
      return false;
    }
  },
};

module.exports = box;
