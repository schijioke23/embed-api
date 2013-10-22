/*global MTVNPlayer */
/* exported _mtvnPlayerReady */
var _mtvnPlayerReady = window._mtvnPlayerReady = window._mtvnPlayerReady || [];
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
(function(context) {
    // we're leaking yepnope into global.
    // noConflict will be called after we store references
    // to the modules that we're using.
    var oldYepNope = context.yepnope;
    MTVNPlayer.noConflict = function() {
        context.yepnope = oldYepNope;
    };
})(window);