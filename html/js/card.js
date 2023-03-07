"use strict";

let problematic = false
let model = 0
let complex_arr
let threshold = 0.700
let card = null;
let content = null;

/**
 * Helper class to load the keywords form `keywords.json`.
 * This avoids the overhead of having to load them at every call of updateOverlay
 * `Keywords.keywords` contains a list of regular expressions corresponding to the keywords we want to use
 */
class Keywords {
    static keywords = null

    /**
     * Helper function for pre-screening an entire page of content
     * @param {The content of the page we want to pre screen} pageContent 
     * @returns 
     */
    static testEntirePage(pageContent) {
        if (!(typeof pageContent === 'string' || pageContent instanceof String)) {
            return false
        }

        // This is a bunch of reads in parallel, so there are no races
        return pageContent.includes("AI") || this.keywords.some(keyword => pageContent.includes(keyword))
    }

    /**
     * Tester code that makes sure that the string we are testing is actually a string
     * and then tests it against the strings and regular expressions loaded from `keywords.json`
     * @param {The string to be tested} str 
     * @returns 
     */
    static test(line) {
        if (!(typeof line === 'string' || line instanceof string)) {
            return false
        }

        // This is probably not a headline. It's too short
        if (line.length < 20) {
            return false
        }

        // This a link, not a headline
        if (line.startsWith('http') || line.startsWith('www.')) {
            return false
        }

        // This headline is way too long. We probably didn't want to pick it up
        if (line.length > 500) {
            return false
        }

        // Otherwise, we check everything using the fine-grained approach
        // (This is a bunch of reads in parallel, so there are no races)
        return this.keywords.some(keyword => line.includes(keyword)) || this.regexp.some(r => r.test(line))
    }

    static async init() {
        if (this.keywords == null) {
            let rUrl = chrome.runtime.getURL('/html/js/keywords.json');
            let resp = await fetch(rUrl)
            const respJson = await resp.json()
            this.keywords = respJson["string"]
            this.regexp = respJson["regexp"].map(x => new RegExp(x))
        }
    }

    static get = function () {
        return this.regexp
    }


    /**
     * Helper function to allow filtering of arrays using async callbacks
     * The result is the same as expected from arr.filter(await f), except that 
     * the above syntax is not supported
     * @param {The array we want to filter} arr 
     * @param {The async callback we want to use} callback 
     * @returns 
     */
    static async filterAsync(arr, callback) {
        const fail = Symbol()
        return (await Promise.all(arr.map(async item => (await callback(item)) ? item : fail))).filter(i => i !== fail)
    }

    static async filter(tags) {
        return await this.filterAsync(tags, async (tag) => { return await Keywords.test(tag) })
    }
}

/**
 * Helper class to load the scraper form `scraper.json`.
 * static avoids the overhead of having to load it again at every call of getProblematicArr
 */
class Scraper {
    static scraper = null
    static headlineTags = []
    static articleTags = []
    static allTags = []

    static async init() {
        this.headlineTags = []
        this.articleTags = []
        this.allTags = []

        if (!!testButton) {
            const text = document.getElementById("text-box").value;
            if (!Keywords.test(text)) {
                return
            }
            this.allTags.push(text)
            this.headlineTags.push(text)
            return
        }

        if (this.scraper == null) {
            this.scraper = await import("/html/js/scrape.js");
        }

        // Filter for only headlines containing the keywords we need
        this.headlineTags = await Keywords.filter([... new Set(this.scraper.getImportantLines().map(line => Scraper.get().clean(line)))])

        // Doing filtering of articles in multiple steps,
        // as otherwise the process took too long and the site froze. 
        // Step 1: Get the lines beyond the headlines
        const articleTagsNoLines = await Keywords.filter([...new Set(this.scraper.getTags(["p", "div"]).map(tag => Scraper.get().clean(tag)))])
        // Step 2: Separate the lines
        const articleLines = await Keywords.filter(articleTagsNoLines.map(element => element.split('\n')).flat(1))
        // Step 3: Separate obvious sentences
        this.articleTags = await Keywords.filter(articleLines.map(line => line.split(/\.\?!/)).flat(1))

        // Create all tags by joining headlines and articles
        this.allTags = this.headlineTags.concat(this.articleTags)
    }

