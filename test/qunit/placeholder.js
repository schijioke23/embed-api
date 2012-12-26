/*globals $ test asyncTest expect equal ok start deepEqual MTVNPlayer*/
(function() {
    "use strict";
    var $fixture = $("#qunit-fixture");
    test("check for jQuery plugin", function() {
        ok($.isFunction($.fn.player), "$.fn.player exists and is a function");
    });

    test("test placeholder creation", function() {
        $fixture.html($("#test1").html());
        $(".MTVNPlayer").player();
        var $placeholder = $("a.MTVNPlayer", $fixture),
            $container = $("div.MTVNPlayer_placeholder ", $placeholder);
        ok($placeholder.length === 1, "placeholder tag is there");
        ok($placeholder.hasClass("MTVNPlayer"), "is MTVNPlayer class");
        ok($placeholder.data("contenturi") === "mgid:uma:video:mtv.com:661024", "uri is there");
        ok($container.length === 1, "child div has MTVNPlayer_placeholder class");
        // is there a domEqual?
        ok($container.children(":first-child")[0].tagName === "IMG", "first child is img");
        ok($container.children(":last-child")[0].tagName === "DIV", "last child is play button");
    });

    if (MTVNPlayer.isHTML5Player) {
        asyncTest("test player creation", function() {
            expect(1);
            $fixture.html($("#test1").html());
            $(".MTVNPlayer").player();
            $(".MTVNPlayer").bind("MTVNPlayer:onReady", function(event) {
                ok(true, "ready event has fired.");
                $(".MTVNPlayer").trigger("MTVNPlayer:play");
            });
            $(".MTVNPlayer_placeholder").trigger("click");
        });
    } else {
        asyncTest("test player creation and playing", function() {
            expect(2);
            $fixture.html($("#test1").html());
            $(".MTVNPlayer").player();
            $(".MTVNPlayer").bind("MTVNPlayer:onStateChange", function(je, e) {
                var playstate = e.data;
                if (playstate === "playing") {
                    ok(true, "video played");
                    start();
                }
            });
            $(".MTVNPlayer").bind("MTVNPlayer:onReady", function(event) {
                ok(true, "ready event has fired.");
                $(".MTVNPlayer").trigger("MTVNPlayer:play");
            });
            $(".MTVNPlayer_placeholder").trigger("click");
        });
    }

    asyncTest("test empty placeholder", function() {
        expect(1);
        $fixture.html($("#test2").html());
        $(".MTVNPlayer").player();
        $(".MTVNPlayer").bind("MTVNPlayer:onReady", function(event) {
            ok(true, "ready event has fired.");
            start();
        });
        $(".MTVNPlayer_placeholder").trigger("click");
    });
})();