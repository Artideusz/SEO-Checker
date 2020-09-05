import { readdir } from 'fs';
import { promisify } from 'util';
import { resolve } from 'path';
import { LoadedServicesList, Service, runServiceFunction } from './util/interfaces';

const readdirasync = promisify(readdir);

export class SEOChecker {

    // Static functions

    /**
     * Creates a new service
     * @param config - This is where you can set the name and the function of the service and other stuff that change the behaviour of this service.
     */

    static createService(obj: { name: string, runService: runServiceFunction, description: string}) {
        return class implements Service {

            name: string;
            run: runServiceFunction;
            config?: { [index: string]: any }
            description?: string;

            constructor(config?: { [index: string]: any }) {
                this.name = obj.name;
                this.run = obj.runService;
                this.config = config || {};
                this.description = obj.description;
            }
        }
    }

    static async loadServices(path: string, config: { [index: string]: any }) {
        /* This function loads all the services that are in the Services.ts file */
        let servicesList = (await readdirasync(resolve(__dirname, 'services'))).map((v) => resolve(__dirname, 'services', v));

        if (path) {
            // Append the custom services to the object
            let externalServices = (await readdirasync(resolve(path))).map((file) => resolve(path, file));
            servicesList = [...servicesList, ...externalServices];
        }

        servicesList = servicesList.filter((filename) => {
            return /\.js$/.test(filename);
        });

        const loadedServices: LoadedServicesList = {};

        // Load services and add them one by one
        for (let i = 0; i < servicesList.length; i += 1) {
            const { Srv } = await import(servicesList[i]);
            const service = new Srv(config);
            loadedServices[service.name] = service;
        }

        return loadedServices;
    }
}
