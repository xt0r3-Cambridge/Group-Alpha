// This function needs replacing with the function that classifies text
// Currently accepts a list of strings
export function classify(text) {
    for (let string of text) {
        if (string.includes("AI")) {
            return true;
        }
    }
    return false;
}

// This function needs replacing with the function that scrapes text
// I believe this function should return a list of strings
export function scrape(document) {
    const array = [];
    for (let tag of document.getElementsByTagName("p")) {
        array.push(tag.textContent);
    }
    return array;
}

