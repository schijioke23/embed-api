/*global MTVNPlayer, test, asyncTest, expect, equal, ok, start, deepEqual*/
test("template test", function() {
    var util = MTVNPlayer.require("mtvn-util");
    equal(util.template("http://media.mtvnservices.com/{uri}", {
        uri: "12345"
    }), "http://media.mtvnservices.com/12345", "one value");
    equal(util.template("{uri} and {uri}", {
        uri: "12345"
    }), "12345 and 12345", "one value");
    equal(util.template("{{uri}} and {{uri}}", {
        uri: "12345"
    }), "12345 and 12345", "using handlebars in template value");
    equal(util.template("{uri} and {uri2}", {
        uri: "12345",
        uri2: "4567"
    }), "12345 and 4567", "one value");
    equal(util.template("{uri3} and {uri2}", {
        uri: "12345",
        uri2: "4567"
    }), " and 4567", "empty value is cleared");
    equal(util.template("{nested.nest1} {nested2.nest2}", {
        nested: {
            nest1: "nested value"
        },
        nested2: {
            nest2: "nested value 2"
        }
    }), "nested value nested value 2", "nested value");
    equal(util.template("{nested.nest1.nestedDeep1}", {
        nested: {
            nest1: {
                nestedDeep1: "nested deep value"
            }
        }
    }), "nested deep value", "nested deep value");
});
test("template pass object", function() {
    var util = MTVNPlayer.require("mtvn-util"),
        data = util.template({
            template1: "{test1}",
            template2: "{test2}"
        }, {
            test1: "test1",
            test2: "test2"
        });
    equal(data.template1, "test1", "test passing object");
    equal(data.template2, "test2", "test passing object");
});
test("template passing specific keys", function() {
    var util = MTVNPlayer.require("mtvn-util"),
        data = util.template({
            template1: "{test1}",
            template2: "{test2}"
        }, {
            test1: "test1",
            test2: "test2"
        },["template1"]);
    equal(data.template1, "test1", "test passing object");
    equal(data.template2, "{test2}", "test passing object");
});
test("template alterations", function() {
    var util = MTVNPlayer.require("mtvn-util"),
        uri = "mgid:uma:video:mtv.com:661024",
        data = util.buildTemplateData({
            config: {
                uri: uri
            }
        });
    equal(util.template("{uri}", data), uri, "test uri");
    equal(util.template("hi {uri}", data), "hi " + uri, "test uri");
    equal(util.template("hi {uri.id}", data), "hi 661024", "test uri.id");
});
test("template data", function() {
    var util = MTVNPlayer.require("mtvn-util");
    var player = {
        config: {
            uri: "mgid:uma:video:mtv.com:661024",
            width: 360,
            height: 480
        },
        currentMetadata: {
            rss: {
                title: "title"
            }
        },
        playlistMetadata: {
            link: "link"
        }
    };
    var result = util.buildTemplateData(player);
    equal(result.uri, "mgid:uma:video:mtv.com:661024", "test uri");
    equal(result.uriParts.namespace, "mtv.com", "test namespace");
    equal(result.uriParts.id, "661024", "test id");
    equal(result.metadata.rss.title, "title", "test metadata");
    equal(result.playlistMetadata.link, "link", "test playlist metadata");
    equal(result.app.width, 360, "test app.width");
    equal(result.app.height, 480, "test app.height");
    result = util.buildTemplateData(player, {
        extraData: 1234,
        deepExtra: {
            deep: 4567
        }
    });
    equal(result.extraData, 1234, "extra data to augment config");
    equal(result.deepExtra.deep, 4567, "extra data to augment config");
});
