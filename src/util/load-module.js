/*global MTVNPlayer, Config, _*/
var PackageManager = function() {
    var Events = {
        ENDSLATE: "endslate"
    },
    moduleBase = "http://media.mtvnservices.com/player/api/module/",
        endslatePackages = {
            "$": {
                shim: true,
                url: "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
            },
            "mtvn-util": moduleBase + "mtvn-util/latest/mtvn-util.min.js",
            "endslate-css": moduleBase + "endslate/latest/style.css",
            "endslate": moduleBase + "endslate/latest/endslate.min.js"
        },
        createEndslate = function(event) {
            Config.provideJQuery();
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