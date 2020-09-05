const chalk = require("chalk");
const banner = require("./banner");

const commandList = {
    "quit": {
        description: "Quits the program",
        runCommand: () => {
            console.log("Bye!");
            process.exit(0);
        }
    },
    "start": {
        description: "Runs a service.",
        runCommand: async (input, services) => {
            const [service, ...other] = input;
            if(!services[service]) {
                console.log("No such service! Get a list of available services by typing 'list services' in the console.")
            } else {
                try {
                    if (other) {
                        services[service]['config'] = {};
                        other.forEach(option => {
                            services[service]['config'][option] = true
                        });
                    }
                    let result = JSON.stringify(await services[service].run(...other),null, 2);
                    console.log(result);
                    services[service].config = null;
                } catch(e) {
                    console.log(e);
                }
            }
        }
    },
    "list": {
        description: "Lists stuff (services).",
        runCommand: async (input, services, args) => {
            if(args.debug) {
                console.log(input);
                console.log(services);
            }
            // Planuję dodać więcej opcji w przyszłości, dlatego to jest wyrażenie switch, nie oceniaj.
            switch(input[0]) {
                case "services":
                    console.log(Object.keys(services).map(v => `${chalk.hex("#F000F0")(services[v]['name'])} - ${chalk.hex("#00FFFF")(services[v]['description'] || "No set description.")}`).join("\n"))
                    break;
                default:
                    console.log("You have to append of of these lists - services")
            }
        }
    },
    "help": {
        description: "Displays all the available commands. help <command name> shows details about the command",
        runCommand: (input,_,args) => {
            if(args.debug) {
                console.log(input);
            }
            if(commandList[input[0]]) {
                console.log(chalk.hex("#F000F0")( commandList[input[0]]['description'] ));
            } else {
                let list = Object.keys(commandList)
                .map(v => `${ chalk.hex("#00FFFF")(v) } - ${ chalk.hex("#F000F0")( commandList[v]['description'] ) }`)

                console.log(list.join('\n'));
            }

        }
    },
    "banner": {
        description: `Displays a banner. Usage: banner 1-${banner.length}`,
        runCommand: (input) => {
            if(!input || isNaN(+input)) {
                console.log(`Append a number to the command to display a banner, example: banner 2`);
            } else {
                if(banner.length-1 < input - 1 || input-1 < 0) {
                    console.log(commandList['banner']['description']);
                } else {
                    console.log(banner[+input-1]);
                }
            }
        }
    }
}

module.exports = commandList;