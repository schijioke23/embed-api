/*global _, $, Module, Modules, BentoManager, require, Events, PlayState, UserManager, BTG, PlaybackManager*/
/* exported BentoPlaybackManager */
var BentoPlaybackManager = PlaybackManager.extend({
	initialize: function() {
		PlaybackManager.prototype.initialize.apply(this, arguments);
		// Bento
		this.bentoManager = BTG && BTG.Bento ? this.player.module(BentoManager) : {
			// dummy method
			isItTimeForAnAd: function() {
				return false;
			}
		};
	},
	play: function(startTime) {
		if (this.player.module(UserManager).isOk()) {
			// reset the queued start time.
			this.queuedStartTime = 0;
			// the item we're trying to play.
			var currentItem = this.playlist.currentItem;
			// TODO we should load the ad even if we haven't loaded the media gen!
			// it's been loaded.
			if (currentItem.ready) {
				// check the media gen for errors.
				if (this.hasError(currentItem)) {
					return;
				}
				if (this.checkForAd() && this.bentoManager.isItTimeForAnAd()) {
					this.queuedStartTime = startTime;
					this.playAd();
				} else {
					this.playItem(currentItem);
				}
			} else {
				this.loadNewMediaGen(startTime);
			}
		}
	},
	playAd: function() {
		// this will only be invoked if BTG.Bento exists.
		this.logger.log("play ad");
		this.player.once(Events.AD_COMPLETE, this.onAdComplete);
		this.isPlayingAd = true;
		this.video.activeEvents = PlaybackManager.AD_EVENTS;
		this.video.delegateEvents();
		this.currentLoadedIndex = -1;
		this.player.trigger(Modules.Events.AD_WILL_PLAY);
		this.bentoManager.playAd();
	},
	onAdComplete: function() {
		this.player.trigger(Events.PLAYHEAD_UPDATE, 0);
		// this.player.trigger(Events.BUFFER,0);
		this.isPlayingAd = false;
		this.video.resetEvents();
		this.logger.log("onAdComplete() " + (this.afterAdPlayNextVideo ? "post" : "pre") + "roll");
		if (this.afterAdPlayNextVideo) {
			this.afterAdPlayNextVideo = false;
			this.playNextVideo();
		} else {
			this.play(this.queuedStartTime);
		}
	},
	onMediaEnd: function() {
		// should never fire for ads.
		this.player.trigger(Events.MEDIA_END);
		if (this.bentoManager && this.bentoManager.isItTimeForAnAd()) {
			this.logger.log("onMediaEnd() play post roll.");
			this.afterAdPlayNextVideo = true;
			this.playAd();
		} else {
			if (!this.player.config.continuousPlay) {
				this.logger.log("onMediaEnd() don't play next. wait for API input");
				this.waitingForAPIInput = true;
			} else {
				this.logger.log("onMediaEnd() playNextVideo()");
				this.playNextVideo();
			}
		}
	},
	setVideoSrc: function() {
		if (!this.isPlayingAd) {
			this.currentLoadedIndex = this.playlist.currentIndex;
			var currentItem = this.playlist.currentItem,
				src = currentItem.rss.mediaGen.renditions;
			if (!src) {
				this.logger.error("loadItem no src in media gen for currentLoadedIndex:" + this.currentLoadedIndex);
			} else {
				this.logger.log("setVideoSrc() for currentLoadedIndex:" + this.currentLoadedIndex, src);
				this.video.isLive(currentItem.isLive);
				this.video.callPlayAfterSeek = !this.video.isPaused();
				this.video.setSrc(src);
			}
		} else {
			this.logger.warn("setVideoSrc not setting video src, currently playing ad.");
		}
	},
	checkForAd: function() {
		// we're playing an ad already.
		if (this.isPlayingAd) {
			this.logger.warn("checkForAd, already playing an ad.");
			return false;
		}
		var currentIndex = this.playlist.currentIndex;
		// we already checked for this index
		if (this.adCheckedIndex == currentIndex) {
			this.logger.log("checkForAd() no, ad index " + this.adCheckedIndex + " already checked.");
			return false;
		}
		// set the checked index.
		this.adCheckedIndex = currentIndex;
		this.logger.log("should check ad for index:", currentIndex);
		return true;
	}
}, {
	AD_EVENTS: ["timeupdate", "playing", "pause", "error"],
	NAME: "BentoPlaybackManager"
});