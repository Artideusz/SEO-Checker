import { extractPage, getLinksFromString } from "../util/extract";
import { SEOChecker } from "../main";
import { ServiceResult } from "../util/interfaces";
import { crawl } from "../util/crawler";

async function runService(this: any, adr: string): ServiceResult {
    if (!adr) throw Error("No path specified!");

    const initialURL = /^https?:\/\//.test(adr) ? adr : `http://${adr}`;
    /** Traverse the page */

    let result: { [index: string]: any } = {
        url: adr,
        broken: [] as any[]
    }

    let count = await crawl(initialURL, async (currentURL) => {
        let page = await extractPage(
            currentURL.url,
            /\.(jpg|png|webp|bmp|jpeg|pdf|docx)$/.test(currentURL.url));

        if (page.errorMessage) {
            result.broken.push({
                url: page.url,
                name: currentURL.name,
                errorMessage: page.errorMessage,
                source: currentURL.source
            });
        } else if (
            page.statusCode &&
            page.statusCode >= 400
        ) {
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

    if(result['broken'].length > 0) {
        result['type'] = "Error";
    } else {
        result['type'] = "Success";
    }

    return <ServiceResult> result;
}

const description = 
`Searches for dead links on the whole page.

Parameters:
    #1 Arg - The source URL (The URL we are starting from).
    #n Arg - Additional options
        verbose - Outputs additional information about the scan.
`

const Srv = SEOChecker.createService({
    name: "deadLinkCheck",
    runService: runService,
    description: description
});


export { Srv };
