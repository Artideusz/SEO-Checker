"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extract_1 = require("../util/extract");
const validate_1 = require("../util/validate");
const main_1 = require("../main");
async function runService(adr, dest) {
    if (!adr || !dest)
        throw Error('No path specified!');
    const initialURL = /^https?:\/\//.test(adr) ? adr : `http://${adr}`;
    /** Traverse the page */
    let visitedNodes = {};
    let queue = [];
    queue.push({
        url: initialURL,
        name: "BASE_URL",
        route: [initialURL]
    });
    visitedNodes[adr] = true;
    let count = 0;
    while (queue.length != 0) {
        let currentURL = queue.shift();
        if (this.config.verbose) {
            console.log(`Current link: ${currentURL.url}`);
            console.log(`Pages crawled: ${count}`);
            console.log(`Links left: ${queue.length}`);
        }
        let page = await extract_1.extractPage(currentURL.url);
        if (page.body) {
            let links = extract_1.getLinksFromString(page.body, adr);
            for (let i = 0; i < links.length; i += 1) {
                // If link not visited
                if (!visitedNodes[links[i].url]) {
                    // Safety measures
                    if (links[i].url === dest) {
                        return {
                            url: dest,
                            type: "Success",
                            innerContent: links[i].name,
                            source: currentURL.url,
                            route: [...currentURL['route'], links[i].url]
                        };
                    }
                    else if (validate_1.validateURL(links[i].url, adr)) {
                        // Add to queue and append to current route
                        links[i]['route'] = [...currentURL['route'], links[i].url];
                        queue.push(links[i]);
                        visitedNodes[links[i].url] = true;
                    }
                }
            }
        }
        count++;
    }
    return {
        url: dest,
        type: "Error",
        errorMessage: "URL not found!"
    };
}
const description = `Searches for a link and outputs the source URL that the link originates from and other additional information.

Parameters:
    #1 Arg - The source URL (The URL we are starting from).
    #2 Arg - The destination URL (The URL we are looking for on the page).
    #n Arg - Additional options
        verbose - Outputs additional information about the scan.
`;
const Srv = main_1.SEOChecker.createService({
    name: "findLinkSrc",
    runService: runService,
    description: description
});
exports.Srv = Srv;
