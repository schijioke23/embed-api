/*global _, Module, MTVNPlayer, Core*/
var PerformanceManager = Module.extend({
	name: "PerformanceManager",
	initialize: function() {
		_.bindAll(this);
		this.load = (new Date()).getTime();
		this.player.once(MTVNPlayer.Events.METADATA, this.onMetadata);
	},
	onMetadata: function() {
		this.mrss = (new Date()).getTime();
		Core.processPerformance(this.player, {
			load: this.load,
			mrss: this.mrss
		});
	}
});