/*global $, asyncTest, expect, ok, start */
(function() {
    "use strict";
    var $fixture = $("#qunit-fixture");
    asyncTest("test player creation and playing", function() {
        expect(2);
        $fixture.html($("#test1").html());
        $(".MTVNPlayer").player();
        $(".MTVNPlayer").one("MTVNPlayer:onStateChange:playing", function() {
            ok(true, "video played");
            start();
        });
        $(".MTVNPlayer").one("MTVNPlayer:onReady", function() {
            ok(true, "ready event has fired.");
            $(".MTVNPlayer").trigger("MTVNPlayer:play");
        });
        $(".MTVNPlayer_placeholder").trigger("click");
    });
})();