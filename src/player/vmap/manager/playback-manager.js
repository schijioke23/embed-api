/* global $, _, Modules, PlaybackManager, VMAP, ConfigManager */
/* exported VMAPPlaybackManager*/
/**
 * VMAPPlaybackManager
 * Override some of the PlaybackManager's methods.
 *
 */
var VMAPPlaybackManager = PlaybackManager.extend({
	initialize: function() {
		PlaybackManager.prototype.initialize.apply(this, arguments);
		this.player.on(Modules.Events.UNICORN_AD, this.onVMAPAd);
	},
	onVMAPAd: function(event) {
		var isContentPlaying = !_.isObject(event.data);
		this.video.setControls(isContentPlaying);
	},
	onItemReady: function() {
		if (this.loadedVMAP) {
			return;
		}
		this.loadedVMAP = true;
		var vmapURL = "http://onceux.unicornmedia.com/now/ads/vmap/od/auto/b11dbc9b-9d90-4edb-b4ab-769e0049209b/2455340c-8dcd-412e-a917-c6fadfe268c7/3a41c6e4-93a3-4108-8995-64ffca7b9106/bigbuckbunny?umtp=0&output=1";
		$.getJSON(ConfigManager.PROXY_URL + encodeURIComponent(vmapURL), this.onData);
	},
	setVideoSrc: function() {
		this.currentLoadedIndex = this.playlist.currentIndex;
		this.video.setSrc(this.vmap.uri);
		this.video.play();
	},
	onData: function(data) {
		this.vmap = VMAP.parse(data);
		this.player.trigger(Modules.Events.VMAP, this.vmap);
		this.setVideoSrc();
	}
});