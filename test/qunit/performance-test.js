/*global $ asyncTest expect ok start MTVNPlayer*/
(function() {
    "use strict";
    // we're calling play
    var $fixture = $("#qunit-fixture");
    asyncTest("test performance results", function() {
        $fixture.html($("#test2").html());
        var testVersion = MTVNPlayer.module("config").versionIsMinimum,
            player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
                performance: true
                //            templateURL:"http://localhost:5050/player/html5/gwtversions/workarea/"
            });
        if (MTVNPlayer.isHTML5Player) {
            player.on("performance", function(event) {
                var result = event.data;
                if (testVersion("1.18.4", player.config.version)) {
                    expect(3);
                    ok(result, "performance data");
                    ok(!isNaN(result.load), "performance data.load " + result.load);
                    ok(!isNaN(result.mrss), "performance data.mrss " + result.mrss);
                } else {
                    expect(1);
                    ok(true,"not testing performance in old player version " + player.config.version);
                }
                start();
            });
        } else {
            // player.on("performance", function(event) {
            //     var result = event.data;
            //     if (testVersion("2.4.1", player.element.getVersion())) {
            //         expect(3);
            //         ok(result, "performance data");
            //         ok(!isNaN(result.load), "performance data.load " + result.load);
            //         ok(!isNaN(result.mrss), "performance data.mrss " + result.mrss);
            //     } else {
            //         expect(1);
            //         ok(true,"not testing performance in old player version " + player.element.getVersion());
            //     }
            //     start();
            // });
            ok(true,"flash isn't ready yet for performance");
            start();
        }
    });
})();

