(function(MTVNPlayer) {
    "use strict";
    var core = MTVNPlayer.module("core"),
        performanceEvent = MTVNPlayer.Events.PERFORMANCE,
        elapsed = function(startTime) {
            return (new Date()).getTime() - startTime;
        };
    MTVNPlayer.onPlayer(
    // when a player is created, this is called.
    function(player) {
        var config = player.config;
        if (config.performance) {
            var results = {},
            fire = function() {
                if (results.metadata && results.ready) {
                    if (!testPlayStart || results.playStart) {
                        core.processEvent(player.events[performanceEvent], {
                            target: player,
                            data: results
                        });
                    }
                }
            },
            startTime = config.performance.startTime,
                testPlayStart = function(flashVars, testPlayStart) {
                    if (player.isFlash) {
                        if (testPlayStart !== undefined && testPlayStart !== null) {
                            return testPlayStart;
                        }
                        return flashVars ? flashVars.autoPlay : false;
                    }
                    return false;
                }(config.flashVars, MTVNPlayer.testPlayStart);
            // time from new MTVNPlayer.Player() until player load
            results.load = elapsed(startTime);
            player.one("ready", function() {
                results.ready = elapsed(startTime);
                fire();
            });
            player.one("metadata", function() {
                results.metadata = elapsed(startTime);
                fire();
            });
            player.one("stateChange:playing", function(event) {
                results.playStart = elapsed(startTime);
                fire();
            });
        }
    });
})(window.MTVNPlayer);