let model = await chrome.storage.local.get("model");



document.getElementById('keyword-model').addEventListener("click", function (e) {
    model = 0
    chrome.storage.sync.set({"model": model})
})

document.getElementById('ai-model').addEventListener("click", function (e) {
    model = 1
    chrome.storage.sync.set({"model": model})
})
