"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const net = require("net");
async function runService(ip, log, pwd, port) {
    if (!ip || !log || !pwd) {
        throw Error("Empty field!");
    }
    return new Promise((res, rej) => {
        let started = false;
        let client = net.createConnection({
            host: ip,
            port: port || 21
        }, () => {
            if (this.config && this.config.verbose) {
                console.log("Connected to TCP Server, checking type...");
            }
            setTimeout(() => {
                if (!started) {
                    res({
                        url: ip,
                        type: "Error",
                        errorMessage: "Not an FTP Server!"
                    });
                    client.end();
                }
            }, 1000);
        });
        client.on("data", data => {
            let hr = data.toString().match(/^\d{3,}/gi);
            if (hr) {
                switch (hr[0]) {
                    case "220":
                        if (this.config && this.config.verbose) {
                            console.log("Type is FTP Server!");
                            console.log("Sending USER packet...");
                        }
                        client.write(`USER ${log}\r\n`);
                        started = true;
                        break;
                    case "331":
                        if (this.config && this.config.verbose) {
                            console.log("USER packet is sent and recieved!");
                            console.log("Sending PASS Packet...");
                        }
                        client.write(`PASS ${pwd}\r\n`);
                        break;
                    case "530":
                        client.end();
                        res({
                            url: ip,
                            type: "Error",
                            errorMessage: "Invalid Credentials!"
                        });
                        break;
                    case "230":
                        client.end();
                        res({
                            url: ip,
                            type: "Success",
                            errorMessage: "Correct credentials!"
                        });
                        break;
                    default:
                        if (this.config && this.config.verbose) {
                            console.log("DEFAULT:", data.toString());
                        }
                        break;
                }
            }
            else {
                console.error(data.toString());
                res({
                    url: ip,
                    type: "Error",
                    errorMessage: "Something went wrong!"
                });
            }
        });
        client.on("error", e => {
            console.log("Client Error!:", e);
            client.end();
        });
    });
}
const description = `Checks if the WP CMS credentials are working.

Parameters:
    #1 Arg - IP of FTP server.
    #2 Arg - Username.
    #3 Arg - Password.
    #4 Arg - Port (OPTIONAL)
`;
const Srv = main_1.SEOChecker.createService({
    name: "FTPCheck",
    runService,
    description
});
exports.Srv = Srv;
