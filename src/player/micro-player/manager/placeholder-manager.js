/* global _, Module, Events*/
/* exported PlaceholderManager */
var PlaceholderManager = Module.extend({
	initialize: function() {
		_.bindAll(this);
		this.player.on(Events.PLAYLIST_COMPLETE, this.onPlaylistComplete);
	},
	onPlaylistComplete: function() {
		this.player.$el.trigger("MTVNPlayer:showPlaceholder");
	},
	destroy: function() {
		this.player.off(Events.PLAYLIST_COMPLETE, this.onPlaylistComplete);
	}
});