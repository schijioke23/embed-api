var config = module.exports;

config["embed api tests"] = {
    rootPath: "../../",
    sources: ["src/index.js"],
    tests: ["test/buster/tests/**/*-test.js"]
};