"use strict";

var problematic = false
var model = 0
var baseline_arr
var complex_arr
var threshold = 0.700

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
    ["Attributing agency to AI - describing AI systems as taking actions independent of human supervision or implying that they may soon be able to do so.", "<a href='https://www.aimyths.org/ai-has-agency'>Agency</a>"],
    ["Using suggestive imagery to portray AI as humanoid robots - giving readers a false impression that AI tools are embodied, even when it is just software that learns patterns from data.", "<a href='https://betterimagesofai.org/'>Imagery</a>"],
    ["Comparing AI with human intelligence - implying that AI algorithms learn in the same way as humans do.", "<a href='https://thenextweb.com/news/human-intelligence-and-ai-are-vastly-different-so-lets-stop-comparing-them'>Human Intelligence</a>"],
    ["<p>Comparing AI capabilities with human skills - falsely implying that AI tools and humans compete on an equal footing.", "<a href='https://www.cs.princeton.edu/~sayashk/ai-hype/ai-reporting-pitfalls.pdf'>AI Pitfalls</a>"],
    ["<p>Hyperbole - describing AI systems as revolutionary or groundbreaking without concrete evidence of their performance.", "<a href='https://www.aimyths.org/ai-can-solve-any-problem'>What problems can AI actually solve</a>"],
    ["<p>Comparing AI tools with major historical transformations like the invention of electricity or the industrial revolution - potentially conveying a false sense of progress if not backed by real-world evidence.", "<a href='https://hdsr.mitpress.mit.edu/pub/wot7mkc1/release/9'>Historic Comparisons</a>"],
    ["<p>Making unjustified claims about the future progress of AI. Without evidence, these claims are mere speculation, and can give a false impression about the state of AI developments.", "<a href='https://www.fhi.ox.ac.uk/wp-content/uploads/FAIC.pdf'>Unjustified Claims</a>"],
    ["<p>Making false claims about AI - spreading misinformation and encouraging speculation.", "<a href='https://www.fast.ai/posts/2017-09-19-accurate-info.html'>Credible Sources</a>"],
    ["<p>Using sensational terms to describe banal actions - hiding how mundane the tasks are.", "<a href='https://medium.com/@emilymenonbender/on-nyt-magazine-on-ai-resist-the-urge-to-be-impressed-3d92fd9a0edd'>Sensational Terms</a>", "<a href='https://twitter.com/emilymbender/status/1571911804561035264?s=20&t=sEPBTiN2bd7qbeKJugjGIA'>Sensational Terms</a>"],
    ["<p>Treating key stakeholders as neutral parties. The article seems to contain mainly quotes from people who have a key interest in the success of AI, and may hence be a biased perspective.", "<a href='https://amp.theguardian.com/commentisfree/2019/jan/13/dont-believe-the-hype-media-are-selling-us-an-ai-fantasy'>Treating Stakeholder as Neutral</a>"],
    ["<p>Repeating PR statements, rather than actually describing the AI tool, which can lead to misleading wording that misrepresents the actual capabilities of a tool.", "<a href='https://theclick.news/churnalists-at-large/'>Repeating PR Statements</a>"],
    ["<p>Not discussing the limitations of AI tools, possibly resulting in a skewed view about the risks of AI.", "<a href='https://hackernoon.com/the-missing-pieces-6-limitations-of-ai-s85r3upr'>The Limitations of AI</a>", "<a href='https://www.aimyths.org/ai-can-solve-any-problem'>What problems can AI actually solve</a>"],
    ["<p>Downplaying to limitations of AI, possibly resulting in a skewed view about the risks of AI.", "<a href='https://hackernoon.com/the-missing-pieces-6-limitations-of-ai-s85r3upr'>The Limitations of AI</a>", "<a href='https://www.aimyths.org/ai-can-solve-any-problem'>What problems can AI actually solve</a>"],
    ["<p>Addressing the limitations of AI from a 'skeptics' framing.", "<a href='https://www.brookings.edu/research/a-guide-to-healthy-skepticism-of-artificial-intelligence-and-coronavirus/'>Why Healthy Skepticism about AI is Good</a>", "<a href='https://medium.com/@emilymenonbender/on-nyt-magazine-on-ai-resist-the-urge-to-be-impressed-3d92fd9a0edd#:~:text=On%20being%20placed%20into%20the%20%E2%80%9Cskeptics%E2%80%9D%20box'Skeptics Framing</a>"],
    ["<p>Downplaying the human labour necessary to build AI systems.", "<a href='https://www.noemamag.com/the-exploited-labor-behind-artificial-intelligence/'>Human Labour</a>"],
    ["<p>Reporting performance numbers without uncertainty estimations or caveats. There is seldom enough space in a news article to explain how performance numbers like accuracy are calculated, possibly misinforming readers, especially because AI tools are known to suffer performance degradations even under slight changes to datasets.", "<a href='https://points.datasociety.net/uncertainty-edd5caf8981b'>AI Uncertainty</a>"],
    ["<p>Describing AI as black boxes - shifting accountability for AI tools from developers to the underlying technology, ignoring a lot of research on model interpretability and explainability.", "<a href='https://royalsocietypublishing.org/doi/epdf/10.1098/rsta.2018.0084'>The Fallacy of Inscrutability</a>"]
]

