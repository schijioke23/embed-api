/*global _, Module, MTVNPlayer, Core*/
var PerformanceManager = Module.extend({
	name: "PerformanceManager",
	initialize: function() {
		if (this.player.config.performance) {
			_.bindAll(this);
			this.load = (new Date()).getTime();
			this.player.once(MTVNPlayer.Events.METADATA, this.onMetadata);
		}
	},
	onMetadata: function() {
		this.mrss = (new Date()).getTime();
		Core.processPerformance(this.player, {
			load: this.load,
			mrss: this.mrss
		});
	},
	destroy: function() {
		this.player.off(MTVNPlayer.Events.METADATA, this.onMetadata);
	}
});