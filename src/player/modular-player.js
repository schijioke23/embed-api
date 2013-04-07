/*global MTVNPlayer, Core, MediaGen, _, PackageManager, $*/
// HTML5 Player Module
MTVNPlayer.module("modular").initialize = _.once(function() {
	var eventMap = {
		"state": MTVNPlayer.Events.STATE_CHANGE,
		"playhead": MTVNPlayer.Events.PLAYHEAD_UPDATE
	},
	PROXY_URL = "http://media.mtvnservices-d.mtvi.com/player/jsonp/?callback=?",
		moduleBase = "http://media.mtvnservices-d.mtvi.com/player/api/module/",
		CONFIG_DEFAULTS = {
			module: {
				video: {
					"$": {
						shim: true,
						url: "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
					},
					"mtvn-util": moduleBase + "mtvn-util/latest/mtvn-util.js",
					// "mtvn-playlist": moduleBase + "mtvn-playlist/latest/mtvn-playlist.js",
					"mtvn-playlist": "http://localhost:3007/dist/mtvn-playlist.js",
					// "mtvn-playback": moduleBase + "mtvn-playback/latest/mtvn-playback.js"
					"mtvn-playback": "http://localhost:3004/dist/mtvn-playback.js"
				}
			},
			// tinyPlayerURL: "http://media.mtvnservices-d.mtvi.com/player/swf/TinyPlayer.swf"
			tinyPlayerURL: "http://localhost:3004/src/flash-player/TinyPlayer.swf"
		};
	return {
		create: function() {
			_.bindAll(this);
			Core.instances.push({
				source: this.id,
				player: this
			});
			Core.executeCallbacks(this); // TODO, weird. 
			// TODO Ajax, use $ or something lighter?
			$.getJSON(PROXY_URL, {
				url: "http://media.mtvnservices-d.mtvi.com/player/api/test/data/config.json"
			}, this.onConfig);
		},
		onConfig: function(config) {
			_.extend(this.config, CONFIG_DEFAULTS, config);
			this.loadPackages();
		},
		loadPackages: function() {
			// let's see if it's in page before we load it.
			PackageManager.provideJQuery();
			MTVNPlayer.loadPackages(this.config.module.video, this._onPackages);
		},
		message: function(message) {
			var args = _.toArray(arguments);
			if (!this.playback[message]) {
				throw message + " not implemented.";
			}
			return this.playback[message].apply(this.playback, _.rest(args));
		},
		destroy: function() {},
		isPaused: function() {
			return this.playback.isPaused();
		},
		_proxyEvent: function(event) {
			this.trigger(eventMap[event.type] || event.type, event.data);
		},
		_onItemReady: function(event) {
			var item = event.data,
				Playback = MTVNPlayer.require("mtvn-playback"),
				// GUI = MTVNPlayer.require("mtvn-playback-gui",true),
				playbackConfig = _.pick(this.config, ["width", "height", "params", "attributes"]);
			// playbackConfig.el = this.playerTarget;
			if (item.errorCode) {
				throw item.errorCode;
			}
			playbackConfig.playerUrl = this.config.tinyPlayerURL;
			$(this.containerElement).css({
				position: "relative"
			}); // TODO not here.
			this.playback = new Playback.Html5.Player(playbackConfig);
			$(this.playback.el).width("100%").height("100%");
			$(this.playerTarget).append(this.playback.el);
			$(this.playback.el).css({
				position: "absolute"
			}); // TODO not here.
			/*if (GUI) {
				this.gui = new GUI({
					el: this.containerElement,
					player: this
				});
			}*/
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
			this.currentMetadata = this.playlistMetadata.items[0];
			this.trigger(MTVNPlayer.Events.METADATA, this.playlist.metadata);
		},
		_onPackages: function() {
			MTVNPlayer.require("Backbone").$ = MTVNPlayer.require("$");
			if (this.config.feed) {
				var Playlist = MTVNPlayer.require("mtvn-playlist");
				var playlistConfig = {
					url: this.config.feed,
					mediaGenProcessor: _.partial(MediaGen.process, this)
				};
				this.playlist = new Playlist(playlistConfig);
				this.playlist.on(Playlist.Events.READY, this._onPlaylistReady);
				this.playlist.on(Playlist.Events.ITEM_READY, this._onItemReady);
			} else {
				console.warn("modular-player.js no feed");
			}
		}
	};
});