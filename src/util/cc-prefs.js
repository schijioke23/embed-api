/* global _mtvnPlayerReady, require, PackageManager, Config */
_mtvnPlayerReady.push(function(player) {
	player.on(PackageManager.Events.CC_PREFS, function(event) {
		// maybe jQuery is in the page. 
		Config.provideJQuery();
		require(["$", "mtvn-util", "mtvn-player/cc-prefs"], function($, util, CCPrefs) {
			var $player = $(player.element),
				prefs = new CCPrefs({
					defaults: event.data,
					css: {
						position: "absolute",
						width: $player.width(),
						height: $player.height()
					}
				});
			prefs.$el.appendTo(player.containerElement);
			prefs.on(CCPrefs.Events.CHANGE, function(event) {
				player.message("updateCCPrefs", JSON.stringify(event.data));
			});
		});
	});
});