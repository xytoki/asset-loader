module.exports = function () { };
module.exports.pitch = function (remainingRequest) {
    this.cacheable();
    return [
        `var url=require(${JSON.stringify("-!" + remainingRequest)});`,
        `module.exports = typeof(window)=="undefined"?url:require('@xytoki/asset-loader').push(url);`
    ].join("\r\n")
};