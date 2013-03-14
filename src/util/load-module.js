/*global MTVNPlayer, Config, _*/
var PackageManager = function() {
    function provideJQuery() {
        // provide $ if it's on the window
        if (!MTVNPlayer.has("$")) {
            var $ = window.jQuery;
            // TODO we can lower this version if we want to test first.
            if ($ && Config.versionIsMinimum("1.9.0", $.fn.jquery)) {
                MTVNPlayer.provide("$", $);
            }
        }
    }
    var Events = {
        ENDSLATE: "endslate"
    },
    moduleBase = "http://media.mtvnservices-d.mtvi.com/player/api/module/",
        endslatePackages = {
            "$": {
                shim: true,
                url: "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
            },
            "mtvn-util": moduleBase + "mtvn-util/latest/mtvn-util.js",
            "endslate-css": moduleBase + "endslate/latest/style.css",
            "endslate": moduleBase + "endslate/latest/endslate.js"
        },
        createEndslate = function(event) {
            provideJQuery();
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
        player.bind(PackageManager.Events.ENDSLATE, createEndslate);
    });
    // Exports
    return {
        Events: Events
    };
}();