/*global _, $, MTVNPlayer, require, Module, Modules, Managers, FormFactorMap, UrlProcessor */
var ConfigManager = function() {
	var CONFIG_BASE = "http://media.mtvnservices.com/pmt/e1/access/index.html?playertype=html&uri=",
		CONFIG_DEFAULTS = {
			continuousPlay: true,
			mediaGensToLoad: [0],
			tinyPlayerURL: "http://media.mtvnservices-d.mtvi.com/player/swf/TinyPlayer.swf"
		};
	return Module.extend({
		name: "ConfigManager",
		initialize: function() {
			_.bindAll(this);
			this.loadConfig(this.player.config);
		},
		/**
		 * @ignore
		 * If the config has a ready var set, don't load it.
		 * We need the ready param, or perhaps a certain set of properties can be used to determine "readiness".
		 */
		loadConfig: function(config) {
			if (config.ready) { // config is loaded.
				this.onConfig(config);
			} else {
				$.getJSON(ConfigManager.PROXY_URL + encodeURIComponent(CONFIG_BASE + config.uri), this.onConfig);
			}
		},
		/**
		 * @ignore
		 * The config is ready, let's mix it with the defaults and the player.config settings.
		 */
		onConfig: function(loadedConfig) {
			if (loadedConfig.config) { // for legacy
				loadedConfig = loadedConfig.config;
			}
			if (_.isString(loadedConfig.feed)) {
				loadedConfig.feed = UrlProcessor.feed(this.player, loadedConfig.feed);
			}
			// set the defaults.
			_.defaults(this.player.config, CONFIG_DEFAULTS);
			// the server will override the rest, but "config.test" has the final say!
			_.extend(this.player.config, loadedConfig, this.getOverrides(MTVNPlayer.defaultConfig));
			// parse form factor
			require("mtvn-util").mapFormFactorID(this.player.config.formFactorID, FormFactorMap, this.player.config);
			this.initializeModules();
		},
		/**
		 * @ignore
		 * combine the defaultConfig test value with the player.config.test value.
		 */
		getOverrides: function(defaultConfig) {
			var defaultTest = defaultConfig && defaultConfig.test ? defaultConfig.test : {};
			return _.extend(defaultTest, this.player.config.test);
		},
		/**
		 * @ignore
		 * The config is ready, let's initialize the modules.
		 */
		initializeModules: function() {
			var player = this.player;
			this.logger.log("initializeModules() config:", player.config);
			// loop through the Managers array and register them.
			_.each(Managers(), function(module) {
				player.module(module);
			});
			player.module(Modules.PLAYLIST).load();
			player.play();
		},
		destroy: function() {
			// no clean up needed
		}
	}, {
		PROXY_URL: "http://media.mtvnservices.com/player/jsonp/?callback=?&url="
	});
}();