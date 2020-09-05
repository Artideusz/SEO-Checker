const { SEOChecker } = require("../dist/main");

module.exports = async () => {
    console.log("Loading Services...");
    let srvs = await SEOChecker.loadServices();
    if(Object.keys(srvs).length >= 1) {
        console.log("Services loaded!");
        return srvs;
    } else {
        console.log(srvs);
        process.exit(0);
    }
}