"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const ssh2_1 = require("ssh2");
async function runService(ip, log, pwd, port) {
    if (!ip || !log || !pwd) {
        throw Error("Empty field!");
    }
    return new Promise((res, rej) => {
        const conn = new ssh2_1.Client();
        conn.on("ready", () => {
            conn.end();
            res({
                url: ip,
                type: "Success"
            });
        }).connect({
            host: ip,
            username: log,
            password: pwd,
            port: port || 22
        });
        conn.on("error", err => {
            res({
                url: ip,
                type: "Error",
                errorMessage: err.message
            });
        });
    });
}
const description = `Checks if SSH credentials are valid.

Parameters:
    #1 Arg - IP of the machine.
    #2 Arg - Username.
    #3 Arg - Password.
    #4 Arg - Port. (OPTIONAL)
`;
const Srv = main_1.SEOChecker.createService({
    name: "SSHCheck",
    runService,
    description,
});
exports.Srv = Srv;
