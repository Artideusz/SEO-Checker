import { http, https } from 'follow-redirects';
import { URL } from 'url';
import * as cheerio from 'cheerio';
import { HTMLPage } from "./interfaces";

/**
 * 
 * @param url - url to request GET on.
 * @returns Content or error of the GET request
 */
export async function extractPage(url: string, statusOnly?: boolean): Promise<HTMLPage> {
    const requester = /https:\/\//.test(url) ? https : http;

    let parsedURL = new URL(url);

    let options = {
        hostname: parsedURL.hostname,
        path: parsedURL.pathname,
        method: statusOnly ? "HEAD" : "GET",
        port: parsedURL.port
    }

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
    })) as HTMLPage;

    return page;
}

export function getLinksFromString(pageContent: string, baseURI: string) {
    const $ = cheerio.load(pageContent);
    const links = $('a')
        .map(function (i, el) {
            let testedURL;
            try {
                testedURL = new URL($(el).attr('href') || '#', baseURI).href;
            } catch (e) {
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