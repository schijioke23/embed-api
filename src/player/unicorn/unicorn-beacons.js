/*global $, _, Module, Modules, Events, PlayState, UnicornAdManager*/
var UnicornBeacons = Module.extend({
	name: "UnicornBeacons",
	initialize: function() {
		_.bindAll(this);
		this.player.on(Modules.Events.VMAP, this.onVMAP);
		this.adManager = this.player.module(UnicornAdManager);
	},
	breakIdsMatch: function(id) {
		if (this.adManager.isPlayingAd()) {
			return this.adManager.currentAd.breakId === id;
		}
		return false;
	},
	fire: function(tracker, event) {
		if (this.breakIdsMatch(tracker.breakId)) {
			this.logger.log("tracker", tracker.event || tracker.timeToFire, tracker.url);
			$.ajax({
				type: 'POST',
				url: tracker.url
			});
		} else {
			console.warn("unicorn-beacons.js:23 tracker", tracker, event.data, this.adManager.isPlayingAd(), this.adManager.currentAd);
		}
	},
	onVMAP: function(event) {
		this.trackers = event.data.trackers;
		_.each(this.trackers, function(tracker) {
			// tracker event.
			var fireTracker = _.partial(this.fire, tracker);
			// timer trackers use playhead
			if (tracker.timeToFire) {
				this.player.once(Events.PLAYHEAD_UPDATE + ":" + tracker.timeToFire, fireTracker);
			} else {
				// other tracker events
				switch (tracker.event) {
					case "pause":
						this.player.on(Events.STATE_CHANGE + ":" + PlayState.PAUSED, fireTracker);
						break;
					case "play":
						this.player.on(Events.STATE_CHANGE + ":" + PlayState.PLAYING, fireTracker);
						break;
					default:
						break;
				}
			}
		}, this);
	}
});