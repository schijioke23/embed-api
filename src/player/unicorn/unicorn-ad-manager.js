/*global _, Modules, Module, Events, UnicornAdModel*/
var UnicornAdManager = function() {
	var UnicornAdManager = Module.extend({
		name: "UnicornAdManager",
		currentAd: null,
		initialize: function() {
			_.bindAll(this);
			this.player.on(Modules.Events.VMAP, this.onVMAP);
			this.player.on(Events.PLAYHEAD_UPDATE, this.onPlayhead);
		},
		isPlayingAd: function() {
			return _.isObject(this.currentAd);
		},
		onPlayhead: function(event) {
			var currentTime = Math.round(event.data);
			var ad = this.model.getAd(currentTime);
			if (this.currentAd != ad) {
				this.currentAd = ad;
				this.updateLog(currentTime);
				// these events would be used to update the UI.
				this.player.trigger(Modules.Events.UNICORN_AD, this.currentAd);
			}
		},
		updateLog: function(currentTime) {
			var ad = this.currentAd;
			if (ad) {
				this.logger.log("playing " + ad.type, ad.breakId, "at:" + currentTime);
			} else {
				this.logger.log("playing content at:", currentTime);
			}
		},
		onVMAP: function(event) {
			this.model = new UnicornAdModel(event.data);
		}
	});
	return UnicornAdManager;
}();