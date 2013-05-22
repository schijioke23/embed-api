// http://media.mtvnservices-d.mtvi.com/player/api/module/mtvn-package-manager/0.3.0/mtvn-package-manager.js
//= ../components/mtvn-package-manager/src/mtvn-package-manager.js
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
    (function(MTVNPlayer, $, _, BTG) {
        "use strict";
        var require = MTVNPlayer.require,
            provide = MTVNPlayer.provide;
        //= core.js
        //= util/logger.js
        //= util/module.js
        //= util/config.js
        //= util/url.js
        //= model
        //= player/micro-player/
        //= player/vmap/
        //= player.js
        //= util/reporting.js
        //= util/jquery-plugin.js
        //= util/load-module.js
        //= util/finish.js
    })(MTVNPlayer, MTVNPlayer.require("$"), MTVNPlayer.require("_"), window.BTG);
}
//= http://media.mtvnservices-d.mtvi.com/player/api/module/mtvn-util/archive/0.5.0-18/mtvn-util.js
// ../../mtvn-util/dist/mtvn-util.js

//= http://media.mtvnservices-d.mtvi.com/player/api/module/mtvn-playlist/archive/0.4.0-15/mtvn-playlist.js
// ../../mtvn-playlist/dist/mtvn-playlist.js

//= http://media.mtvnservices-d.mtvi.com/player/api/module/mtvn-playback/archive/0.3.0-22/html5-playback.js
// ../../mtvn-playback/dist/html5-playback.js

// http://media.mtvnservices-d.mtvi.com/player/api/module/Bento-JS/1.3.0/dist/Bento.js
// ../../Bento-JS/dist/Bento.js