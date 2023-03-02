"use strict";

let problematic = false
let model = 0
let baseline_arr
let complex_arr
let threshold = 0.700
let card = null;
let content = null;

const OrderEnum = Object.freeze({
    "agency": 0,
    "suggestiveImagery": 1,
    "comparisonWithHumanIntelligence": 2,
    "comparisonWithHumanSkills": 3,
    "hyperbole": 4,
    "uncriticalHistoryComparison": 5,
    "unjustifiedClaimsAboutFuture": 6,
    "falseClaimsAboutProgress": 7,
    "incorrectClaimsAboutStudyReport": 8,
    "deepSoundingTermsForBanalities": 9,
    "treatingSpokespeopleAsNeutral": 10,
    "repeatingPRTerms": 11,
    "noDiscussionOfLimitations": 12,
    "deEmphasizingLimitations": 13,
    "limitationsAddressedBySkeptics": 14,
    "downplayingHumanLabour": 15,
    "performanceNumbersWithoutCaveats": 16,
    "inscrutability": 17,
})


const links = [
    ["<p class='pitfalls-text'>Attributing agency to AI - describing AI systems as taking actions independent of human supervision or implying that they may soon be able to do so. </p>", "<a class='links-text' href='https://www.aimyths.org/ai-has-agency'>Agency</a>"],
    ["<p class='pitfalls-text'>Using suggestive imagery to portray AI as humanoid robots - giving readers a false impression that AI tools are embodied, even when it is just software that learns patterns from data.</p>", "<a class='links-text' href='https://betterimagesofai.org/'>Imagery</a>"],
    ["<p class='pitfalls-text'>Comparing AI with human intelligence - implying that AI algorithms learn in the same way as humans do.</p>", "<a class='links-text' href='https://thenextweb.com/news/human-intelligence-and-ai-are-vastly-different-so-lets-stop-comparing-them'>Human Intelligence</a>"],
    ["<p class='pitfalls-text'>Comparing AI capabilities with human skills - falsely implying that AI tools and humans compete on an equal footing.", "<a class='links-text' href='https://www.cs.princeton.edu/~sayashk/ai-hype/ai-reporting-pitfalls.pdf'>AI Pitfalls</a>"],
    ["<p class='pitfalls-text'>Hyperbole - describing AI systems as revolutionary or groundbreaking without concrete evidence of their performance.", "<a class='links-text' href='https://www.aimyths.org/ai-can-solve-any-problem'>What problems can AI actually solve</a>"],
    ["<p class='pitfalls-text'>Comparing AI tools with major historical transformations like the invention of electricity or the industrial revolution - potentially conveying a false sense of progress if not backed by real-world evidence.", "<a class='links-text' href='https://hdsr.mitpress.mit.edu/pub/wot7mkc1/release/9'>Historic Comparisons</a>"],
    ["<p class='pitfalls-text'>Making unjustified claims about the future progress of AI. Without evidence, these claims are mere speculation, and can give a false impression about the state of AI developments.", "<a class='links-text' href='https://www.fhi.ox.ac.uk/wp-content/uploads/FAIC.pdf'>Unjustified Claims</a>"],
    ["<p class='pitfalls-text'>Making false claims about AI - spreading misinformation and encouraging speculation.", "<a class='links-text' href='https://www.fast.ai/posts/2017-09-19-accurate-info.html'>Credible Sources</a>"],
    ["<p class='pitfalls-text'>Using sensational terms to describe banal actions - hiding how mundane the tasks are.", "<a class='links-text' href='https://medium.com/@emilymenonbender/on-nyt-magazine-on-ai-resist-the-urge-to-be-impressed-3d92fd9a0edd'>Sensational Terms</a>", "<a class='links-text' href='https://twitter.com/emilymbender/status/1571911804561035264?s=20&t=sEPBTiN2bd7qbeKJugjGIA'>Sensational Terms</a>"],
    ["<p class='pitfalls-text'>Treating key stakeholders as neutral parties. The article seems to contain mainly quotes from people who have a key interest in the success of AI, and may hence be a biased perspective.", "<a class='links-text' href='https://amp.theguardian.com/commentisfree/2019/jan/13/dont-believe-the-hype-media-are-selling-us-an-ai-fantasy'>Treating Stakeholder as Neutral</a>"],
    ["<p class='pitfalls-text'>Repeating PR statements, rather than actually describing the AI tool, which can lead to misleading wording that misrepresents the actual capabilities of a tool.", "<a class='links-text' href='https://theclick.news/churnalists-at-large/'>Repeating PR Statements</a>"],
    ["<p class='pitfalls-text'>Not discussing the limitations of AI tools, possibly resulting in a skewed view about the risks of AI.", "<a class='links-text' href='https://hackernoon.com/the-missing-pieces-6-limitations-of-ai-s85r3upr'>The Limitations of AI</a>", "<a class='links-text' href='https://www.aimyths.org/ai-can-solve-any-problem'>What problems can AI actually solve</a>"],
    ["<p class='pitfalls-text'>Downplaying to limitations of AI, possibly resulting in a skewed view about the risks of AI.", "<a class='links-text' href='https://hackernoon.com/the-missing-pieces-6-limitations-of-ai-s85r3upr'>The Limitations of AI</a>", "<a class='links-text' href='https://www.aimyths.org/ai-can-solve-any-problem'>What problems can AI actually solve</a>"],
    ["<p class='pitfalls-text'>Addressing the limitations of AI from a 'skeptics' framing.", "<a class='links-text' href='https://www.brookings.edu/research/a-guide-to-healthy-skepticism-of-artificial-intelligence-and-coronavirus/'>Why Healthy Skepticism about AI is Good</a>", "<a class='links-text' href='https://medium.com/@emilymenonbender/on-nyt-magazine-on-ai-resist-the-urge-to-be-impressed-3d92fd9a0edd#:~:text=On%20being%20placed%20into%20the%20%E2%80%9Cskeptics%E2%80%9D%20box'Skeptics Framing</a>"],
    ["<p class='pitfalls-text'>Downplaying the human labour necessary to build AI systems.", "<a class='links-text' href='https://www.noemamag.com/the-exploited-labor-behind-artificial-intelligence/'>Human Labour</a>"],
    ["<p class='pitfalls-text'>Reporting performance numbers without uncertainty estimations or caveats. There is seldom enough space in a news article to explain how performance numbers like accuracy are calculated, possibly misinforming readers, especially because AI tools are known to suffer performance degradations even under slight changes to datasets.", "<a class='links-text'href='https://points.datasociety.net/uncertainty-edd5caf8981b'>AI Uncertainty</a>"],
    ["<p class='pitfalls-text'>Describing AI as black boxes - shifting accountability for AI tools from developers to the underlying technology, ignoring a lot of research on model interpretability and explainability.", "<a class='links-text' href='https://royalsocietypublishing.org/doi/epdf/10.1098/rsta.2018.0084'>The Fallacy of Inscrutability</a>"]
]

