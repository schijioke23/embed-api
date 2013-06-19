/*global $, MTVNPlayer, test, asyncTest, expect, equal, ok, start */
(function() {
    "use strict";
    var $fixture = $("#qunit-fixture");
    test("check for jQuery plugin", function() {
        ok($.isFunction($.fn.player), "$.fn.player exists and is a function");
    });

    test("test placeholder creation", function() {
        $fixture.html($("#test1").html());
        $(".MTVNPlayer").player();
        var $placeholder = $(".MTVNPlayer", $fixture),
            $container = $("div.MTVNPlayer_placeholder ", $placeholder);
        equal($placeholder.length, 1, "placeholder tag is there");
        ok($placeholder.hasClass("MTVNPlayer"), "is MTVNPlayer class");
        ok($placeholder.data("contenturi").indexOf("mgid") === 0, "uri is there");
        equal($container.length, 1, "child div has MTVNPlayer_placeholder class");
        // is there a domEqual?
        equal($container.children(":first-child")[0].tagName, "IMG", "first child is img");
        equal($container.children(":last-child")[0].tagName, "DIV", "last child is play button");
    });

    asyncTest("test empty placeholder", function() {
        expect(1);
        $fixture.html($("#test2").html());
        $(".MTVNPlayer").player();
        $(".MTVNPlayer").one("MTVNPlayer:ready", function() {
            ok(true, "ready event has fired.");
            start();
        });
        $(".MTVNPlayer_placeholder").trigger("click");
    });

})();