async function getProblematicArr(str) {
    if (model == 0) {
        if (!baseline_arr) {
            baseline_arr = await runClassifier(str)
        }
        return baseline_arr
    } else {
        if (!complex_arr) {
            complex_arr = await runClassifier(str)
        }
        return complex_arr
    }
}

async function runClassifier(str) {
    let scrape = await import("/html/js/scrape.js");
    console.log(str);
    let tags;
    if (str === null) { tags = scrape.getTokenizedPTags(); console.log("test"); }
    else { tags = str.split(" "); }
    console.log("Tags: " + tags);
    var result
    if (model == 0) { // Keyword Model
        console.log("baseline");
        let baseline = await import("/html/js/baseline.js");
        result = baseline.baseline(tags);
    } else { // AI Model
        const response = await fetch("https://xt0r3-ai-hype-monitor.hf.space/run/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: [
                    str,
                ]
            })
        });

        const respJson = await response.json();

        const predictionArray = respJson.data;

        result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        console.log(respJson)

        if (!!predictionArray) {
            console.log(predictionArray)
            for (const predKey in predictionArray) {
                const prediction = predictionArray[predKey]
                console.log(prediction)
                try {
                    result[OrderEnum[prediction.label]] = prediction.confidences[0].confidence;
                } catch (e) {
                    console.log(e);
                }
            }
        }


        // for (const prediction in respJson.data[0]) {
        // try {
        // console.log(result)
        // console.log(prediction)
        // console.log(respJson.data[0])
        // console.log(prediction.label)
        // console.log(OrderEnum[prediction.label])
        // result[OrderEnum[prediction.label]] = prediction.confidences[0].confidence;
        // } catch (e) {
        // console.log(e);
        // }
        // }

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
        var filtered = links.filter((e, i) => arr[i] > 0)
        var txt = ""
        var link = ""
        for (var i = 0; i < filtered.length; i++) {
            txt += filtered[i][0] + "</br>"
            for (var j = 1; j < filtered[i].length; j++) {
                link += filtered[i][j] + "</br>"
            }
        }
        document.getElementById('title').innerHTML = "This page appears to contain problematic metaphors about AI! &#128064"
        document.getElementById('pitfalls-title').innerHTML = "&#10071 Pitfalls we think it contains"
        document.getElementById('links-text').innerHTML = link
        document.getElementById('pitfalls-text').innerHTML = txt
        document.getElementById('links-title').innerHTML = "&#9989 Sources we recommend reading"

        // collapsible card content
        document.getElementById("collapsible").addEventListener('click', function (e) {
            const content = document.getElementById("collapsible-content");
            if (content.style.display === "block") {
                content.style.display = "none";
            } else {
                content.style.display = "block";
            }
        })
    } else {
        document.getElementById('title').innerHTML = "Nothing to report!"
        document.getElementById('pitfalls-title').innerHTML = ""
        document.getElementById('links-text').innerHTML = ""
        document.getElementById('pitfalls-text').innerHTML = ""
        document.getElementById('links-title').innerHTML = ""
    }
}

async function loadOverlay() {
    var arr = await getProblematicArr(null);
    // I'm (Sam) not sure if this is the best approach, we should be checking whether an individual class
    // has a greater than 0.5 chance of being true.
    await forceUpdateOverlay(arr);
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    console.log(Object.entries(changes))
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key == "model") {
            model = newValue
            loadOverlay()
        }
    }
});

let testButton = document.getElementById("test-button");
if (testButton != null) {
    testButton.addEventListener("click", async () => {
        let text = document.getElementById("text-box").value;
        console.log("Text: " + text);
        let array = await runClassifier(text);
        forceUpdateOverlay(array);
    });
}


fetch(chrome.runtime.getURL('/html/card.html')).then(r => r.text()).then(html => {
    document.body.insertAdjacentHTML('afterbegin', html);
}).then(r => {
    chrome.storage.sync.get().then(items => {
        model = items.model
        loadOverlay()
    })
}
);