async function getProblematicArr(str) {
    let scrape = await import("/html/js/scrape.js");
    ``
    if (str === "") return [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]
    let tags = [];

    console.log(tags)

    if (model == 0) {
        if (!baseline_arr || testButton != null) {
            if (str === null) { tags = scrape.getTokenizedPTags().concat(scrape.getTokenizedHTags()); console.log("test"); }
            else { tags = str.split(" "); }
            baseline_arr = await runClassifier(tags)
        }
        return baseline_arr
    } else {
        if (!complex_arr || testButton != null) {
            if (str === null) { tags = scrape.getHTags(); console.log("test"); }
            else { tags.push(str); console.log("TagFromString:" + tags) }
            complex_arr = await runClassifier(tags)
        }
        return complex_arr
    }
}

async function runClassifier(tags) {

    console.log("Tags: " + tags);
    let result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

    if (model == 0) { // Keyword Model
        console.log("baseline");
        let baseline = await import("/html/js/baseline.js");
        result = baseline.baseline(tags);
    } else { // AI Model
        console.log(tags)
        const promises = tags.map((headline) => {
            return fetch("https://xt0r3-ai-hype-monitor.hf.space/run/predict", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    data: [
                        headline,
                    ]
                })
            }).then((response) => {
                return response.json()
            }).then((response) => {
                console.log(response)
                const predictionArray = response.data[0].confidences;

                let predictions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

                if (!!predictionArray) {
                    for (const predKey in predictionArray) {
                        const prediction = predictionArray[predKey]
                        try {
                            predictions[OrderEnum[prediction.label]] = Math.max(predictions[OrderEnum[prediction.label]], prediction.confidence);
                        } catch (e) {
                            console.log(e);
                        }
                    }
                }

                return predictions
            })
        });

        // TODO: make sure the requests get sent on normal pages too, not only on test pages.
        // TODO: Make sure filtering works in a way we expect it to. Currently it doesn't 

        console.log(promises)

        let resultsArray = await Promise.all(promises)
        console.log(resultsArray)

        let maxResults = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        for (let j = 0; j <resultsArray.length; j++) {
            const headlineResult = resultsArray[j]
            for (let i = 0; i < headlineResult.length; i++) {
                maxResults[i] = Math.max(maxResults[i], headlineResult[i])
            }
        }

        console.log(maxResults)

        result = maxResults
        console.log("Not here")

        console.log("I am here")
        console.log(result)


    }

    return result;
}