    static get = function () {
        return this.scraper
    }

}

/**
 * Helper class to load the baseline form `baseline.json`.
 * static avoids the overhead of having to load it again at every call of getProblematicArr
 */
class Baseline {
    static model = null
    static problemPredictions = null

    static async init() {
        if (this.model == null) {
            this.model = await import("/html/js/baseline.js");
        }
    }

    static get() {
        return this.model
    }

    static async runClassifier(tags) {
        let result = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        if (tags.length == 0) {
            return result
        }

        result = this.model.baseline(tags);

        return result
    }
}

/**
 * Helper class to run the complex model
 */
class Complex {
    static problemPredictions = null
    static problematicHeadlines = []
    static model = null

    static async init() {
        if (this.model == null) {
            this.model = await import("/html/js/complex.js");
        }

        var addUpdateHook = function (arr) {
            arr.pushWithUpdate = function (e) {
                Array.prototype.push.call(arr, e);
                forceUpdateOverlay(this.problemPredictions);
            };
        };
        addUpdateHook(this.problematicHeadlines)
    }

    static async runClassifier(tags) {

        // Set the problem predictions to non-null empty value and incrementally update it
        this.problemPredictions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]

        if (tags.length == 0) {
            return this.problemPredictions
        }

        // We also save all headlines that are problematic for future use
        // Run the queries with at most 8 active queries at a time
        const MAX_WORKERS = 8
        for (let i = 0; i < MAX_WORKERS && tags.length; i++) {
            this.model.startQuery(tags, this.problemPredictions, this.problematicHeadlines)
        }

        return this.problemPredictions
    }

    static get() {
        return this.model
    }
}

