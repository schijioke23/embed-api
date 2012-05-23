(function(MTVNPlayer) {
    "use strict";
    if (MTVNPlayer.createPlayers() === 0) {
        // no players were created, maybe the dom isn't ready.
        // wait and call again when dom ready
        MTVNPlayer.module("domready").on(function() {
            MTVNPlayer.createPlayers();
        });
    }
}(window.MTVNPlayer));