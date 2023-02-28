document.body.onload = function() {
    chrome.storage.sync.get("model", (model) => {
        let modelNumber = model["model"];
        if (modelNumber == 0) {
            document.getElementById('keyword-model').checked = true;
            document.getElementById('ai-model').checked = false;
        }
        else {
            document.getElementById('keyword-model').checked = false;
            document.getElementById('ai-model').checked = true;
        }
    });
}




document.getElementById('keyword-model').addEventListener("click", function (e) {
    chrome.storage.sync.set({"model": 0});
})

document.getElementById('ai-model').addEventListener("click", function (e) {
    chrome.storage.sync.set({"model": 1});
})

document.getElementById("about").addEventListener('click', function (e) {
    chrome.tabs.create({url: e.target.href});
})

document.getElementById("card-style-reset").addEventListener('click', function (e) {
    chrome.storage.sync.set({"right": "10px", "left": "auto", "top": "100px", "display": "none"});
})