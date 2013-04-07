/*global MTVNPlayer, test, strictEqual, QUnit */
test("provide", function() {
    QUnit.throws(function() {
        MTVNPlayer.require("doesnthave");
    }, "throws error on require.");

    strictEqual(MTVNPlayer.has("doesnthave"), false, "has works.");
    MTVNPlayer.provide("mypackage", {
        name: "myp"
    });
    strictEqual(MTVNPlayer.has("mypackage"), true, "has works.");
    strictEqual(MTVNPlayer.require("mypackage").name,"myp","require works");
    strictEqual(MTVNPlayer.list().length,1,"list works");
    strictEqual(MTVNPlayer.list()[0],"mypackage","list works");
    MTVNPlayer.provide("mypackage", {
        name: "myp",
        version:"1.0"
    });
    strictEqual(MTVNPlayer.list()[0],"mypackage v1.0","list works");
    MTVNPlayer.provide("mypackage", {
        name: "myp",
        version:"1.0",
        build:"12:30:45 1/2/3001"
    });
    strictEqual(MTVNPlayer.list()[0],"mypackage v1.0 built:12:30:45 1/2/3001","list works");
});