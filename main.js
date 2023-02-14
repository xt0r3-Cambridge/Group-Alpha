(async () => {
    const src = chrome.runtime.getURL("other.js");
    const other = await import(src);
    let paragraphs = document.getElementsByTagName("p");
    let b = other.classify(other.scrape(document));
    if (b) {
        alert("AI!!!!!!")
    }
})();



