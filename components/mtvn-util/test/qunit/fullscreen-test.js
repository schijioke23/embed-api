/*global MTVNPlayer, test, asyncTest, expect, equal, ok, start, deepEqual*/
(function() {
	"use strict";
	var FullScreen = MTVNPlayer.require("mtvn-util").FullScreen;
	// TODO want to write real tests,but can't trigger fullscreen programatically.
	/*test("fullscreen test", function() {
		FullScreen.once(FullScreen.Events.FULL_SCREEN_CHANGE, function(event) {
			equal(event.data, true, "is full screen");
		});
		FullScreen.trigger(FullScreen.Events.FULL_SCREEN_CHANGE, {
			data: true
		});
		FullScreen.once(FullScreen.Events.FULL_SCREEN_CHANGE, function(event) {
			equal(event.data, false, "is full screen");
		});
		FullScreen.trigger(FullScreen.Events.FULL_SCREEN_CHANGE, {
			data: false
		});
	});*/
})();