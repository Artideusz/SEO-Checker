"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const extract_1 = require("../util/extract");
const main_1 = require("../main");
const crawler_1 = require("../util/crawler");
async function runService(adr) {
    if (!adr)
        throw Error("No path specified!");
    const initialURL = /^https?:\/\//.test(adr) ? adr : `http://${adr}`;
    /** Traverse the page */
    let result = {
        url: adr,
        broken: []
    };
    let count = await crawler_1.crawl(initialURL, async (currentURL) => {
        let page = await extract_1.extractPage(currentURL.url, /\.(jpg|png|webp|bmp|jpeg|pdf|docx)$/.test(currentURL.url));
        if (page.errorMessage) {
            result.broken.push({
                url: page.url,
                name: currentURL.name,
                errorMessage: page.errorMessage,
                source: currentURL.source
            });
        }
        else if (page.statusCode &&
            page.statusCode >= 400) {
            result.broken.push({
                url: page.url,
                name: currentURL.name,
                errorMessage: `${page.statusCode} ${page.statusMessage}`,
                source: currentURL.source
            });
        }
        return page;
    }, this.config);
    result['count'] = count;
    if (result['broken'].length > 0) {
        result['type'] = "Error";
    }
    else {
        result['type'] = "Success";
    }
    return result;
}
const description = `Searches for dead links on the whole page.

Parameters:
    #1 Arg - The source URL (The URL we are starting from).
    #n Arg - Additional options
        verbose - Outputs additional information about the scan.
`;
const Srv = main_1.SEOChecker.createService({
    name: "deadLinkCheck",
    runService: runService,
    description: description
});
exports.Srv = Srv;
