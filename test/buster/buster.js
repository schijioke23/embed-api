var config = module.exports;

config["embed api tests"] = {
    rootPath: "../../",
    sources: ["src/**/*.js"],
    tests: ["test/buster/tests/**/*-test.js"]
};