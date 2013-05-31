/*global _, Module, UrlProcessor, require, Events, PackageManager*/
var EndScreenManager = Module.extend({
	name: "EndScreenManager",
	initialize: function() {
		_.bindAll(this);
		this.player.on(Events.PLAYLIST_COMPLETE, this.loadFeed);
	},
	loadFeed: function() {
		var Playlist = require("mtvn-playlist");
		var playlist = new Playlist(),
			feed = this.player.config.relatedFeedURL;
		if (_.isString(feed)) {
			feed = UrlProcessor.feed(this.player, feed);
		}
		this.logger.info("loadFeed", feed);
		if (feed) {
			playlist.load({
				feed: feed,
				mediaGenProcessor: _.partial(UrlProcessor.mediaGen, this.player),
				mediaGensToLoad: []
			});
			playlist.once(Playlist.Events.READY, this.onPlaylistReady);
		}
	},
	onPlaylistReady: function(event) {
		var config = {
			upNext:{
				items:event.data.items
			}
		};
		this.player.trigger(PackageManager.Events.ENDSLATE,config);
	},
	destroy:function() {
		this.player.off(Events.PLAYLIST_COMPLETE, this.loadFeed);
	},
	onMetadata: function() {}
});