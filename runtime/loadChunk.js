module.exports = function(url){
    __webpack_require__._assetLoader = __webpack_require__._assetLoader || require("./store");
    return __webpack_require__._assetLoader.push(url);
}