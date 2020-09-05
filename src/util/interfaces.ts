
/**
 * This interface returns an error compatible with SEOChecker
 * @property {string} url - Location of the error
 * @property {"Error"} result - This must be set for SEOChecker to work properly
 * @property {string} errorMessage - Description of the error
 */

export interface ServiceError {
    url: string;
    type: "Error";
    errorMessage: string;
}

export type ServiceResult = Promise<ServiceSuccess | ServiceError | void>

/**
 * ServiceSuccess
 */

export interface ServiceSuccess {
    url: string;
    type: "Success";
    [index: string]: any;
}

/**
 * HTMLPage - object that has the contents of a URL.
 * @property {string} url - URL of the page.
 * @property {string} body - content of the page.
 * @property {string} errorMessage - If the GET request fails, return the error
 */

export interface HTMLPage {
    url: string;
    statusCode?: number;
    statusMessage?: string;
    body?: string;
    errorMessage?: string;
}

/**
 * Service interface. All services should have these properties and methods.
 * @property {string} name - The name of the service that will appear when loading the services and returning the overall service results
 * @function run - Function that is ran to return the Results
 */

export interface Service {
    name: string;
    run: runServiceFunction
}

/**
 * The main service function.
 * @param {string} url - The url to run the service on
 * @param {HTMLPage} page - This is used only if isTraversable is true, current page content that is traversed
 * @returns {ServiceResult | ServiceError | void}
 */

export interface runServiceFunction {
    (...args: any[]): ServiceResult;
}

export interface LoadedServicesList {
    [index: string]: Service;
}