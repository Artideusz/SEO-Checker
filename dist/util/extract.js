"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const follow_redirects_1 = require("follow-redirects");
const url_1 = require("url");
const cheerio = require("cheerio");
/**
 *
 * @param url - url to request GET on.
 * @returns Content or error of the GET request
 */
async function extractPage(url, statusOnly) {
    const requester = /https:\/\//.test(url) ? follow_redirects_1.https : follow_redirects_1.http;
    let parsedURL = new url_1.URL(url);
    let options = {
        hostname: parsedURL.hostname,
        path: parsedURL.pathname,
        method: statusOnly ? "HEAD" : "GET",
        port: parsedURL.port
    };
    const page = (await new Promise((res) => {
        const req = requester.request(options, (resp) => {
            resp.setEncoding('utf8');
            let rawData = '';
            resp.on('data', (chunk) => {
                rawData += chunk;
            });
            resp.on('end', () => {
                res({
                    url: resp.responseUrl,
                    body: rawData,
                    statusCode: resp.statusCode,
                    statusMessage: resp.statusMessage
                });
            });
        });
        req.end();
        req.on('error', (e) => {
            res({
                url,
                errorMessage: e.message,
            });
        });
    }));
    return page;
}
exports.extractPage = extractPage;
function getLinksFromString(pageContent, baseURI) {
    const $ = cheerio.load(pageContent);
    const links = $('a')
        .map(function (i, el) {
        let testedURL;
        try {
            testedURL = new url_1.URL($(el).attr('href') || '#', baseURI).href;
        }
        catch (e) {
            testedURL = $(el).attr('href');
        }
        return {
            url: testedURL,
            name: $(el)
                .text()
                .replace(/[\t\n]|\s{2,}/gi, ''),
        };
    })
        .get();
    return links;
}
exports.getLinksFromString = getLinksFromString;