const ModelEnum = Object.freeze({
    "Baseline": 0,
    "Complex": 1,
})

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
    ["<p class='alpha-reset pitfalls-text'><b>Attributing agency to AI</b> - describing AI systems as taking actions independent of human supervision or implying that they may soon be able to do so. </p>", "<a class='links-text' href='https://www.aimyths.org/ai-has-agency'>Agency</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Using suggestive imagery to portray AI as humanoid robots</b> - giving readers a false impression that AI tools are embodied, even when it is just software that learns patterns from data.</p>", "<a class='links-text' href='https://betterimagesofai.org/'>Imagery</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Comparing AI with human intelligence</b> - implying that AI algorithms learn in the same way as humans do.</p>", "<a class='links-text' href='https://thenextweb.com/news/human-intelligence-and-ai-are-vastly-different-so-lets-stop-comparing-them'>Human Intelligence</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Comparing AI capabilities with human skills</b> - falsely implying that AI tools and humans compete on an equal footing.</p>", "<a class='links-text' href='https://www.cs.princeton.edu/~sayashk/ai-hype/ai-reporting-pitfalls.pdf'>AI Pitfalls</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Hyperbole</b> - describing AI systems as revolutionary or groundbreaking without concrete evidence of their performance.</p>", "<a class='links-text' href='https://www.aimyths.org/ai-can-solve-any-problem'>What problems can AI actually solve</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Comparing AI tools with major historical transformations like the invention of electricity or the industrial revolution</b> - potentially conveying a false sense of progress if not backed by real-world evidence.</p>", "<a class='links-text' href='https://hdsr.mitpress.mit.edu/pub/wot7mkc1/release/9'>Historic Comparisons</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Making unjustified claims about the future progress of AI. Without evidence, these claims are mere speculation, and can give a false impression about the state of AI developments.</p>", "<a class='links-text' href='https://www.fhi.ox.ac.uk/wp-content/uploads/FAIC.pdf'>Unjustified Claims</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Making false claims about AI</b> - spreading misinformation and encouraging speculation.</p>", "<a class='links-text' href='https://www.fast.ai/posts/2017-09-19-accurate-info.html'>Credible Sources</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Using sensational terms to describe banal actions</b> - hiding how mundane the tasks are.</p>", "<a class='links-text' href='https://medium.com/@emilymenonbender/on-nyt-magazine-on-ai-resist-the-urge-to-be-impressed-3d92fd9a0edd'>Sensational Terms</a>", "<a class='links-text' href='https://twitter.com/emilymbender/status/1571911804561035264?s=20&t=sEPBTiN2bd7qbeKJugjGIA'>Sensational Terms</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Treating key stakeholders as neutral parties.</b> The article seems to contain mainly quotes from people who have a key interest in the success of AI, and may hence be a biased perspective.</p>", "<a class='links-text' href='https://amp.theguardian.com/commentisfree/2019/jan/13/dont-believe-the-hype-media-are-selling-us-an-ai-fantasy'>Treating Stakeholder as Neutral</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Repeating PR statements, rather than actually describing the AI tool</b>, which can lead to misleading wording that misrepresents the actual capabilities of a tool.</p>", "<a class='links-text' href='https://theclick.news/churnalists-at-large/'>Repeating PR Statements</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Not discussing the limitations of AI tools</b>, possibly resulting in a skewed view about the risks of AI.</p>", "<a class='links-text' href='https://hackernoon.com/the-missing-pieces-6-limitations-of-ai-s85r3upr'>The Limitations of AI</a>", "<a class='links-text' href='https://www.aimyths.org/ai-can-solve-any-problem'>What problems can AI actually solve</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Downplaying to limitations of AI</b>, possibly resulting in a skewed view about the risks of AI.</p>", "<a class='links-text' href='https://hackernoon.com/the-missing-pieces-6-limitations-of-ai-s85r3upr'>The Limitations of AI</a>", "<a class='links-text' href='https://www.aimyths.org/ai-can-solve-any-problem'>What problems can AI actually solve</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Addressing the limitations of AI from a 'skeptics' framing.</b></p>", "<a class='links-text' href='https://www.brookings.edu/research/a-guide-to-healthy-skepticism-of-artificial-intelligence-and-coronavirus/'>Why Healthy Skepticism about AI is Good</a>", "<a class='links-text' href='https://medium.com/@emilymenonbender/on-nyt-magazine-on-ai-resist-the-urge-to-be-impressed-3d92fd9a0edd#:~:text=On%20being%20placed%20into%20the%20%E2%80%9Cskeptics%E2%80%9D%20box'Skeptics Framing</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Downplaying the human labour necessary to build AI systems.</b></p>", "<a class='links-text' href='https://www.noemamag.com/the-exploited-labor-behind-artificial-intelligence/'>Human Labour</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Reporting performance numbers without uncertainty estimations or caveats.</b> There is seldom enough space in a news article to explain how performance numbers like accuracy are calculated, possibly misinforming readers, especially because AI tools are known to suffer performance degradations even under slight changes to datasets.</p>", "<a class='links-text'href='https://points.datasociety.net/uncertainty-edd5caf8981b'>AI Uncertainty</a>"],
    ["<p class='alpha-reset pitfalls-text'><b>Describing AI as black boxes</b> - shifting accountability for AI tools from developers to the underlying technology, ignoring a lot of research on model interpretability and explainability.</p>", "<a class='links-text' href='https://royalsocietypublishing.org/doi/epdf/10.1098/rsta.2018.0084'>The Fallacy of Inscrutability</a>"]
]


async function getProblematicArr() {
    if (model == ModelEnum.Baseline) {
        if (!Baseline.problemPredictions || testButton != null) {
            // Tokenize all tags
            const tokens = Scraper.allTags.map(tag => tag.split(' ')).flat(1)
            // Run classifier
            console.log("Running baseline model on filtered tags\n" + JSON.stringify(Scraper.allTags, null, '\t'))
            Baseline.problemPredictions = await Baseline.runClassifier(tokens)
        }
        return Baseline.problemPredictions
    } else {
        if (!Complex.problemPredictions || testButton != null) {
            console.log("Running complex model on filtered tags\n" + JSON.stringify(Scraper.headlineTags, null, '\t'))
            Complex.problemPredictions = await Complex.runClassifier(Scraper.headlineTags)
        }
        return Complex.problemPredictions
    }
}

