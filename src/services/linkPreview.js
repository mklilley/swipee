const LINK_PREVIEW_API = "https://dev.lilley.io/link-preview/";

export default async function(url) {
  const options = {
    body: JSON.stringify({ url: url }),
    headers: { "Content-Type": "application/json" },
    method: "POST",
  };

  const response = await fetch(LINK_PREVIEW_API, options).catch((err) => {
    console.log(err);
  });

  if ((response || {}).ok) {
    let json = await response.json();
    return json;
  } else {
    return false;
  }
}
