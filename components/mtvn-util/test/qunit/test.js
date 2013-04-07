/*global MTVNPlayer test equal */
(function() {
    test("class inheritance", function() {
        var Class = function() {
                this.constructorWorked = true;
            }, Class2;
        Class.prototype = {
            testFunc: function() {
                return "works";
            }
        };
        Class.extend = MTVNPlayer.require("mtvn-util").extend;
        Class2 = Class.extend({
            class2Func: function() {
                return "class 2 func";
            }
        });
        equal((new Class2()).testFunc(), "works", "inheritance works");
        equal((new Class2()).constructorWorked, true, "property set in constructor works");
        equal((new Class2()).class2Func(), "class 2 func", "class 2 has a new function");
        var Class3 = Class.extend({
            testFunc: function() {
                return "override testFunc";
            }
        });
        equal((new Class3()).testFunc(), "override testFunc", "overriden testFunc");
        equal(Class3.__super__.testFunc(), "works", "overriden testFunc super works");
    });
})();