async function forceUpdateOverlay(arr) {
    if ((arr.reduce((x, a) => x + a, 0)) > 0) {
        problematic = true
    } else {
        problematic = false
    }

    if (problematic) {
        let filtered = links.filter((e, i) => arr[i] > 0)
        let txt = ""
        let link = ""
        for (let i = 0; i < filtered.length; i++) {
            txt += filtered[i][0] + "</br>"
            for (let j = 1; j < filtered[i].length; j++) {
                link += filtered[i][j] + "</br>"
            }
        }
        document.getElementById('title').innerHTML = "This page appears to contain problematic metaphors about AI! &#128064"
        document.getElementById('pitfalls-title').innerHTML = "&#10071 Pitfalls we think it contains"
        document.getElementById('links-text').innerHTML = link
        document.getElementById('pitfalls-text').innerHTML = txt
        document.getElementById('links-title').innerHTML = "&#9989 Sources we recommend reading"
    } else {
        document.getElementById('title').innerHTML = "Nothing to report!"
        document.getElementById('pitfalls-title').innerHTML = ""
        document.getElementById('links-text').innerHTML = ""
        document.getElementById('pitfalls-text').innerHTML = ""
        document.getElementById('links-title').innerHTML = ""
    }
}

async function loadOverlay() {
    let arr;
    if (testButton != null) {
        let text = document.getElementById("text-box").value;
        arr = await getProblematicArr(text);
    } else {
        arr = await getProblematicArr(null);
    }
    // I'm (Sam) not sure if this is the best approach, we should be checking whether an individual class
    // has a greater than 0.5 chance of being true.
    await forceUpdateOverlay(arr);
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key == "model") {
            model = newValue
        } else if (key === "right") {
            card.style.right = newValue;
        } else if (key === "left") {
            card.style.left = newValue;
        } else if (key === "top") {
            card.style.top = newValue;
        } else if (key === "display") {
            content.style.display = newValue;
        }
    }
    loadOverlay()
});

let testButton = document.getElementById("test-button");
if (testButton != null) {
    fetch(chrome.runtime.getURL('/html/card.html')).then(r => r.text()).then(html => {
        document.body.insertAdjacentHTML('afterbegin', html);
        document.getElementById("collapsible").addEventListener('click', function (e) {
            const content = document.getElementById("collapsible-content");
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        })
    }).then(r => {
        chrome.storage.sync.get().then(items => {
            model = items.model
            loadOverlay()
        })
    }
    )
    testButton.addEventListener("click", async () => {
        let text = document.getElementById("text-box").value
        preScreen(text).then(foundProblematicWord => {
            if (foundProblematicWord) {
                getProblematicArr(text).then(array => {
                    forceUpdateOverlay(array);
                })
            }
        })
    });
}

/**
 * 
 * @param {The string that we are looking to find int the list of tags, e.g. 'Machine Learning'} str 
 * @param {The list of tags we are trying to search in, e.g. ['We', 'need', 'to', 'prevent', 'robot', 'uprising']} tags 
 */
function find(str, tags) {
    strParts = str.split(" ")
}

async function preScreen(str) {
    let found = false
    let tags
    let rUrl = chrome.runtime.getURL('/html/js/keywords.json');
    const res = await fetch(rUrl)
    const resp = await res.json()
    let scrape = await import("/html/js/scrape.js");
    if (str == null) {
        str = scrape.getPTagsAsString() + scrape.getHTagsAsString();
    }
    console.log(str)
    found = resp.some(r => str.includes(r))
    console.log(found)
    return found
}

preScreen().then(x => {
    if (x && testButton == null) {
        fetch(chrome.runtime.getURL('/html/card.html')).then(r => r.text()).then(html => {
            document.body.insertAdjacentHTML('afterbegin', html);

            // draggable card
            card = document.getElementById("card");
            content = document.getElementById("collapsible-content");
            document.getElementById("collapsible").onmousedown = function (e) {
                const initLeft = card.offsetLeft, initTop = card.offsetTop;  // initial card position
                document.onmousemove = function (e) {
                    // update card position
                    card.style.left = (card.offsetLeft + e.movementX) + "px";
                    card.style.top = (card.offsetTop + e.movementY) + "px";
                };
                document.onmouseup = function (e) {
                    document.onmouseup = null;
                    document.onmousemove = null;
                    // a mouse click without dragging should toggle collapsing / expanding the card content
                    if (card.offsetLeft === initLeft && card.offsetTop === initTop) {
                        // collapsible card content
                        if (content.style.display === "block") {
                            content.style.display = "none";
                        } else {
                            content.style.display = "block";
                        }
                        chrome.storage.sync.set({ "display": content.style.display });
                    } else {
                        chrome.storage.sync.set({ "left": card.offsetLeft + "px", "right": "auto", "top": card.offsetTop + "px" });
                    }
                };
            };
        }).then(r => {
            chrome.storage.sync.get().then(items => {
                model = items.model;
                card.style.top = items.top;
                card.style.left = items.left;
                card.style.right = items.right;
                content.style.display = items.display;
                loadOverlay()
            })
        }
        )
    };
})