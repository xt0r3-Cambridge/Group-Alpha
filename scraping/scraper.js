function getPTags() {
  const elements = document.querySelectorAll("p");

  const h1 = document.querySelectorAll("h1");
  const h2 = document.querySelectorAll("h2");
  const h3 = document.querySelectorAll("h3");

  hTags = h1.concat(h2,h3)

  var pTags = "";
  for (const element of elements) {
    pTags += (element.textContent.trim()+"\n");
  }

  return (pTags, hTags);
}

function getTokenizedPTags() {
  const elements = document.querySelectorAll("p");

  const h1 = document.querySelectorAll("h1");
  const h2 = document.querySelectorAll("h2");
  const h3 = document.querySelectorAll("h3");

  hTags = h1.concat(h2,h3)

  const pTags = [];
  for (const element of elements) {
    pTags.push(element.textContent.trim().split(/\s+/));
  }
  return (pTags, hTags);
}