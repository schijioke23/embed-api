//= ../components/mtvn-package-manager/dist/mtvn-package-manager.js
/**
 * For creating a player inline you can use the MTVNPlayer.Player constructor.
 * For creating multiple players defined in HTML see MTVNPlayer.createPlayers
 * @static
 */
var MTVNPlayer = window.MTVNPlayer || {};
if (!MTVNPlayer.Player) {
    //= ../dist/version.js
    (function() {
        /*global Zepto*/
        //= third-party/underscore.js
        MTVNPlayer.provide("_",this._); // underscore is put on this.
        //= third-party/zepto.js
        MTVNPlayer.provide("$",Zepto); // Zepto is a var.
    }).apply({});
    // we can 'use strict' below, no more third-party stuff.
    /* jshint unused: false */
    (function(MTVNPlayer, $, _, BTG) {
        "use strict";
        var require = MTVNPlayer.require,
            provide = MTVNPlayer.provide,
            Exports = {}; // used for testing.
        //= <%= project %>
    })(MTVNPlayer, MTVNPlayer.require("$"), MTVNPlayer.require("_"), window.BTG);
}