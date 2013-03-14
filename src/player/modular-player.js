/*global MTVNPlayer, Core, _*/
// HTML5 Player Module
MTVNPlayer.module("modular").initialize = _.once(function() {
	var tinyPlayer = "http://media.mtvnservices-d.mtvi.com/player/swf/TinyPlayer.swf",
		eventMap = {
			"state": MTVNPlayer.Events.STATE_CHANGE,
			"playhead": MTVNPlayer.Events.PLAYHEAD_UPDATE
		};
	var jsPlayer = {
		proxyEvent: function(event) {
			this.trigger(eventMap[event.type] || event.type, event.data);
		},
		onItemReady: function(event) {
			var item = event.data,
				Playback = MTVNPlayer.require("mtvn-playback");
			this.playback = new Playback.Flash.Player({
				width: this.config.width,
				height: this.config.height,
				playerUrl: tinyPlayer,
				el: this.playerTarget
			});
			// for now, just pass in the first rendition.
			this.playback.setSrc(item.rss.mediaGen.renditions[0].src);
			this.ready = true;
			this.playback.on("state", this.proxyEvent);
			this.playback.on("playhead", this.proxyEvent);
			this.playback.play();
		},
		onPlaylistReady: function() {
			this.trigger(MTVNPlayer.Events.METADATA, this.playlist.metadata);
		},
		onPackages: function() {
			var Playlist = MTVNPlayer.require("mtvn-playlist");
			this.playlist = new Playlist({
				url: this.config.feed
			});
			this.playlist.on(Playlist.Events.READY, this.onPlaylistReady);
			this.playlist.on(Playlist.Events.ITEM_READY, this.onItemReady);
		}
	};
	_.extend(this, {
		// create runs in the scope of a player because it's called with apply.
		// could definitely clean this up.
		create: function() {
			_.extend(this, jsPlayer);
			_.bindAll(this);
			Core.instances.push({
				source: this.id,
				player: this
			});
			MTVNPlayer.loadPackages(this.config.module.video, this.onPackages);
		},
		message: function(message) {
			var args = _.toArray(arguments);
			switch (message) {
				case "exitFullScreen":
					this.playback.exitFullScreen();
					return;
				case "goFullScreen":
					this.playback.goFullScreen();
					return;
				default:
					break;
			}
			return this.playback[message].apply(this.playback, _.rest(args));
		},
		destroy: function() {}
	});
});