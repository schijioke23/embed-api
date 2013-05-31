/*globals $, test, asyncTest, expect, equal, ok, start, deepEqual, MTVNPlayer*/
(function() {
    "use strict";
    // we're calling play
    var $fixture = $("#qunit-fixture");
    asyncTest("test bind order", 1, function() {
        $fixture.html($("#test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]),
            order = [];
        player.bind("onReady", function() {
            order.push(0);
        });
        // also test that on works
        player.on("onReady", function() {
            order.push(1);
        });
        player.on("onReady", function() {
            order.push(2);
        });
        player.bind("onReady", function() {
            order.push(3);
            equal(order.toString(), [0, 1, 2, 3].toString(), "callbacks fired in order");
            start();
        });
    });
    asyncTest("test one method, test cue point", 4, function() {
        $fixture.html($("#test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]),
            onceCount = 0;
        player.one("onReady", function() {
            player.play();
        });
        player.one("onPlayheadUpdate", function() {
            equal(onceCount, 0, "count equals 0");
            onceCount++;
        });
        player.on("onPlayheadUpdate:1", function(event) {
            equal(Math.floor(event.target.playhead), 1, "cue point at 1 fires");
            equal(Math.floor(event.data), 1, "cue point at 1 fires");
        });
        var playheadEvent = function(event) {
            // let the playhead tick to 2.
            if (event.data > 2) {
                player.off("onPlayheadUpdate", playheadEvent);
                ok(true, "on fired more than once");
                start();
            }
        };
        player.on("onPlayheadUpdate", playheadEvent);
    });
    asyncTest("test unbind", 1, function() {
        $fixture.html($("#test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]),
            count = 0,
            callback = function() {
                count++; // should equal 1
                player.unbind("onPlayheadUpdate", callback);
            };
        player.one("onReady", function() {
            player.play();
        });
        player.bind("onPlayheadUpdate", callback);
        var otherCB = function(event) {
            if (event.data > 2) {
                player.off("onPlayheadUpdate", otherCB);
                equal(count, 1, "unbind worked");
                start();
            }
        };
        player.on("onPlayheadUpdate", otherCB);
    });
})();