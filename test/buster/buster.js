var config = module.exports;

config["embed api tests"] = {
    rootPath: "../../",
    sources: ["build/**/.js"],
    tests: ["test/buster/tests/**/*-test.js"]
};