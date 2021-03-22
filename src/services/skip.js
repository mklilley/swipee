const api = "https://swipee.lilley.io/api/skip";

import { db } from "@/services/storage";

export default async function() {
  const boxID = await db.id();
  const apiKey = await db.apiKey();

  const options = {
    body: JSON.stringify({
      boxID: boxID,
      apiKey: apiKey,
    }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  };

  const response = await fetch(api, options).catch((err) => {
    console.log(err);
  });

  if ((response || {}).ok) {
    let json = await response.json();
    if (response.status !== 200) {
      console.log(response.message);
      return false;
    } else {
      return json;
    }
  } else {
    console.log((response || {}).statusText);
    return false;
  }
}
