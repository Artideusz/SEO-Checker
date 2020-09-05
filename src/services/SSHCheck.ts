import { ServiceResult } from "../util/interfaces";
import { SEOChecker } from "../main";
import { Client } from "ssh2";

async function runService(
    this: any,
    ip: string,
    log: string,
    pwd: string,
    port?: number
): ServiceResult {
    if (!ip || !log || !pwd) {
        throw Error("Empty field!");
    }
    return new Promise((res, rej) => {
        const conn = new Client();

        conn.on("ready", () => {
            conn.end();
            res({
                url: ip,
                type: "Success"
            })
        }).connect({
            host: ip,
            username: log,
            password: pwd,
            port: port || 22
        })
        conn.on("error", err => {
            res({
                url: ip,
                type:"Error",
                errorMessage: err.message
            })
        })
    });
}

const description = `Checks if SSH credentials are valid.

Parameters:
    #1 Arg - IP of the machine.
    #2 Arg - Username.
    #3 Arg - Password.
    #4 Arg - Port. (OPTIONAL)
`;

const Srv = SEOChecker.createService({
    name: "SSHCheck",
    runService,
    description,
});

export { Srv };
