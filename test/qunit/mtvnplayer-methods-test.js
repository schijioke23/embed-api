/*globals $ test asyncTest expect equal ok start deepEqual MTVNPlayer*/
(function() {
    "use strict";
    // we're calling play
    var $fixture = $("#qunit-fixture");
    asyncTest("MTVNPlayer.getPlayer", 4, function() {
        $fixture.html($("#test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]);
        equal(player.config.uri, MTVNPlayer.getPlayer(player.config.uri).config.uri, "getPlayer found matching uri");
        equal(player.config.uri, MTVNPlayer.getPlayers()[0].config.uri, "getPlayers' only player matches the uri");
        $fixture.empty();
        //         There's a delay before the element won't be in the document.
        setTimeout(function() {
            MTVNPlayer.gc();
            equal(MTVNPlayer.getPlayers().length, 0, "getPlayers has 0 players");
            ok(!MTVNPlayer.getPlayer(player.config.uri), "gc works");
            start();
        }, 50);
    });
    asyncTest("MTVNPlayer.onPlayer MTVNPlayer.removeOnPlayer", 2, function() {
        $fixture.html($("#test2").html());
        var callback2 = function(player) {
            ok(player, "second on player");
            MTVNPlayer.removeOnPlayer(callback2);
            start();
        },
        callback1 = function(player) {
            MTVNPlayer.removeOnPlayer(callback1);
            ok(player, "on player callback");
            setTimeout(function() {
                $fixture.html($("#test2").html());
                MTVNPlayer.onPlayer(callback2);
                new MTVNPlayer.Player($(".MTVNPlayer")[0]);
            }, 100);
        };
        MTVNPlayer.onPlayer(callback1);
        new MTVNPlayer.Player($(".MTVNPlayer")[0]);
    });
    asyncTest("MTVNPlayer.createPlayers MTVNPlayer.defaultEvents", 6, function() {
        MTVNPlayer.defaultConfig = {
            width: 101,
            height: 101
        };
        MTVNPlayer.defaultEvents = {
            onReady: function() {
                ok(true, "default event worked");
            }
        };
        var callback = function(player) {
            ok(true, "second on player");
            equal(100, player.config.width, "config worked");
            equal(101, player.config.height, "defaultConfig worked");
            player.one("onReady", function() {
                ok(true, "second onReady");
                start();
            });
            MTVNPlayer.removeOnPlayer(callback);
        };
        $fixture.html($("#test2").html());
        MTVNPlayer.onPlayer(callback);
        MTVNPlayer.createPlayers(".MTVNPlayer", {
            width: 100
        }, {
            onReady: function() {
                ok(true, "ready event");
            }
        });
    });
})();