var config = module.exports,
    path = "build/detailed/" + require("../../package.json").version + ".js";

console.log("testing API version:" + path);

config["embed api tests"] = {
    rootPath: "../../",
    sources: [path],
    tests: ["test/buster/tests/**/*-test.js"]
};