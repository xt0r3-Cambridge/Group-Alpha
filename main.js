async function load_toolbar() {
    let newElement = new DOMParser().parseFromString('<div id="toolbar"></div>', 'text/html').body.childNodes[0];
    let toolbar_url = chrome.runtime.getURL("html/card.html");
  
    document.querySelector("body").appendChild(newElement);
    document.getElementById("toolbar").innerHTML = await (await fetch(toolbar_url)).text();
}
  

(async () => {
    load_toolbar();
    const src = chrome.runtime.getURL("other.js");
    const other = await import(src);
    let paragraphs = document.getElementsByTagName("p");
    let b = other.classify(other.scrape(document));
    /*
    var wrapperIFrame = document.createElement("iframe"); 
    wrapperIFrame.src = "chrome-extension://*";
    wrapperIFrame.width = "640px";
    wrapperIFrame.height = "480px";
    var iframe = document.createElement("iframe");
    iframe.setAttribute("src", chrome.runtime.getURL("html/card.html"));
    iframe.style.width = "640px";
    iframe.style.height = "480px";
    wrapperIFrame.appendChild(iframe);
    document.body.prepend(wrapperIFrame);
    */
    if (b) {
        alert("AI!!!!!!");
    }
})();




