/*global $, MTVNPlayer, asyncTest, ok, start, deepEqual, equal*/
(function() {
	var $ = MTVNPlayer.require("$"),
		_ = MTVNPlayer.require("_"),
		VMAP = MTVNPlayer.require("mtvn-player-test").VMAP,
		UnicornAdModel = MTVNPlayer.require("mtvn-player-test").UnicornAdModel,
		adBreakExpected = [{
			"adDuration": "00:00:30",
			"breakId": "0",
			"breakType": "linear",
			"timeOffset": "start"
		}, {
			"adDuration": "00:00:29",
			"breakId": "1",
			"breakType": "linear",
			"timeOffset": "start"
		}, {
			"adDuration": "00:00:14",
			"breakId": "2",
			"breakType": "linear",
			"timeOffset": "00:00:30.000"
		}, {
			"adDuration": "00:00:14",
			"breakId": "3",
			"breakType": "linear",
			"timeOffset": "00:00:30.000"
		}, {
			"adDuration": "00:00:29",
			"breakId": "4",
			"breakType": "linear",
			"timeOffset": "end"
		}, {
			"adDuration": "00:00:29",
			"breakId": "5",
			"breakType": "linear",
			"timeOffset": "end"
		}],
		timesExpected = [7, 15, 22, 30, 37, 44, 51, 59, 92, 96, 99, 103, 106, 110, 113, 117, 690, 697, 704, 712, 719, 726, 733, 741];
	asyncTest("vmap normalize", function() {
		$.ajax({
			url: "../data/unicorn.json",
			dataType: "json",
			success: function(data) {
				console.log("vmap-normalize-test.js:43 data", data);
				ok(VMAP, "VMAP");
				var vmap = VMAP.parse(data);
				equal(vmap.uri, "http://api01-phx.unicornmedia.com/now/stitched/mp4/b11dbc9b-9d90-4edb-b4ab-769e0049209b/2455340c-8dcd-412e-a917-c6fadfe268c7/3a41c6e4-93a3-4108-8995-64ffca7b9106/18bed8d5-15ec-40c7-8ac8-dd38db9832d9/content.mp4?oasid=9eca2d3f-2a5c-4b20-86e5-0f5e0a812307", "content uri");
				console.log("vmap-normalize-test.js:14 parsed VMAP", vmap);
				deepEqual(vmap.adBreaks, adBreakExpected);
				var model = new UnicornAdModel(vmap.adBreaks);
				console.log("vmap-normalize-test.js:48 model", model);
				// TOTAL TIMES
				equal(VMAP.formatTime(model.totalPrerollTime), "00:00:59", "totalPrerollTime");
				equal(VMAP.formatTime(model.totalPostrollTime), "00:00:58", "totalPostrollTime");
				equal(VMAP.formatTime(model.totalMidrollTime), "00:01:00", "totalMidrollTime");
				// PREROLL
				equal(model.getAd(0), model.preRollAdManager[0], "find at 0, preroll");
				equal(model.getAd(10), model.preRollAdManager[0], "find at 10, preroll");
				equal(model.getAd(30), model.preRollAdManager[0], "find at 30, preroll");
				equal(model.getAd(31), model.preRollAdManager[1], "find at 31, second preroll ad");
				equal(model.getAd(59), model.preRollAdManager[1], "find at 59,  second preroll ad");
				// MIDROLL
				equal(model.getAd(60), undefined, "find at 60, midroll ad");
				equal(model.getAd("00:01:01"), undefined, "find at 1:01, midroll ad");
				equal(model.getAd("00:01:29"), model.midRollAdManager[0], "find at 1:29, midroll ad");
				equal(model.getAd("00:01:39"), model.midRollAdManager[0], "find at 1:39, midroll ad ten seconds in");
				equal(model.getAd("00:01:44"), model.midRollAdManager[1], "find at 1:44, second midroll");
				equal(model.getAd("00:01:56"), model.midRollAdManager[1], "find at 1:57, second midroll at veery end");
				equal(model.getAd("00:01:58"), undefined, "find at 1:58, second midroll at over");
				var timedTrackers = [];
				_.each(vmap.trackers, function(tracker) {
					if (tracker.timeToFire) {
						timedTrackers.push(tracker.timeToFire);
					}
				});
				deepEqual(timedTrackers, timesExpected, "tracker times correct");
				start();
			}
		});
	});
}());