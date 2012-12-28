/*globals $ test asyncTest expect equal ok start deepEqual MTVNPlayer*/
(function() {
    "use strict";
    var $fixture = $("#qunit-fixture");
    test("test data-flashVars", function() {
        $fixture.html($("#config-test1").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]);
        ok(player.config.flashVars.autoPlay === "true", "autoPlay from element data-flashVars");
        ok(player.config.flashVars.sid === "12345", "sid from element data-flashVars");
        $fixture.empty();
        $fixture.html($("#config-test1").html());
        player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            flashVars: {
                autoPlay: false,
                sid: 7890
            }
        });
        ok(player.config.flashVars.autoPlay === "true", "element value has precedence for autoPlay");
        ok(player.config.flashVars.sid === "12345", "element value has precedence for sid");
        $fixture.empty();
        $fixture.html($("#config-test1").html());
        MTVNPlayer.defaultConfig = {
            flashVars: {
                autoPlay: false,
                sid: 7890
            }
        };
        player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            flashVars: {
                autoPlay: false,
                sid: 7890
            }
        });
        ok(player.config.flashVars.autoPlay === "true", "element value has precedence for autoPlay over config and defaultConfig");
        ok(player.config.flashVars.sid === "12345", "element value has precedence for sid over config and defaultConfig");
    });
    test("test data-autoPlay and data-sid", function() {
        $fixture.html($("#config-test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]);
        ok(player.config.flashVars.autoPlay === "true");
        ok(player.config.flashVars.sid === "12345");
        $fixture.empty();
        $fixture.html($("#config-test2").html());
        player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            flashVars: {
                autoPlay: false,
                sid: 7890
            }
        });
        ok(player.config.flashVars.autoPlay === "true", "element value has precedence for autoPlay");
        ok(player.config.flashVars.sid === "12345", "element value has precedence for sid");
        $fixture.empty();
        $fixture.html($("#config-test1").html());
        MTVNPlayer.defaultConfig = {
            flashVars: {
                autoPlay: false,
                sid: 7890
            }
        };
        player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            flashVars: {
                autoPlay: false,
                sid: 7890
            }
        });
        ok(player.config.flashVars.autoPlay === "true", "element value has precedence for autoPlay over config and defaultConfig");
        ok(player.config.flashVars.sid === "12345", "element value has precedence for sid over config and defaultConfig");
    });
    test("test defaultConfig properties", function() {
        $fixture.html($("#config-test3").html());
        MTVNPlayer.defaultConfig = {
            width:101,
            height:102,
            flashVars: {
                autoPlay: "defaultAutoPlay",
                sid: "defaultSID"
            },
            params:{
                wmode:"window"
            },
            attributes:{
                attrValue:"attrValue"
            }
        };
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]);
        ok(player.config.flashVars.autoPlay === "defaultAutoPlay", "defaultConfig autoPlay");
        ok(player.config.flashVars.sid === "defaultSID", "defaultConfig sid");
        ok(player.config.width === 101, "defaultConfig width");
        ok(player.config.height === 102, "defaultConfig height");
        ok(player.config.params.wmode === "window", "defaultConfig param");
        ok(player.config.attributes.attrValue === "attrValue", "defaultConfig attribute");
        $fixture.empty();
        // test config overrides
        $fixture.html($("#config-test2").html());
        player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            width:103,
            height:104,
            flashVars: {
                autoPlay: "true",
                sid: "12345"
            },
            params:{
                wmode:"window1"
            },
            attributes:{
                attrValue:"attrValue1"
            }
        });
        ok(player.config.flashVars.autoPlay === "true", "config value has precedence for autoPlay");
        ok(player.config.flashVars.sid === "12345", "config value has precedence for sid");
        ok(player.config.width === 103, "config overrides default width");
        ok(player.config.height === 104, "config overrides default height");
        ok(player.config.params.wmode === "window1", "config overrides default param");
        ok(player.config.attributes.attrValue === "attrValue1", "config overrides default attribute");
    });
})();