"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const main_1 = require("../main");
const puppeteer_1 = require("puppeteer");
async function runService(adr, log, pwd) {
    if (!adr)
        throw Error("No path specified!");
    else if (!log || !pwd)
        throw Error("Empty field in credentials!");
    const initialURL = /^https?:\/\//.test(adr) ? adr : `https://${adr}`;
    let loggedin;
    let browser = await puppeteer_1.launch({ headless: true });
    let page = await browser.newPage();
    await page.goto(initialURL, { waitUntil: "networkidle0" });
    try {
        await new Promise((res, rej) => {
            setTimeout(res, 1000);
        });
        await page.evaluate((log, pwd) => {
            document.querySelector("#user_login").value = log;
            document.querySelector("#user_pass").value = pwd;
            document.querySelector("#wp-submit").click();
        }, log, pwd);
        await page.waitForNavigation({ waitUntil: "networkidle0" });
        loggedin = !!await page.$("#adminmenumain");
    }
    catch (e) {
        console.log(e.message);
    }
    await browser.close();
    if (loggedin) {
        return {
            url: adr,
            type: "Success",
        };
    }
    else {
        return {
            url: adr,
            type: "Error",
            errorMessage: "Not logged in!",
        };
    }
}
const description = `Checks if the WP CMS credentials are working.

Parameters:
    #1 Arg - The wp-admin page of the site.
    #2 Arg - Username.
    #3 Arg - Password.
`;
const Srv = main_1.SEOChecker.createService({
    name: "WPCheck",
    runService,
    description,
});
exports.Srv = Srv;
