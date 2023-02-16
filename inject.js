async function load_toolbar() {
    let newElement = new DOMParser().parseFromString('<div id="toolbar"></div>', 'text/html').body.childNodes[0];
    let toolbar_url = chrome.runtime.getURL("html/card.html");
    document.querySelector("body").appendChild(newElement);
    // document.getElementById("toolbar").innerHTML = await (await fetch(toolbar_url)).text();
}
  

(async () => {
    load_toolbar();
})();




