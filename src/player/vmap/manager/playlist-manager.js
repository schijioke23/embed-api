/* global $, _, require, ConfigManager, VMAP, Modules, Logger, Modules */
/* exported VMAPPlaylistManager */
var VMAPPlaylistManager = function() {
	var Playlist = require("mtvn-util").Playlist,
		MEDIA_GEN_URL = "http://media-utils.mtvnservices.com/services/MediaGenerator/{{uri}}/?ovp=unicorn&catalogId={{catalogId}}&appId={{appId}}&formatter=json";
	return Playlist.extend({
		initialize: function() {
			Playlist.prototype.initialize.apply(this, arguments);
			this.logger = new Logger("MTVNPlayer.VMAPPlaylistManager");
			// a very lightweight metadata object.
			// could be augmented with perhaps a "config 2.0".
			this.currentItem = {
				ready: false,
				rss: {
					guid: this.options.player.config.uri,
					mediaGen: {}
				}
			};
			this.metadata = {
				items: [this.currentItem]
			};
		},
		load: function() {
			this.loadItem(0);
		},
		loadItem: function(index) {
			var itemToLoad = this.getItemAt(index);
			this.logger.log("load item at index:" + index + ".");
			if (itemToLoad.loading) {
				return;
			}
			var config = this.options.player.config,
				vmapURL = config.vmapURL || require("mtvn-util").template(MEDIA_GEN_URL, {
					uri: config.uri,
					catalogId: config.catalogId || "e29ee798-7875-49ea-a494-0499c7a5c92c",
					appId: config.appId || "3bf73aa4-3cf1-4ba1-a9c1-ed6337c81896"
				});
			if (!config.catalogId || !config.appId) {
				this.logger.warn("in test mode, missing catalogId or appId", config);
			}
			this.logger.log("VMAP url or MediaGen url", vmapURL);
			// not sure if this is used.
			itemToLoad.loading = true;
			// Wait till load is invoked to dispatch Playlist.Events.READY
			this.trigger(Playlist.Events.READY, {
				target: this,
				type: Playlist.Events.READY,
				data: this.metadata
			});
			this.request = $.getJSON(ConfigManager.PROXY_URL + encodeURIComponent(vmapURL), _.partial(this.onData, index));
		},
		onData: function(index, data) {
			// pull VMAP from media gen JSON.
			var vmap = data.package ? data.package.item.vmap : data;
			// if it's not an object, and it's a string, we have an error.
			if (_.isString(vmap)) {
				alert(vmap);
				return;
			}
			vmap = VMAP.parse(vmap);
			// VMAP ready.
			this.options.player.trigger(Modules.Events.VMAP, vmap);
			var loadedItem = this.getItemAt(index);
			loadedItem.loading = false;
			loadedItem.ready = true;
			loadedItem.rss.mediaGen.renditions = vmap.uri;
			this.trigger(Playlist.Events.ITEM_READY, {
				target: this,
				type: Playlist.Events.ITEM_READY,
				data: loadedItem
			});
		},
		destroy:function() {
			if(this.request){
				this.request.abort();
			}
		}
	}, {
		NAME: Modules.PLAYLIST
	});
}();