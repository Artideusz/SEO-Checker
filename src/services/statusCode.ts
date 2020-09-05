import { http, https } from 'follow-redirects';
import { ServiceResult, ServiceError, ServiceSuccess} from '../util/interfaces';
import { SEOChecker } from '../main';

async function runService(adr: string): ServiceResult {
    if (!adr) throw Error('No path specified!');
    /** This is a HTTP request checker, cannot really use on pages */
    const requester = /^https:/.test(adr) ? https : http;

    const url = /^https?:\/\//.test(adr) ? adr : `http://${adr}`;

    let start = Date.now();
    
    const result = <ServiceSuccess | ServiceError | void> (await new Promise((rs) => {
        let parsedURL;
        try {
            parsedURL = new URL(url);
        } catch (error) {
            return rs({
                url,
                type:"Error",
                errorMessage: "The URL is invalid"
            })
        }

        let options = {
            hostname: parsedURL.hostname,
            path: parsedURL.pathname + parsedURL.search,
            method: "HEAD",
        }

        const req = requester.request(options, (res) => {
            rs({
                url: res.responseUrl,
                type:"Success",
                status: res.statusCode,
                statusMsg: res.statusMessage,
                responseTime: Date.now() - start
            });
        });

        req.end();

        req.on("socket", socket => {
            socket.setTimeout(10000);
            // Return timeout status
            socket.on("timeout", () => {
                req.abort();
                rs({
                    url,
                    type:"Success",
                    status: 522,
                    statusMsg: `Connection timed out`
                })
            })
        })

        req.on('error', (e) => {
            // SSL errors or some stuff
            rs({
                url,
                type: "Error",
                errorMessage: e.message,
            });
        });
    }));

    return result;
}

const description = 
`Outputs HTTP status codes of a page.

Parameters:
    #1 Arg - The URL of the page we want the status code from.
`

const Srv = SEOChecker.createService({
    name: "statusCode",
    runService: runService,
    description: description
});



export { Srv };
