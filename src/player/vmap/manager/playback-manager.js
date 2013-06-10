/* global _, PlaybackManager, Modules */
/* exported VMAPPlaybackManager*/
/**
 * VMAPPlaybackManager
 * Override some of the PlaybackManager's methods.
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
		this.setVideoSrc();
	},
	setVideoSrc: function() {
		this.currentLoadedIndex = this.playlist.currentIndex;
		this.video.setSrc(this.getRenditions());
		this.video.play();
	}
});