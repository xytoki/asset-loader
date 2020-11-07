const path = require("path")
const runtime = JSON.stringify(path.join(__dirname,"runtime/loadChunk.js"));

module.exports = function () { };
module.exports.pitch = function (remainingRequest) {
    this.cacheable();
    return `module.exports = require(${runtime})(require(${JSON.stringify("-!" + remainingRequest)}));`;
};