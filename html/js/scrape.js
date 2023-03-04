/**
 * Returns a list of elements containing the tags within the `tags` list
 * @param {A list of tags we want to query from the page} tags 
 */
export function getTags(tags) {
  const elements = document.querySelectorAll(tags.join(", "));
  const textWithTag = [];
  for (const element of elements) {
    textWithTag.push(element.textContent.trim());
  }
  return textWithTag;
}

/**
 * Returns a list of elements containing the tags within the `tags` list
 * It also splits each text content lne by line to allow for more granular queries
 * @param {A list of tags we want to query from the page} tags 
 */
export function getTagsAsLines(tags) {
  const elements = document.querySelectorAll(tags.join(", "));
  let textWithTag = [];
  for (const element of elements) {
    textWithTag = textWithTag.concat(
      element
        .textContent
        .split('\n')
        .map(line => {
          return line.trim();
        })
    );
  }
  return textWithTag;
}

/**
 * Returns a list of tokens appearing in tags contained in the `tags` list
 * @param {A list of tags we want to query from the page} tags 
 */
export function getTokenizedTags(tags) {
  const elements = document.querySelectorAll(tags.join(", "));
  const textWithTag = [];
  for (const element of elements) {
    let split = element.textContent.trim().split(/\s+/);
    for (const i of split) { // Flatten
      textWithTag.push(i);
    }
  }
  return textWithTag
}

/**
 * Returns a concatenated string from all the text appearing in tags contained in the `tags` list 
 * separated by newlines
 * @param {A list of tags we want to query from the page} tags 
 */
export function getTagsAsString(tags) {
  const elements = document.querySelectorAll(tags.join(", "));
  let textWithTag = "";
  for (const element of elements) {
    textWithTag += (element.textContent.trim() + "\n");
  }
  return textWithTag
}

export function getPTags() {
  return getTags(["p", "div"])
}

export function getTokenizedPTags() {
  return getTokenizedTags(["p", "div"])
}

export function getPTagsAsString() {
  return getTagsAsString(["p", "div"])
}


export function getHTags() {
  return getTags(["h1", "h2", "h3", "h4", "h5"]);
}

export function getTokenizedHTags() {
  return getTokenizedTags(["h1", "h2", "h3", "h4", "h5"]);
}

export function getHTagsAsString() {
  return getTagsAsString(["h1", "h2", "h3", "h4", "h5"]);
}

/**
 * Function to scrape the important tags from a page
 * These are usually the header tags, or the link tags.
 * (Article headlines usually take you to the article, so they are wrapped in an <a> tag)
 * The method returns the results, splitting the results by line to allow for fine-grained pre screening
 */
export function getImportantLines() {
  return getTagsAsLines(["h1", "h2", "h3", "h4", "h5", "a"]);
}

/**
 * Function to scrape the important tags from a page
 * These are usually the header tags, or the link tags.
 * (Article headlines usually take you to the article, so they are wrapped in an <a> tag)
 */
export function getContentAsString() {
  return getTagsAsString(["h1", "h2", "h3", "h4", "h5", "a", "p", "div"]);
}

export function applyToText(str) {
  return str.trim().split(/\s+/);
}