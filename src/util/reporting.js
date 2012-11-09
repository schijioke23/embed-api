/**
* Trying something new here. A way to keep the API clean for utility methods specific to things like reporting.
* These modules are on a player, as opposed to the modules on MTVNPlayer.
*/
(function(MTVNPlayer) {
    "use strict";
    MTVNPlayer.onPlayer(function(player) {
        player.module("reporting").logGUIEvent = function(eventName, eventData) {
            player.message("logGUIEvent", eventName, eventData);
        };
    });
})(window.MTVNPlayer);