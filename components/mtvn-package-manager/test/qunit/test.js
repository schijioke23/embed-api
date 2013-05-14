/*global MTVNPlayer, test, strictEqual, QUnit, asyncTest, ok, start*/
test("provide", function() {
    QUnit.throws(function() {
        MTVNPlayer.require("doesnthave");
    }, "throws error on require.");

    strictEqual(MTVNPlayer.has("doesnthave"), false, "has works.");
    MTVNPlayer.provide("mypackage", {
        name: "myp"
    });
    strictEqual(MTVNPlayer.has("mypackage"), true, "has works.");
    strictEqual(MTVNPlayer.require("mypackage").name, "myp", "require works");
});
asyncTest("async loading", function() {
    var callbacks = 0;

    function shouldStart() {
        if (callbacks >= 3) {
            start();
        }
    }
    var callback = function() {
        ok(MTVNPlayer.has("_"), "loaded _");
        ok(MTVNPlayer.has("mtvn-playlist"), "loaded mtvn-playlist");
        ok(MTVNPlayer.has("mtvn-util"), "loaded mtvn-util");
        ok(MTVNPlayer.has("$"), "loaded $");
        callbacks++;
        shouldStart();
    };
    var callback2 = function() {
        ok(MTVNPlayer.has("_"), "loaded _");
        ok(MTVNPlayer.has("mtvn-playlist"), "loaded mtvn-playlist");
        callbacks++;
        shouldStart();
    };
    var callback3 = function() {
        ok(MTVNPlayer.has("endslate"), "loaded endslate");
        callbacks++;
        shouldStart();
    };
    MTVNPlayer.loadPackages({
        "_": {
            shim: true,
            url: "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js"
        },
        "$": {
            shim: true,
            url: "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
        },
        "mtvn-util": {
            url: "http://media.mtvnservices-d.mtvi.com/player/api/module/mtvn-util/0.1.0/mtvn-util.js"
        },
        "some-css": "http://media.mtvnservices-d.mtvi.com/player/api/module/endslate/0.2.4/style.css",
        "mtvn-playlist": "http://media.mtvnservices-d.mtvi.com/player/api/module/mtvn-playlist/latest/mtvn-playlist.js"
    }, callback);
    MTVNPlayer.loadPackages({
        "_": {
            shim: true,
            url: "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js"
        },
        "mtvn-playlist": "http://media.mtvnservices-d.mtvi.com/player/api/module/mtvn-playlist/latest/mtvn-playlist.js"
    }, callback2);
    MTVNPlayer.loadPackages({
        "endslate": "http://media.mtvnservices-d.mtvi.com/player/api/module/endslate/0.2.4/endslate.js"
    }, callback3);
});
test("optional", function() {
    QUnit.throws(function() {
        MTVNPlayer.require("doesnthave");
    }, "throws error on require.");

    try {
        MTVNPlayer.require("doesnthave", true);
        ok(true, "optional works");
    } catch (e) {
        ok(false, "optional fails");
    }
});

asyncTest("package callback async", function() {
    MTVNPlayer.onPackage("testPackageCallback1", function(pkg) {
        ok(pkg, "package not null");
        start();
    });
    MTVNPlayer.loadPackages({
        "testPackageCallback1": {
            shim: true,
            exports: "qwery",
            url: "http://cdnjs.cloudflare.com/ajax/libs/qwery/3.4.1/qwery.js"
        }
    }, function() {});
});

asyncTest("global scope", function() {
    MTVNPlayer.loadPackages({
        "testObj": {
            global: true,
            url: "testObj.js"
        }
    }, function() {
        ok(window.testObj, "testObj is in global scope");
        start();
    });
});

test("package callback, package already loaded", function() {
    MTVNPlayer.provide("testPackageCallback2", {});
    MTVNPlayer.onPackage("testPackageCallback2", function(pkg) {
        ok(pkg, "package not null");
    });
    MTVNPlayer.onPackage("testPackageCallback3", function(pkg) {
        ok(pkg, "package not null, fired on provide");
    });
    MTVNPlayer.onPackage("testPackageCallback3", function(pkg) {
        ok(pkg, "package not null, fired on provide second time");
    });
    MTVNPlayer.provide("testPackageCallback3", {});
});