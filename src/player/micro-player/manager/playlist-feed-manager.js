/* global _, UrlProcessor, require*/
/* exported PlaylistManager */
var PlaylistFeedManager = function(){
	var Playlist = require("mtvn-util").Playlist;
	PlaylistFeedManager = Playlist.extend({
		initialize: function() {
			Playlist.prototype.initialize.apply(this, arguments);
			var player = this.options.player;
			this.load({
				feed: player.config.feed,
				mediaGenProcessor: _.partial(UrlProcessor.mediaGen, player),
				mediaGensToLoad: player.config.mediaGensToLoad
			});
		}
	});
};