/*globals $, test, expect, equal, ok, start, deepEqual, MTVNPlayer*/
(function() {
    "use strict";
    var $fixture = $("#qunit-fixture");
    test("test data-flashVars", function() {
        $fixture.html($("#config-test1").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]);
        equal(player.config.flashVars.autoPlay, "true", "autoPlay from element data-flashVars");
        equal(player.config.flashVars.sid, "12345", "sid from element data-flashVars");
        $fixture.empty();
        $fixture.html($("#config-test1").html());
        player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            flashVars: {
                autoPlay: false,
                sid: 7890
            }
        });
        equal(player.config.flashVars.autoPlay, "true", "element value has precedence for autoPlay");
        equal(player.config.flashVars.sid, "12345", "element value has precedence for sid");
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
        equal(player.config.flashVars.autoPlay, "true", "element value has precedence for autoPlay over config and defaultConfig");
        equal(player.config.flashVars.sid, "12345", "element value has precedence for sid over config and defaultConfig");
    });
    test("test data-autoPlay and data-sid", function() {
        $fixture.html($("#config-test2").html());
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]);
        equal(player.config.flashVars.autoPlay, "true");
        equal(player.config.flashVars.sid, "12345");
        $fixture.empty();
        $fixture.html($("#config-test2").html());
        player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            flashVars: {
                autoPlay: false,
                sid: 7890
            }
        });
        equal(player.config.flashVars.autoPlay, "true", "element value has precedence for autoPlay");
        equal(player.config.flashVars.sid, "12345", "element value has precedence for sid");
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
        equal(player.config.flashVars.autoPlay, "true", "element value has precedence for autoPlay over config and defaultConfig");
        equal(player.config.flashVars.sid, "12345", "element value has precedence for sid over config and defaultConfig");
    });
    test("test defaultConfig properties", function() {
        $fixture.html($("#config-test3").html());
        MTVNPlayer.defaultConfig = {
            width: 101,
            height: 102,
            flashVars: {
                autoPlay: "defaultAutoPlay",
                sid: "defaultSID"
            },
            params: {
                wmode: "window"
            },
            attributes: {
                attrValue: "attrValue"
            }
        };
        var player = new MTVNPlayer.Player($(".MTVNPlayer")[0]);
        equal(player.config.flashVars.autoPlay, "defaultAutoPlay", "defaultConfig autoPlay");
        equal(player.config.flashVars.sid, "defaultSID", "defaultConfig sid");
        equal(player.config.width, 101, "defaultConfig width");
        equal(player.config.height, 102, "defaultConfig height");
        equal(player.config.params.wmode, "window", "defaultConfig param");
        equal(player.config.attributes.attrValue, "attrValue", "defaultConfig attribute");
        $fixture.empty();
        // test config overrides
        $fixture.html($("#config-test2").html());
        player = new MTVNPlayer.Player($(".MTVNPlayer")[0], {
            width: 103,
            height: 104,
            flashVars: {
                autoPlay: "true",
                sid: "12345"
            },
            params: {
                wmode: "window1"
            },
            attributes: {
                attrValue: "attrValue1"
            }
        });
        equal(player.config.flashVars.autoPlay, "true", "config value has precedence for autoPlay");
        equal(player.config.flashVars.sid, "12345", "config value has precedence for sid");
        equal(player.config.width, 103, "config overrides default width");
        equal(player.config.height, 104, "config overrides default height");
        equal(player.config.params.wmode, "window1", "config overrides default param");
        equal(player.config.attributes.attrValue, "attrValue1", "config overrides default attribute");
    });
    test("test version comparison", function() {
        var config = MTVNPlayer.module("config");
        ok(config.versionIsMinimum("0", "1"), "1 is greater than 0");
        ok(config.versionIsMinimum("1", "1"), "1 is equal to 1");
        ok(config.versionIsMinimum("0.1", "0.1"), "0.1 is equal to 0.1");
        ok(config.versionIsMinimum("0.1", "0.2"), "0.2 is greater than 0.1");
        ok(config.versionIsMinimum("0.1", "0.1.1"), "0.1.1 is greater than 0.1");

        ok(config.versionIsMinimum("0.1.0", "0.2.0"), "0.1.0 is greater than 0.2.0");
        ok(config.versionIsMinimum("0.1.0", "0.1.1"), "0.1.0 is greater than 0.2.0");
        ok(config.versionIsMinimum("1.0.0", "1.0.0"), "1.0.0 is equal to 1.0.0");
        ok(config.versionIsMinimum("1.0.0", "2.0.0"), "2.0.0 is greater than 1.0.0");
        ok(config.versionIsMinimum("1.0.0", "1.1.0"), "1.1.0 is greater than 1.0.0");
        ok(config.versionIsMinimum("1.0.0", "1.1.0"), "1.0.1 is greater than 1.0.0");

        ok(config.versionIsMinimum("10.1.0", "10.2.0"), "10.1.0 is greater than 10.2.0");
        ok(config.versionIsMinimum("10.1.0", "10.1.1"), "10.1.0 is greater than 10.2.0");
        ok(config.versionIsMinimum("11.0.0", "11.0.0"), "11.0.0 is equal to 11.0.0");
        ok(config.versionIsMinimum("11.0.0", "12.0.0"), "12.0.0 is greater than 11.0.0");
        ok(config.versionIsMinimum("11.0.0", "11.1.0"), "11.1.0 is greater than 11.0.0");
        ok(config.versionIsMinimum("11.0.0", "11.1.0"), "11.0.1 is greater than 11.0.0");
        ok(config.versionIsMinimum("11.0.0", "11.1.0-237"), "11.1.0-237 is greater than 11.0.0");

        ok(!config.versionIsMinimum("1", "0"), "1 is not greater than 0");
        ok(!config.versionIsMinimum("0.2", "0.1"), "0.2 is not greater than 0.1");
        ok(!config.versionIsMinimum("0.1.1", "0.1"), "0.1.1 is not greater than 0.1");

        ok(!config.versionIsMinimum("0.2.0", "0.1.0"), "0.1.0 is not greater than 0.2.0");
        ok(!config.versionIsMinimum("0.1.1", "0.1.0"), "0.1.0 is not greater than 0.2.0");
        ok(!config.versionIsMinimum("2.0.0", "1.0.0"), "2.0.0 is not greater than 1.0.0");
        ok(!config.versionIsMinimum("1.1.0", "1.0.0"), "1.1.0 is not greater than 1.0.0");
        ok(!config.versionIsMinimum("1.1.0", "1.0.0"), "1.0.1 is not greater than 1.0.0");

        ok(!config.versionIsMinimum("10.2.0", "10.1.0"), "10.1.0 is not greater than 10.2.0");
        ok(!config.versionIsMinimum("10.1.1", "10.1.0"), "10.1.0 is not greater than 10.2.0");
        ok(!config.versionIsMinimum("12.0.0", "11.0.0"), "12.0.0 is not greater than 11.0.0");
        ok(!config.versionIsMinimum("11.1.0", "11.0.0"), "11.1.0 is not greater than 11.0.0");
        ok(!config.versionIsMinimum("11.0.1", "11.0.0"), "11.0.1 is not greater than 11.0.0");
    });
    if (MTVNPlayer.isHTML5Player) {
        test("test config.flashVars for HTML5 comparison", function() {
            var Core = MTVNPlayer.module("core"),
                config = {
                    uri: "test-uri"
                };
            equal(Core.getPath(config), "http://media.mtvnservices.com/test-uri", "no flashvars works");
            config.flashVars = {
                123:"abc",
                456:"def"
            };
            equal(Core.getPath(config), "http://media.mtvnservices.com/test-uri/?flashVars=%7B%22123%22%3A%22abc%22%2C%22456%22%3A%22def%22%7D", "flashVars works");
            config.test = {
                678:"ghi",
                910:"jkl"
            };
            equal(Core.getPath(config), "http://media.mtvnservices.com/test-uri/?flashVars=%7B%22123%22%3A%22abc%22%2C%22456%22%3A%22def%22%7D&testConfig=%7B%22678%22%3A%22ghi%22%2C%22910%22%3A%22jkl%22%7D", "flashVars works");
            delete config.flashVars;
            equal(Core.getPath(config), "http://media.mtvnservices.com/test-uri/?testConfig=%7B%22678%22%3A%22ghi%22%2C%22910%22%3A%22jkl%22%7D", "flashVars works");
        });
    }
})();