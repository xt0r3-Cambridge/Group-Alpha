export function getPTags() {
  const elements = document.querySelectorAll("p");
  let pTags = "";
  for (const element of elements) {
    pTags += (element.textContent.trim()+"\n");
  }
  return pTags;
}

export function getTokenizedPTags() {
  const elements = document.querySelectorAll("p, div");
  const pTags = [];
  for (const element of elements) {
    let split = element.textContent.trim().split(/\s+/);
    for (const i of split) { // Flatten
      pTags.push(i);
    }
  }
  return pTags;
}

export function getPTagsAsString() {
  const elements = document.querySelectorAll("p, div");
  let pTags = "";
  for (const element of elements) {
    let split = element.textContent.trim().split(/\s+/);
    for (const i of split) { // Flatten
      pTags +=i;
    }
  }
  return pTags;
}


export function getHTags() {
  const elements = document.querySelectorAll("h1, h2, h3, h4, h5");
  const hTags = [];
  for (const element of elements) {
    hTags.push(element.textContent.trim());
  }
  return hTags;
}

export function getTokenizedHTags() {
  const elements = document.querySelectorAll("h1, h2, h3, h4, h5");
  const hTags = [];
  for (const element of elements) {
    let split = element.textContent.trim().split(/\s+/);
    for (const i of split) { // Flatten
      hTags.push(i);
    }
  }
  return hTags;
}

export function getHTagsAsString() {
  const elements = document.querySelectorAll("h1, h2, h3, h4, h5");
  let hTags = "";
  for (const element of elements) {
    let split = element.textContent.trim().split(/\s+/);
    for (const i of split) { // Flatten
      hTags +=i;
    }
  }
  return hTags;
}

export function applyToText(str) {
  return str.trim().split(/\s+/);
}