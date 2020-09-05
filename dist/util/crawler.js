"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extract_1 = require("./extract");
const validate_1 = require("./validate");
async function crawl(initialURL, fn, cfg) {
    // Setup variables
    let visitedNodes = {};
    let queue = [];
    queue.push({
        url: initialURL,
        name: "BASE_URL",
    });
    visitedNodes[initialURL] = true;
    let count = 0;
    // Crawl the page
    while (queue.length != 0) {
        let currentURL = queue.shift();
        if (cfg && cfg.verbose) {
            console.log(`Current link: ${currentURL.url}`);
            console.log(`Pages crawled: ${count}`);
            console.log(`Links left: ${queue.length}`);
        }
        let page = await fn(currentURL);
        let links = extract_1.getLinksFromString(page.body || "", currentURL.url);
        for (let i = 0; i < links.length; i += 1) {
            // If link not visited
            if (!visitedNodes[links[i].url]) {
                // Safety measures
                if (validate_1.validateURL(links[i].url, initialURL)) {
                    // Add to queue
                    links[i]['source'] = currentURL.url;
                    queue.push(links[i]);
                    visitedNodes[links[i].url] = true;
                }
            }
        }
        count++;
    }
    // Return the count of the crawled pages
    return count;
}
exports.crawl = crawl;
