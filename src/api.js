// http://media.mtvnservices.com/player/api/module/mtvn-package-manager/0.2.0/mtvn-package-manager.js
//= ../../mtvn-package-manager/dist/mtvn-package-manager.js
/**
 * For creating a player inline you can use the MTVNPlayer.Player constructor.
 * For creating multiple players defined in HTML see MTVNPlayer.createPlayers
 * @static
 */
var MTVNPlayer = window.MTVNPlayer || {};
if (!MTVNPlayer.Player) {
    //= ../dist/version.js
    (function() {
        //= third-party/underscore.js
        //= third-party/zepto.js
    }).apply(window);
    // we can 'use strict' below, no more third-party stuff.
    (function(MTVNPlayer, $, _) {
        "use strict";
        var require = MTVNPlayer.require,
            provide = MTVNPlayer.provide;
        provide("_", _);
        provide("$", $);
        //= core.js
        //= util/module.js
        //= util/config.js
        //= util/url.js
        //= model
        //= player/plugin-player/
        //= player.js
        //= util/reporting.js
        //= util/jquery-plugin.js
        //= util/load-module.js
        //= util/finish.js
    })(MTVNPlayer, window.jQuery || window.Zepto, window._.noConflict());
}
// http://media.mtvnservices.com/player/api/module/mtvn-util/0.4.0/mtvn-util.js
//= ../../mtvn-util/dist/mtvn-util.js

// http://media.mtvnservices.com/player/api/module/mtvn-playlist/0.2.0/mtvn-playlist.js
//= ../../mtvn-playlist/dist/mtvn-playlist.js

// http://media.mtvnservices.com/player/api/module/mtvn-playback/0.1.1/html5-playback.js
//= ../../mtvn-playback/dist/html5-playback.js