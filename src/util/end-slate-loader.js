/* global MTVNPlayer, _, Events*/
/* exported EndSlateLoader */
/**
 * Shared across players, so it hooks into the onPlayer event. 
 * When the "endslate" event is fired, it will load the end-slate js
 * and css and hand control over to the end-slate moduile.
 */
var EndSlateLoader = function() {
    var Events = {
        ENDSLATE: "endslate"
    },
    moduleBase = "http://media.mtvnservices-d.mtvi.com/player/api/module/",
        endslatePackages = {
            "mtvn-util": moduleBase + "mtvn-util/latest/mtvn-util.js",
            "endslate-css": moduleBase + "endslate/latest/style.css",
            "endslate": moduleBase + "endslate/latest/endslate.js"
        },
        createEndslate = function(event) {
            var player = event.target,
                packages = player.config.module || {};
            MTVNPlayer.loadPackages(_.extend(endslatePackages, packages.endslate), function() {
                new(MTVNPlayer.require("endslate"))({
                    config: event.data,
                    player: player
                });
            });
        };
    MTVNPlayer.onPlayer(function(player) {
        // hook into endslate events for all players
        player.on(Events.ENDSLATE, createEndslate);
    });
    // Exports
    return {
        Events: Events
    };
}();
_.extend(Events, EndSlateLoader.Events);