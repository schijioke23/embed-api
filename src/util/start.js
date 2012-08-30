/**
 * For creating a player inline you can use the MTVNPlayer.Player constructor.
 * For creating multiple players defined in HTML see MTVNPlayer.createPlayers
 * @static
 */
var MTVNPlayer = window.MTVNPlayer || {};
(function(MTVNPlayer) {
    "use strict";
    if (!MTVNPlayer.module) {
        MTVNPlayer.module = function() {
            var modules = {};
            return function(name) {
                if (modules[name]) {
                    return modules[name];
                }
                modules[name] = {};
                return modules[name];
            };
        }();
    }
})(MTVNPlayer);

(function(context){
    // we're leaking yepnope into global. 
    // noConflict will be called after we store references
    // to the modules that we're using.
    var oldYepNope = context.yepnope;
    MTVNPlayer.noConflict = function(){
        context.yepnope = oldYepNope;
    };
})(window);