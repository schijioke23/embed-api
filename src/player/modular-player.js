/*global MTVNPlayer, Core, _, PackageManager, $*/
// HTML5 Player Module
MTVNPlayer.module("modular").initialize = _.once(function() {
	var eventMap = {
		"state": MTVNPlayer.Events.STATE_CHANGE,
		"playhead": MTVNPlayer.Events.PLAYHEAD_UPDATE
	},
	moduleBase = "http://media.mtvnservices-d.mtvi.com/player/api/module/",
		jsPlayer = {
			isPaused:function() {
				return this.playback.isPaused();
			},
			_proxyEvent: function(event) {
				this.trigger(eventMap[event.type] || event.type, event.data);
			},
			_onItemReady: function(event) {
				var item = event.data,
					Playback = MTVNPlayer.require("mtvn-playback"),
					GUI = MTVNPlayer.require("mtvn-playback-gui"),
					playbackConfig = _.pick(this.config, ["width", "height", "params", "attributes"]);
				playbackConfig.el = this.playerTarget;
				playbackConfig.playerUrl = this.config.tinyPlayerURL;
				$(this.containerElement).css({
					position: "relative"
				}); // TODO not here.
				this.playback = new Playback.Flash.Player(playbackConfig);
				$(this.playback.el).css({
					position: "absolute"
				}); // TODO not here.
				if (GUI) {
					this.gui = new GUI({
						el: this.containerElement,
						player: this
					});
				}
				this.currentMetadata = item; // TODO check this
				this.ready = true;
				this.trigger(MTVNPlayer.Events.READY);
				this.playback.setSrc(item.rss.mediaGen.renditions);
				this.playback.on("state", this._proxyEvent);
				this.playback.on("playhead", this._proxyEvent);
				this.playback.play();
			},
			_onPlaylistReady: function() {
				this.playlistMetadata = this.playlist.metadata; // hmm, how do I keep this updated, manually?
				this.trigger(MTVNPlayer.Events.METADATA, this.playlist.metadata);
			},
			_onPackages: function() {
				if (this.config.feed) {
					var Playlist = MTVNPlayer.require("mtvn-playlist");
					this.playlist = new Playlist({
						url: this.config.feed
					});
					this.playlist.on(Playlist.Events.READY, this._onPlaylistReady);
					this.playlist.on(Playlist.Events.ITEM_READY, this._onItemReady);
				} else {
					console.warn("modular-player.js no feed");
				}
			}
		};
	// INITIALIZATION
	_.extend(this, {
		// create runs in the scope of a player because it's called with apply.
		// TODO could definitely clean this up, so confusing.
		create: function() {
			_.extend(this, jsPlayer); // Use object defined above
			_.bindAll(this);
			Core.instances.push({
				source: this.id,
				player: this
			});
			_.defaults(this.config, {
				feed: "http://media.mtvnservices-d.mtvi.com/player/api/test/data/feed.xml",
				module: {
					video: {
						"$": {
							shim: true,
							url: "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
						},
						"mtvn-util": moduleBase + "mtvn-util/latest/mtvn-util.js",
						"mtvn-playlist": moduleBase + "mtvn-playlist/latest/mtvn-playlist.js",
						// "mtvn-playback-gui": "http://localhost:8008/build/mtvn-playback-gui.js",
						// "mtvn-gui-css": "http://localhost:8008/src/css/style.css",
						// "mtvn-playlist": "http://localhost:3007/dist/mtvn-playlist.js",
						"mtvn-playback": moduleBase + "mtvn-playback/latest/mtvn-playback.js"
						// "mtvn-playback": "http://localhost:3004/dist/mtvn-playback.js"

					}
				},
				// tinyPlayerURL: "http://media.mtvnservices-d.mtvi.com/player/swf/TinyPlayer.swf"
				tinyPlayerURL: "http://localhost:3004/src/flash-player/TinyPlayer.swf"
			});
			Core.executeCallbacks(this);
			// let's see if it's in page before we load it.
			PackageManager.provideJQuery();
			MTVNPlayer.loadPackages(this.config.module.video, this._onPackages);
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