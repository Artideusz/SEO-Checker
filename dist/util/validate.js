"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const url = require("url");
function ext(...ext) {
    return ext.map((x) => new RegExp(`\\w+.${x}`));
}
function validateURL(adr, baseUrl) {
    if (!adr || !baseUrl)
        return false;
    const urlParsed = url.parse(baseUrl);
    const isHostname = new RegExp(`${urlParsed.hostname}`).test(adr);
    const hasQueries = adr.indexOf('?') !== -1;
    const hasHashtags = adr.indexOf('#') !== -1;
    const isHttp = /^https?:\/\/\w+/.test(adr);
    const hasExt = /\.\w+$/.test(adr);
    const inAllowedExt = ext('html', 'php', 'jpg', 'jpeg', 'png', 'tpl', 'asp', 'htm').some((ext) => ext.test(adr));
    return isHostname && !hasHashtags && !hasQueries && isHttp && (!hasExt || (hasExt && inAllowedExt));
}
exports.validateURL = validateURL;
;
