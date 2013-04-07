/*globals MTVNPlayer, test, strictEqual, QUnit, ok, _ */
test("form factors", function() {
    var inputMap = {
        "0": {
            name: "zero",
            defaultValue: ["zeroDefault", "zeroDefault2"],
            value: ["one", "two"]
        },
        "10": {
            name: "ten",
            defaultValue: "10default",
            value: ["10one", "10two", "10three"]
        },
        "something": {
            name: "somethingElse",
            value: ["weird"]
        },
        "13": {
            name: "countdownTime"
        },
        "testArray": {
            name:"testArray",
            value:["one","two","three"],
            format:"array"
        },
        "11": {
            name: "outOfRange",
            value: ["f", "u", "n"]
        }
    },
    util = MTVNPlayer.require("mtvn-util"),
        result = util.mapFormFactorID("0:0", inputMap);
    strictEqual(result.zero, "one", "0:0");
    result = util.mapFormFactorID("0:1", inputMap);
    strictEqual(result.zero, "two", "0:1");
    // test default
    result = util.mapFormFactorID("1:0", inputMap);
    strictEqual(result.ten, "10default", "default");
    //
    result = util.mapFormFactorID("10:0", inputMap);
    strictEqual(result.zero.toString(), inputMap["0"].defaultValue.toString(), "default");
    //
    result = util.mapFormFactorID("testArray:0", inputMap);
    ok(_.isArray(result.testArray), "test array");
    strictEqual(result.testArray.length,1, "test array length");
    strictEqual(result.testArray[0].toString(), inputMap["testArray"].value[0].toString(), "test array");
    //
    result = util.mapFormFactorID("10:0,1", inputMap);
    strictEqual(result.ten.toString(), ["10one", "10two"].toString(), "10:0,1");
    //
    result = util.mapFormFactorID("10:2,1", inputMap);
    strictEqual(result.ten.toString(), ["10three", "10two"].toString(), "10:2,1");
    // 
    result = util.mapFormFactorID("something:0", inputMap);
    strictEqual(result.somethingElse, "weird", "something:0");
    //
    result = util.mapFormFactorID("13:30", inputMap);
    strictEqual(result.countdownTime, "30", "using value");
    // 
    QUnit.throws(

    function() {
        util.mapFormFactorID("11:5", inputMap);
    },
        "throws out of range error");
    util.formFactorIgnoreOutOfRange = true;
    try{
        util.mapFormFactorID("11:5", inputMap);
        ok(true,"ignore out of range");
    }catch(e){}
    util.formFactorIgnoreOutOfRange = false;
});