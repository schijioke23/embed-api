"use strict";
var version = require("../../package.json").version;
console.log("version",version);
exports.index = function(req, res) {
    res.sendfile("test/index.html");
};
exports.api = function(req, res) {
    var dir = process.cwd(),
        path = dir.indexOf("/test") === -1 ? "" : dir.replace("/test","/");
    res.sendfile(path + "build/" + version + "/api.js");
};
exports.apiAuto = function(req, res) {
    var dir = process.cwd(),
        path = dir.indexOf("/test") === -1 ? "" : dir.replace("/test","/");
    res.sendfile(path + "build/auto/" + version + ".js");
};
exports.sendres = function(req, res, next) {
    console.log("send res");
    res.end(req.params.chunk);
};
exports.redirect = function(req, res, next) {
    console.log("req.url:" + req.url);
    res.redirect(req.url);
};