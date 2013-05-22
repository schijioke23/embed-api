/* global $, _, Module, Modules, Events, PlayState, VMAPAdManager*/
/* exported VMAPTrackerManager */
var VMAPTrackerManager = Module.extend({
	name: "VMAPTrackerManager",
	initialize: function() {
		_.bindAll(this);
		this.player.on(Modules.Events.VMAP, this.onVMAP);
		this.adManager = this.player.module(VMAPAdManager);
	},
	breakIdsMatch: function(id) {
		if (this.adManager.isPlayingAd()) {
			return this.adManager.currentAd.breakId === id;
		}
		return false;
	},
	fire: function(tracker, event) {
		if (this.breakIdsMatch(tracker.breakId)) {
			this.logger.log("tracker", tracker.event || tracker.timeToFire, tracker.url, this.player.playhead);
			$.ajax({
				type: 'POST',
				url: tracker.url
			});
		} else if (tracker.timeToFire) {
			this.logger.warn("ad tracker fired but no ad was found", tracker, event.data, this.adManager.isPlayingAd(), this.adManager.currentAd);
		}
	},
	onVMAP: function(event) {
		var isMuted = this.player.volume() === 0;
		this.trackers = event.data.trackers;
		_.each(this.trackers, function(tracker) {
			// tracker event.
			var fireTracker = _.partial(this.fire, tracker);
			// timer trackers use playhead
			if (tracker.timeToFire) {
				this.player.once(Events.PLAYHEAD_UPDATE + ":" + tracker.timeToFire, fireTracker);
			} else {
				// TODO! other tracker events
				switch (tracker.event) {
					case "pause":
						this.player.on(Events.STATE_CHANGE + ":" + PlayState.PAUSED, fireTracker);
						break;
					case "resume":
						this.player.on(Events.STATE_CHANGE + ":" + PlayState.PLAYING, fireTracker);
						break;
					case "mute":
						this.player.on(Events.VOLUME_CHANGE, function(event) {
							if (event.data === 0) {
								isMuted = true;
								fireTracker();
							}
						});
						break;
					case "unmute":
						this.player.on(Events.VOLUME_CHANGE, function(event) {
							if (event.data > 0 && isMuted) {
								isMuted = false;
								fireTracker();
							}
						});
						break;
					default:
						break;
				}
			}
		}, this);
	}
});