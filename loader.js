const path = require("path")
const store = JSON.stringify(path.join(__dirname,"runtime.js"));

module.exports = function () { };
module.exports.pitch = function (remainingRequest) {
    this.cacheable();
    return [
        `var url=require(${JSON.stringify("-!" + remainingRequest)});`,
        `module.exports = typeof(window)=="undefined"?url:require(${store}).push(url);`
    ].join("\r\n")
};