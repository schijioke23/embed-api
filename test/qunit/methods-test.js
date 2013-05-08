/*globals $, test, asyncTest, expect, equal, ok, start, deepEqual, MTVNPlayer*/
(function() {
    "use strict";
    // no auto play for HTML5
    var $fixture = $("#qunit-fixture");
    asyncTest("test api", function() {
        expect(4);
        $fixture.html($("#test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]);
        player.one("onReady", function() {
            player.play();
        });
        player.one("onStateChange:playing", function() {
            ok(true, "play() worked");
            player.one("stateChange:paused", function() {
                ok(true, "pause() worked");
                player.one("onPlayheadUpdate:2", function() {
                    equal(Math.floor(player.playhead), 2, "cue point worked");
                    player.seek(20);
                    player.one("onPlayheadUpdate", function(event) {
                        ok(event.data >= 20, "seek(20) worked");
                        start();
                    });
                });
                player.play();
            });
            player.pause();
        });
    });

    asyncTest("test jQuery api", function() {
        expect(4);
        $fixture.html($("#test2").html());
        $(".MTVNPlayer").player(function() {});
        $(".MTVNPlayer").one("MTVNPlayer:onReady", function() {
            $(".MTVNPlayer").trigger("MTVNPlayer:play");
        });
        $(".MTVNPlayer").one("MTVNPlayer:onStateChange:playing", function() {
            ok(true, "play() worked");
            $(".MTVNPlayer").one("MTVNPlayer:stateChange:paused", function() {
                ok(true, "pause() worked");
                $(".MTVNPlayer").one("MTVNPlayer:playheadUpdate:2", function(event, playerEvent) {
                    equal(Math.floor(playerEvent.target.playhead), 2, "cue point worked");
                    $(".MTVNPlayer").trigger("MTVNPlayer:seek", 20);
                    $(".MTVNPlayer").one("MTVNPlayer:onPlayheadUpdate", function(event, playerEvent) {
                        ok(playerEvent.data >= 20, "seek(20) worked, value:" + playerEvent.data);
                        start();
                    });
                });
                $(".MTVNPlayer").trigger("MTVNPlayer:play");
            });
            $(".MTVNPlayer").trigger("MTVNPlayer:pause");
        });
    });
})();