/*globals $ test asyncTest expect equal ok start deepEqual MTVNPlayer*/
(function() {
    "use strict";
    // we're calling play
    var $fixture = $("#qunit-fixture");
    asyncTest("test performance results", 4, function() {
        $fixture.html($("#test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            performance: true
        });
        player.on("onPerformance", function(event) {
            var result = event.data;
            ok(result, "performance data");
            ok(!isNaN(result.load), "performance data.load");
            ok(!isNaN(result.metadata), "performance data.metadata");
            ok(!isNaN(result.ready), "performance data.ready");
            start();
        });
    });
    asyncTest("test performance results with testPlayStart overriding auto play", 5, function() {
        $fixture.html($("#test2").html());
        MTVNPlayer.testPlayStart = false;
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            performance: true,
            flashVars: {
                autoPlay: true
            }
        });
        player.on("onPerformance", function(event) {
            var result = event.data;
            ok(result, "performance data");
            ok(!isNaN(result.load), "performance data.load");
            ok(!isNaN(result.metadata), "performance data.metadata");
            ok(!isNaN(result.ready), "performance data.ready");
            ok(isNaN(result.playStart), "performance data.playStart should be NaN");
            start();
        });
    });
    asyncTest("test performance results with auto play", 5, function() {
        $fixture.html($("#test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            performance: true,
            flashVars: {
                autoPlay: true
            }
        });
        player.on("onPerformance", function(event) {
            var result = event.data;
            ok(result, "performance data");
            ok(!isNaN(result.load), "performance data.load");
            ok(!isNaN(result.metadata), "performance data.metadata");
            ok(!isNaN(result.ready), "performance data.ready");
            if (player.isFlash) {
                ok(!isNaN(result.playStart), "performance data.playStart");
            } else {
                ok(true, "playstart ignored");
            }
            start();
        });
    });
})();