async function forceUpdateOverlay(arrayOverride) {
    let arr = []

    if (typeof arrayOverride === "undefined") {
        arr = await getProblematicArr()
    } else {
        arr = arrayOverride
    }

    let problematic = false
    let filtered = [];
    for (let i = 0; i < arr.length; i++) {
        if (arr[i] > 0.5) {
            problematic = true
            filtered.push([links[i], arr[i]])
        }
    }

    if (problematic) {
        let txt = ""
        let suggestedLinks = []
        for (let i = 0; i < filtered.length; i++) {
            txt += filtered[i][0][0] + (model == ModelEnum.Complex ? "<p class='alpha-reset pitfalls-text'> Probability: " + filtered[i][1] + "%</p>" : "") + "<br><br>"
            for (let j = 1; j < filtered[i][0].length; j++) {
                suggestedLinks.push(filtered[i][0][j])
            }
        }
        suggestedLinks = [... new Set(suggestedLinks)]  // make sure that every link is shown exactly once

        document.getElementById('title').innerHTML = "This page appears to contain problematic metaphors about AI! &#128064"
        document.getElementById('pitfalls-title').innerHTML = "&#10071 Pitfalls we think it contains"
        document.getElementById('links-text').innerHTML = suggestedLinks.join("<br><br>")
        document.getElementById('pitfalls-text').innerHTML = txt
        document.getElementById('links-title').innerHTML = "&#9989 Sources we recommend reading"
    } else {
        if (model == ModelEnum.Baseline) {
            document.getElementById('title').innerHTML = "Nothing to report!"
        }
        else {
            document.getElementById('title').innerHTML = "Processing website... No issues found so far."
        }
        document.getElementById('pitfalls-title').innerHTML = ""
        document.getElementById('links-text').innerHTML = ""
        document.getElementById('pitfalls-text').innerHTML = ""
        document.getElementById('links-title').innerHTML = ""
    }
}

chrome.storage.onChanged.addListener((changes, namespace) => {
    for (let [key, { oldValue, newValue }] of Object.entries(changes)) {
        if (key == "model") {
            if (model != newValue) {
                // Change model and refresh the page
                model = newValue
                forceUpdateOverlay()
            }
        } else if (key === "right") {
            card.style.right = newValue;
        } else if (key === "left") {
            card.style.left = newValue;
        } else if (key === "top") {
            card.style.top = newValue;
        } else if (key === "content-display") {
            content.style.display = newValue;
        } else if (key === "card-display") {
            card.style.display = newValue;
        }
    }
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
            forceUpdateOverlay()
        })
    }
    )
    testButton.addEventListener("click", async () => {
        await Scraper.init()
        forceUpdateOverlay()
    });
}

// Do the imports and then run the program
Keywords.init()
    .then(_ => {
        Promise.all([
            Scraper.init(),
            Baseline.init(),
            Complex.init(),
        ])
    }).then(_ => {
        // Guardian pattern is nicer here, as we don't have an else block
        if (!!testButton) {
            return
        }
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
                        chrome.storage.sync.set({ "content-display": content.style.display });
                    } else {
                        chrome.storage.sync.set({ "left": card.offsetLeft + "px", "right": "auto", "top": card.offsetTop + "px" });
                    }
                };
            };
            // remove the card on click of the close button
            document.getElementById("close").onclick = function (e) {
                card.style.display = "none";
                chrome.storage.sync.set({ "card-display": "none" });
            }
        }).then(r => {
            chrome.storage.sync.get().then(items => {
                model = items.model;
                card.style.top = items.top;
                card.style.left = items.left;
                card.style.right = items.right;
                content.style.display = items["content-display"];
                // always redisplay card on page refresh, so do not sync card.style.display with storage here
                forceUpdateOverlay()
            })
        })
    })