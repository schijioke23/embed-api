/* global QUnit, $, MTVNPlayer */
(function() {
    var testStart = QUnit.testStart,
        testDone = QUnit.testDone;
    QUnit.testStart = function(details) {
        console.group(details.name);
        testStart.apply(QUnit, arguments);
    };
    QUnit.testDone = function(details) {
        console.log("Qunit Test complete", details.name);
        window.MTVNPlayer.defaultConfig = {
            test: {
                freewheelEnabled: false
            }
        };
        window.MTVNPlayer.defaultEvents = undefined;
        $.each(MTVNPlayer.getPlayers(), function(index, player) {
            player.destroy();
        });
        window.MTVNPlayer.gc();
        console.groupEnd(details.name);
        testDone.apply(QUnit, arguments);
    };
})();