/*global MTVNPlayer, Core, UrlProcessor, _, PackageManager, $*/
// HTML5 Player Module
var ModularPlayer = {
	initialize: _.once(function() {
		var eventMap = {
			"state": MTVNPlayer.Events.STATE_CHANGE,
			"playhead": MTVNPlayer.Events.PLAYHEAD_UPDATE
		},
		PROXY_URL = "http://media.mtvnservices.com/player/jsonp/?callback=?&url=",
			moduleBase = "http://media.mtvnservices-d.mtvi.com/player/api/module/",
			CONFIG_DEFAULTS = {
				module: {
					video: {
						"$": {
							shim: true,
							url: "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
						},
						"mtvn-util": moduleBase + "mtvn-util/latest/mtvn-util.js",
						"mtvn-playlist": moduleBase + "mtvn-playlist/latest/mtvn-playlist.js",
						"mtvn-playback": moduleBase + "mtvn-playback/latest/mtvn-playback.js"
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
				console.log("modular-player.js:34 this.config", this.config);
				// $.getJSON(PROXY_URL, {
				// url: "http://media.mtvnservices.com/pmt/e1/access/index.html?playertype=html&uri=" + this.config.uri
				// }, this.onConfig);
				$.getJSON(PROXY_URL + encodeURIComponent("http://media.mtvnservices.com/pmt/e1/access/index.html?playertype=html&uri=" + this.config.uri), this.onConfig);
			},
			onConfig: function(config) {
				if (config.config) {
					config = config.config;
				}
				_.extend(this.config, CONFIG_DEFAULTS, config);
				this.config.device = "iPhone2,1"; // TODO!
				console.log("modular-player.js:42 config", config);
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
				var item = event.data;
				if (item.errorCode) {
					throw item.errorCode;
				}
				this.currentMetadata = item; // TODO check this with a multi item playlist
				if (!this.ready) {
					this.ready = true;
					this.trigger(MTVNPlayer.Events.READY);
				}
				this.playback.setSrc(item.rss.mediaGen.renditions);
				this.playback.play();
			},
			_onPlaylistReady: function() {
				this.playlistMetadata = this.playlist.metadata; // hmm, how do I keep this updated, manually?
				this.currentMetadata = this.playlistMetadata.items[0];
				this.trigger(MTVNPlayer.Events.METADATA, this.playlist.metadata);
			},
			_onPackages: function() {
				this._createPlayer();
				if (this.config.feed) {
					this._createPlaylist();
				}
			},
			_createPlayer: function() {
				var Playback = MTVNPlayer.require("mtvn-playback");
				$(this.containerElement).css({
					position: "relative" // TODO not here.
				});
				this.playback = new Playback.Html5.Player();
				this.playback.$el.css({
					width: "100%",
					height: "100%",
					position: "absolute"
				});
				$(this.playerTarget).append(this.playback.el);
				this.playback.on("state", this._proxyEvent);
				this.playback.on("playhead", this._proxyEvent);
			},
			_createPlaylist: function() {
				var Playlist = MTVNPlayer.require("mtvn-playlist");
				this.playlist = new Playlist({
					url: UrlProcessor.feed(this, this.config.feed),
					mediaGenProcessor: _.partial(UrlProcessor.mediaGen, this)
				});
				this.playlist.on(Playlist.Events.READY, this._onPlaylistReady);
				this.playlist.on(Playlist.Events.ITEM_READY, this._onItemReady);
			}
		};
	})
};