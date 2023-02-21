

export function getPTags() {
  const elements = document.querySelectorAll("p");
  var pTags = "";
  for (const element of elements) {
    pTags += (element.textContent.trim()+"\n");
  }
  return pTags;
}

export function getTokenizedPTags() {
  const elements = document.querySelectorAll("p");
  const pTags = [];
  for (const element of elements) {
    let split = element.textContent.trim().split(/\s+/);
    for (const i of split) { // Flatten
      pTags.push(i);
    }
  }
  return pTags;
}