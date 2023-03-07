"use strict";

export async function startQuery(headlines, problemPredictions, problematicHeadlines) {
    if (headlines.length) {
        await processFirst(headlines, problemPredictions, problematicHeadlines)
    }
}

async function processFirst(headlines, problemPredictions, problematicHeadlines) {
    const firstHeadline = headlines.splice(0, 1)
    if (firstHeadline.length == 0) {
        return
    }

    const headline = firstHeadline[0]

    // Try asking for the resource
    let req = null
    let retries = 3
    do {
        req = await fetch("https://xt0r3-ai-hype-monitor.hf.space/run/predict", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                data: [
                    headline,
                ]
            })
        });
        // On timeout wait for a random amount of time that increases on repeated failures
        await new Promise(resolve => setTimeout(resolve, Math.random() * 3000 * (3 - retries)))
        retries--;
    } while (!req.ok && retries > 0)

    if (headlines.length) {
        startQuery(headlines, problemPredictions, problematicHeadlines)
    }

    const response = await req.json();
    const predictionArray = response.data[0].confidences;
    const predictions = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0];
    if (!!predictionArray) {
        let isProblematic = false;

        // This is done using for loops, because otherwise asynchronous accesses to predictions might cause
        // instances writing over each other.
        for (const predKey in predictionArray) {
            const prediction = predictionArray[predKey];
            try {
                const index = OrderEnum[prediction.label];
                predictions[index] = Math.max(predictions[index], prediction.confidence);
                if (predictions[index] > 0.5) {
                    isProblematic = true;
                }
            } catch (e) {
                console.log(e);
            }
        }

        if (isProblematic) {
            problematicHeadlines.pushWithUpdate(headline);
            console.log("Problematic headline found: [" + headline + "]")
        }

        for (let i = 0; i < predictions.length; i++) {
            problemPredictions[i] = Math.max(problemPredictions[i], predictions[i])
        }
    }
}