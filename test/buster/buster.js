var config = module.exports,
    path = "build/" + require("../../package.json").version + "/api.js";

console.log("testing API version:" + path);

config["embed api tests"] = {
    rootPath: "../../",
    sources: [path],
    tests: ["test/buster/tests/**/*-test.js"]
};