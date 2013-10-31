/* global _mtvnPlayerReady, require, PackageManager, Config */
_mtvnPlayerReady.push(function(player) {
	player.on(PackageManager.Events.CC_PREFS, function(event) {
		// maybe jQuery is in the page. 
		Config.provideJQuery();
		require(["$", "mtvn-util", "mtvn-player/cc-prefs"], function($, util, ccPrefs) {
			var prefs = new ccPrefs({
				title: "Closed Captions",
				defaults: event.data
			});
			prefs.$el.css({
				position: "absolute"
			});
			prefs.$el.appendTo(player.containerElement);
			prefs.on("change", function(event) {
				player.message("updateCCPrefs", JSON.stringify(event.data));
			});
		});
	});
});