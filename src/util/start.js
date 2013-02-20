/*global MTVNPlayer _ */
/**
 * @ignore
 * Modules are for internal embed api modules.
 * This was used before I was able to use rigger to scope
 * separate files.
 */
if(!MTVNPlayer.module) {
    MTVNPlayer.module = function() {
        var modules = {};
        return function(name) {
            if(modules[name]) {
                return modules[name];
            }
            modules[name] = {};
            return modules[name];
        };
    }();
}

/**
 * @ignore
 * These are for external projects built around the embed api to access the
 * shared resources. e.g. _, $, Backbone, Handlebars.
 */
if(!MTVNPlayer.require) {
    var packages = {};
    /**
     * @ignore
     * This is a way for other modules to share between each other.
     */
    MTVNPlayer.require = function(name) {
        if(!packages[name]) {
            throw new Error("MTNVPlayer: package " + name + " not found.");
        }
        return packages[name];
    };
    /**
     * @ignore
     * This is a way for other modules to share between each other.
     */
    MTVNPlayer.provide = function(name, module) {
        packages[name] = module;
    };
    /**
     * @ignore
     * This is a way for other modules to share between each other.
     */
    MTVNPlayer.has = function(name) {
        return packages[name];
    };
}
(function(context) {
    // we're leaking yepnope into global.
    // noConflict will be called after we store references
    // to the modules that we're using.
    var oldYepNope = context.yepnope;
    MTVNPlayer.noConflict = function() {
        context.yepnope = oldYepNope;
        _.noConflict();
    };
})(window);