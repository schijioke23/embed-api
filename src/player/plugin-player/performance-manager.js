/*global _, Module, MTVNPlayer*/
var PerformanceManager = Module.extend({
	name: "PerformanceManager",
	initialize: function() {
		_.bindAll(this);
		this.load = (new Date()).getTime();
		this.player.once(MTVNPlayer.Events.METADATA, this.onMetadata);
	},
	onMetadata: function() {
		this.mrss = (new Date()).getTime();
		this.player.trigger(MTVNPlayer.Events.PERFORMANCE, {
			load: this.load,
			mrss: this.mrss
		});
	}
});