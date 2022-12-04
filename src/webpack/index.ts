export default function () {}
export const pitch = function (this: any, remainingRequest: string) {
    this.cacheable();
    return [
        `var url=require(${JSON.stringify('-!' + remainingRequest + '?asset-loader-raw')});`,
        `module.exports = typeof(window)=="undefined"?url:require('@xytoki/asset-loader').push(url);`,
    ].join('\r\n');
};
