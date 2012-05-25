/**
 * For creating a player inline see MTVNPlayer.Player constructor.
 * For creating a player or group of players defined in HTML see MTVNPlayer.createPlayers
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