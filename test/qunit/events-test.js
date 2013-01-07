/*globals $ test asyncTest expect equal ok start deepEqual MTVNPlayer*/
(function() {
    "use strict";
    // we're calling play
    var $fixture = $("#qunit-fixture");
    asyncTest("test bind order", 1, function() {
        $fixture.html($("#test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]),
            order = [];
        player.bind("onReady", function(event) {
            order.push(0);
        });
        // also test that on works
        player.on("onReady", function(event) {
            order.push(1);
        });
        player.on("onReady", function(event) {
            order.push(2);
        });
        player.bind("onReady", function(event) {
            order.push(3);
            equal(order.toString(), [0, 1, 2, 3].toString(), "callbacks fired in order");
            start();
        });
    });
    asyncTest("test one method, test cue point", 4, function() {
        $fixture.html($("#test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]),
            onceCount = 0;
        player.one("onReady", function(event) {
            player.play();
        });
        player.one("onPlayheadUpdate", function(event) {
            equal(onceCount, 0, "count equals 0");
            onceCount++;
        });
        player.on("onPlayheadUpdate:1", function(event) {
            ok(Math.floor(event.target.playhead) === 1, "cue point at 1 fires");
            ok(Math.floor(event.data) === 1, "cue point at 1 fires");
        });
        player.on("onPlayheadUpdate", function(event) {
            // let the playhead tick to 2.
            if (event.data > 2) {
                ok(true, "on fired more than once");
                start();
            }
        });
    });
    asyncTest("test unbind", 1, function() {
        $fixture.html($("#test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]),
            count = 0,
            callback = function(event) {
                count++; // should equal 1
                player.unbind("onPlayheadUpdate", callback);
            };
        player.one("onReady", function(event) {
            player.play();
        });
        player.bind("onPlayheadUpdate", callback);
        player.on("onPlayheadUpdate", function(event) {
            if (event.data > 2) {
                equal(count, 1, "unbind worked");
                start();
            }
        });
    });
})();