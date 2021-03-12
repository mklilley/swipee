const api = "http://localhost:9000/credits/";

import { db } from "@/services/storage";

export default async function(credits) {
  const boxID = await db.id();
  const apiKey = await db.apiKey();

  const options = {
    body: JSON.stringify({ boxID: boxID, apiKey: apiKey, credits: credits }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  };

  const response = await fetch(api, options).catch((err) => {
    console.log(err);
  });

  if ((response || {}).ok) {
    let json = await response.json();
    if (response.error) {
      return credits;
    } else {
      return json.credits;
    }
  } else {
    return credits;
  }
}
