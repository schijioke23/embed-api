/*global _, Modules, Module, Events, VMAPAdModel*/
/* exported VMAPAdManager*/
var VMAPAdManager = function() {
	var VMAPAdManager = Module.extend({
		name: "VMAPAdManager",
		currentAd: null,
		initialize: function() {
			_.bindAll(this);
			this.player.one(Modules.Events.VMAP, this.onVMAP);
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
			this.model = new VMAPAdModel(event.data);
			this.player.on(Events.PLAYHEAD_UPDATE, this.onPlayhead);
		},
		destroy:function() {
			this.player.off(Modules.Events.VMAP, this.onVMAP);
			this.player.off(Events.PLAYHEAD_UPDATE, this.onPlayhead);
		}
	});
	return VMAPAdManager;
}();