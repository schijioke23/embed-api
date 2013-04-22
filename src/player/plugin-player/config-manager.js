/*global _, $, MTVNPlayer, require, Module, PlayState, PackageManager, FormFactorMap, UrlProcessor, UserManager, ClosedCaptionManager, BentoManager, PlaybackManager, APIManager, Modules*/
var ConfigManager = function() {
	var moduleBase = "http://media.mtvnservices-d.mtvi.com/player/api/module/",
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
			mediaGensToLoad:[0],
			tinyPlayerURL: "http://media.mtvnservices-d.mtvi.com/player/swf/TinyPlayer.swf"
		};
	return Module.extend({
		name: "ConfigManager",
		initialize: function() {
			_.bindAll(this);
			$.getJSON(ConfigManager.PROXY_URL + encodeURIComponent("http://media.mtvnservices.com/pmt/e1/access/index.html?playertype=html&uri=" + this.player.config.uri), this.onConfig);
		},
		onConfig: function(config) {
			if (config.config) {
				config = config.config;
			}
			_.extend(config, CONFIG_DEFAULTS, config);
			config.device = "iPhone2,1"; // TODO!
			this.player.config = config;
			this.loadPackages();
		},
		loadPackages: function() {
			// let's see if it's in page before we load it.
			PackageManager.provideJQuery();
			this.logger.log("loadPackages()");
			MTVNPlayer.loadPackages(this.player.config.module.video, this.initializeModules);
		},
		initializeModules: function() {
			var player = this.player,
				config = player.config;
			// parse form factor
			require("mtvn-util").mapFormFactorID(config.formFactorID, FormFactorMap, config);
			this.logger.log("initializeModules()", config);
			// Playlist Module
			if (config.feed) {
				var Playlist = require("mtvn-playlist");
				player.module(Modules.PLAYLIST, new Playlist({
					url: UrlProcessor.feed(player, config.feed),
					mediaGenProcessor: _.partial(UrlProcessor.mediaGen, player),
					mediaGensToLoad:config.mediaGensToLoad
				}));
			}
			// User 
			player.module(Modules.USER, UserManager);
			// Bento Module
			if (MTVNPlayer.has("bento")) {
				player.module(Modules.BENTO, BentoManager);
			}
			// CC This needs to be in the GUI Tier
			// if(config.ccEnabled){
			// player.module(Modules.CC, ClosedCaptionManager);
			// }
			// Video Manager Module
			player.module(Modules.PLAYBACK_MANAGER, PlaybackManager);
			// API Manager
			player.module(Modules.API, APIManager);
			// TODO for testing.
			player.play();
		}
	}, {
		PROXY_URL: "http://media.mtvnservices.com/player/jsonp/?callback=?&url=",
		SHARED_VIDEO_ELEMENT: null
	});
}();