"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const fs_1 = require("fs");
const util_1 = require("util");
const path_1 = require("path");
const readdirasync = util_1.promisify(fs_1.readdir);
class SEOChecker {
    // Static functions
    /**
     * Creates a new service
     * @param config - This is where you can set the name and the function of the service and other stuff that change the behaviour of this service.
     */
    static createService(obj) {
        return class {
            constructor(config) {
                this.name = obj.name;
                this.run = obj.runService;
                this.config = config || {};
                this.description = obj.description;
            }
        };
    }
    static async loadServices(path, config) {
        /* This function loads all the services that are in the Services.ts file */
        let servicesList = (await readdirasync(path_1.resolve(__dirname, 'services'))).map((v) => path_1.resolve(__dirname, 'services', v));
        if (path) {
            // Append the custom services to the object
            let externalServices = (await readdirasync(path_1.resolve(path))).map((file) => path_1.resolve(path, file));
            servicesList = [...servicesList, ...externalServices];
        }
        servicesList = servicesList.filter((filename) => {
            return /\.js$/.test(filename);
        });
        const loadedServices = {};
        // Load services and add them one by one
        for (let i = 0; i < servicesList.length; i += 1) {
            const { Srv } = await Promise.resolve().then(() => require(servicesList[i]));
            const service = new Srv(config);
            loadedServices[service.name] = service;
        }
        return loadedServices;
    }
}
exports.SEOChecker = SEOChecker;
