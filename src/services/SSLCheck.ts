import {
    ServiceResult,
    ServiceSuccess,
    ServiceError,
} from "../util/interfaces";
import { SEOChecker } from "../main";
import { https } from "follow-redirects";
import * as cheerio from "cheerio";
import { getLinksFromString } from "../util/extract";
import { validateURL } from "../util/validate";

// Snippets of code snatched from https://github.com/dyaa/ssl-checker

let elementsToCheck = [
    "img",
    "iframe",
    "script",
    "object",
    "form",
    "embed",
    "video",
    "audio",
    "source",
    "param"
];

//Check these attributes for mixed content
var attributeTypes = ["src", "srcset", "href"];

async function runService(this: any, adr: string): ServiceResult {
    if (!adr) throw Error("No path specified!");
    /** This is a HTTP request checker, cannot really use on pages */

    const initialURL = /^https?:\/\//.test(adr) ? adr : `https://${adr}`;
    
    let url: URL;

    try {
        url = new URL(initialURL);
    }
    catch(e) {
        throw Error("Invalid URL!");
    }

    let visitedNodes: { [index: string]: boolean } = {};
    let queue = [];

    let result: { url: string, type?: "Success" | "Error", pages: any[] } = {
        url: adr,
        pages: []
    }

    queue.push({ url: adr });

    visitedNodes[adr] = true;

    while (queue.length != 0) {
        let currentURL: URL;

        // Raise own error if thrown
        try {
            currentURL = new URL((queue.shift() as { url: string })['url']);
        }
        catch(e) {
            throw Error("Invalid URL!");
        }
        
        if(this.config.verbose) {
            console.log(`Current Link: ${currentURL['href']}`);
            console.log(`Links left: ${queue.length}`);
        }


        await new Promise((rs,rj)=>{
            let rq = https.request(
                {
                    host: currentURL["host"],
                    path: url["pathname"],
                    agent: false,
                    method: "GET",
                    port: 443,
                    rejectUnauthorized: false,
                },
                (res) => {
                    res.setEncoding('utf8');
    
                    let page = "";
    
                    // SSL Validity
                    let validity =
                        ((res.socket as { authorized?: boolean })
                            .authorized as boolean) || false;
                    if (!validity) {
                        result.pages.push({ url: currentURL.href, message: "Invalid certificate!" });
                    }
                    // HTTPS -> HTTP Redirect
                    else if(res.responseUrl && res.responseUrl.indexOf("http:") > -1) {
                        result.pages.push({ url: currentURL.href });
                    }
    
                    // Mixed content
                    res.on("data", (chunk) => {
                        page += chunk;
                    });
                    res.on("end", () => {
                        // Fetch all images and scripts that have mixed content
                        const $ = cheerio.load(page);
    
                        let mixedContent: any[] = [];
    
                        for (let element of elementsToCheck) {
                            $(element).each((i, item) => {
                                for (let attribute of attributeTypes) {
                                    let currAttr = $(item).attr(attribute);
                                    if (
                                        currAttr &&
                                        currAttr.indexOf("http:") == 0
                                    ) {
                                        mixedContent.push({ type: element, el: $(item).text(), url: currAttr })
                                    }
                                }
                            });
                        }
                        if(mixedContent.length > 0) {
                            result.pages.push({ url: currentURL.href, message: "mixed-content", content: mixedContent })
                        }
    
                        // Search for all links to crawl to
                        let links = getLinksFromString(page || "", url['href']);
    
                        for (let i = 0; i < links.length; i += 1) {
                            // If link not visited
                            if (!visitedNodes[links[i].url]) {
                                // Safety measures
                                if (validateURL(links[i].url, url['href'])) {
                                    // Add to queue
                                    queue.push(links[i]);
                                    visitedNodes[links[i].url] = true;
                                }
                            }
                        }
                        rs();
                    });
                }
            );

            rq.on("error", (e) => {
                console.log(e.message);
                result.pages.push({ url: currentURL.href, message: "UnknownError", error: e.message });
                rs();
            });

            rq.end();
        })
    }
    if(result.pages.length > 0) {
        result['type'] = "Error";
    } else {
        result['type'] = "Success";
    }
    return <ServiceError | ServiceSuccess> result;
}
const description = `Crawls the page and checks if the SSL certificate is valid.

Parameters:
    #1 Arg - URL of the website.
`;

const Srv = SEOChecker.createService({
    name: "SSLCheck",
    runService,
    description,
});

export { Srv };
