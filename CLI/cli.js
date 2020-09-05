const yargs = require("yargs");
const chalk = require("chalk");
const readline = require("readline");
const banner = require("./banner");
const commands = require("./commands");
const getServices = require("./services");
const fs = require("fs").promises;


let args = yargs
    .option('debug', {
        demandOption: false,
        default: false,
        describe: "Toggles debug mode",
        type:"boolean"
    })
    .option('customscan', {
        demandOption: false,
        default: "",
        describe: "Runs a full scan (FTP, SSH, Dead Links, SSL, Wordpress) automatically, a file containing credentials is needed to run this mode.",
        type:"string",
    })
    .help()
    .argv


const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
})

async function invokeCommandLine(srvs) {
    rl.question("> ", async cmd => {
        const [command, ...input] = cmd.trim().split(/\s+/);
        if(!commands[command]) {
            console.log("No command found! Type 'help' to see the list of available commands.");
        } else {
            await commands[command].runCommand(input, srvs, args);
        }
        invokeCommandLine(srvs);
    })
}

function displayBanner() {
    let randInt = ~~(Math.random()*banner.length);
    console.log(banner[randInt]);
}

async function main() {
    displayBanner();
    const services = await getServices();
    if(args.fullscan) {
        try {
            let data = JSON.parse(await fs.readFile(args.fullscan, { encoding: "utf-8" }));
            
            let runningServices = [];

            let servicesLeft = data.length;

            for(let srv of data) {
                console.log(srv);
                // Set config vars
                srv['args'].forEach(option => {
                    services[srv['service']]['config'][option] = true
                });

                runningServices.push(services[srv['service']].run(...srv['args'])
                    .then((res) => {
                        if(res['type'] == "Success") {
                            console.log(`${srv['service']} status: ${chalk.rgb(0,255,0)("Success!!")}`)
                        } else {
                            console.log(`${srv['service']} status: ${chalk.rgb(255,0,0)("Error!!")}
                            
                            ${JSON.stringify(res, null, 2)}`)
                        }
                        console.log(`${--servicesLeft} ${servicesLeft == 1 ? "Service" : "Services" } Left to go!`)
                    }));
                // Unset config after pushing promise to variable
                services[srv['service']]['config'] = {};
            }
            await Promise.all(runningServices);
            console.log(chalk.rgb(0,255,0)("Done!"));

        } catch(e) {
            console.log("An error occured while reading fullscan file... Exiting!")
            console.log(e.message);
        }
        process.exit(0);
    } else {
        invokeCommandLine(services);
    }
}

main();
