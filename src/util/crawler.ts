import { getLinksFromString } from "./extract";
import { validateURL } from "./validate";

type obj = { [index: string]: any }

async function crawl(initialURL: string, fn: (curr: obj) => obj, cfg: obj ) {

    // Setup variables
    let visitedNodes: { [index: string]: boolean } = {};
    let queue = [];

    queue.push({
        url: initialURL,
        name: "BASE_URL",
    });

    visitedNodes[initialURL] = true;

    let count = 0;

    // Crawl the page
    while (queue.length != 0) {
        let currentURL = queue.shift() as { [index: string]: string };

        if(cfg && cfg.verbose) {
            console.log(`Current link: ${currentURL.url}`);
            console.log(`Pages crawled: ${count}`);
            console.log(`Links left: ${queue.length}`);
        }

        let page = await fn(currentURL);
        let links = getLinksFromString(page.body || "", currentURL.url);

        for (let i = 0; i < links.length; i += 1) {
            // If link not visited
            if (!visitedNodes[links[i].url]) {
                // Safety measures
                if (validateURL(links[i].url, initialURL)) {
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

export { crawl };