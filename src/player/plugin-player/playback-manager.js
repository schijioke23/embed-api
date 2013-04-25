/*global _, $, MTVNPlayer, Module, Modules, require, Events, PlayState, BTG*/
var PlaybackManager = Module.extend({
	name: "PlaybackManager",
	initialize: function() {
		_.bindAll(this);
		// Video Module
		var video = this.player.module(Modules.VIDEO, new(require("mtvn-playback").Html5.Player)({
			controls: this.player.config.useNativeControls,
			el: PlaybackManager.SHARED_VIDEO_ELEMENT
		}));
		video.$el.css({
			width: "100%",
			height: "100%",
			position: "absolute"
		});
		$(this.player.playerTarget).append(video.el);
		this.video = video;
		this.playlist = this.player.module(Modules.PLAYLIST);
		this.playlist.on(require("mtvn-playlist").Events.ITEM_READY, this.onItemReady);
		if (BTG.Bento) {
			this.bentoManager = BTG.Bento;
		}
		this.player.once(Events.STATE_CHANGE + ":" + PlayState.PLAYING, this.onPlaying);
	},
	play: function(startTime) {
		if (this.player.module(Modules.USER).isOk()) {
			// reset the queued start time.
			this.queuedStartTime = 0;
			// the item we're trying to play.
			var currentItem = this.playlist.currentItem;
			// it's been loaded.
			if (currentItem.ready) {
				// check the media gen for errors.
				if (this.hasError(currentItem)) {
					return;
				}
				if (this.shouldCheckForAd() && this.bentoManager && this.bentoManager.isItTimeForAnAd()) {
					this.queuedStartTime = startTime;
					this.playAd();
				} else {
					// play new item
					if (!this.isPlayingAd && this.currentLoadedIndex !== this.playlist.currentIndex) {
						this.logger.log("loading new index: " + this.playlist.currentIndex);
						this.setVideoSrc();
					} else {
						this.logger.log("playing or seeking on same index:" + this.currentLoadedIndex);
					}
					// seek, if need be
					if (this.startTime > 0) {
						this.logger.log("call player.seek(" + this.startTime + ")");
						this.video.seek(this.startTime);
					} else {
						this.logger.log("call player.play()");
						this.video.play();
					}
				}
			} else {

				// load new mediagen
				this.playlist.loadItem(this.playlist.currentIndex);

				this.logger.log("waiting for media gen.");
				//TODO, try to do this in video
				//this.video.callPlayAfterSeek(!this.video.isPaused());
				this.video.setEnabled(false);

				// queue start time.
				this.queuedStartTime = startTime;
			}
		}
	},
	onItemReady: function(event) {
		this.logger.log("onItemReady", event.data);
		this.setVideoSrc();
		this.play(this.queuedStartTime);
	},
	onPlaying: function() {
		PlaybackManager.SHARED_VIDEO_ELEMENT = this.video.el;
	},
	seek: function(time) {
		if (this.player.currentMetadata.isAd) {
			this.logger.warn("no seeking on ads");
			return;
		}
		if (this.player.config.useSegmentedScrubber) {
			// TODO not tested
			var index = -1,
				total = 0;
			_.some(this.playlist.items, function(item, i) {
				var currentItemDuration = item.metadata.duration;
				if (time <= total + currentItemDuration) {
					index = i;
					time = time - total;
					return true;
				}
				total += currentItemDuration;
			});
			if (index == -1) {
				this.logger.warn("bad seek. index not found. time:" + time);
				return;
			}
			if (index != this.playlist.currentIndex) {
				this.playlist.setIndex(index);
				this.play(time);
			} else {
				// same index
				this.video.seek(time);
			}
		} else {
			// same index
			this.video.seek(time);
		}
	},
	playAd: function() {
		this.logger.log("play ad");
		this.isPlayingAd = true;
		this.video.activeEvents = PlaybackManager.AD_EVENTS;
		this.video.delegateEvents();
		this.currentLoadedIndex = -1;
		this.player.trigger(Modules.Events.AD_WILL_PLAY);
		this.bentoManager.playAd();
	},
	onAdComplete: function() {
		this.player.trigger(Events.PLAYHEAD, 0);
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
		this.trigger(Events.MEDIA_END);
		if (this.bentoManager && this.bentoManager.isItTimeForAnAd()) {
			this.logger.log("onMediaEnd() play post roll.");
			this.afterAdPlayNextVideo = true;
			this.playAd();
		} else {
			if (!this.continuousPlay) {
				this.logger.log("onMediaEnd() don't play next. wait for API input");
				this.waitingForAPIInput = true;
			} else {
				this.logger.log("onMediaEnd() playNextVideo()");
				this.playNextVideo();
			}
		}
	},
	playNextVideo: function() {
		this.logger.log("playNextVideo() playlist.hasNext():" + this.playlist.hasNext() + " currentLoadedIndex:" + this.currentLoadedIndex);
		if (this.playlist.hasNext()) {
			this.playlist.goToNext();
			this.play(0);
		} else {
			this.currentPlayingIndex = this.currentLoadedIndex = -1;
			this.hasPlaylistEnded = true;
			this.player.setEnabled(false);
			this.player.exitFullScreen();
			this.player.trigger(Events.PLAYLIST_COMPLETE);
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
				// TODO, try to do this in the video
				//video.callPlayAfterSeek(!video.isPaused());
				this.video.setSrc(src);
			}
		} else {
			this.logger.warn("setVideoSrc not setting video src, currently playing ad.");
		}
	},
	hasError: function(currentItem) {
		var renditions = currentItem.rss.mediaGen.renditions;
		if (renditions.length === 0) {
			this.player.trigger(Modules.Events.MEDIA_GEN_ERROR, currentItem.rss.mediaGen.errorMessage);
		}
		return false;
	},
	shouldCheckForAd: function() {
		// we're playing an ad already.
		if (this.isPlayingAd) {
			return false;
		}
		var currentIndex = this.playlist.currentIndex;
		// we already checked for this index
		if (this.adCheckedIndex == currentIndex) {
			this.logger.log("shouldCheckForAdOnPlay() no, ad index " + this.adCheckedIndex + " already checked.");
			return false;
		}
		// set the checked index.
		this.adCheckedIndex = currentIndex;
		return true;
	},
	message: function(message) {
		var args = _.rest(_.toArray(arguments));
		this.logger.log("message", message, args);
		switch (message) {
			// hi-jacked messages
			case "play":
			case "seek":
				this[message].apply(this, args);
				break;
			default:
				if (!this.video[message]) {
					throw message + " not implemented.";
				}
				return this.video[message].apply(this.video, args);
		}
	}
}, {
	SHARED_VIDEO_ELEMENT: null,
	AD_EVENTS: ["timeupdate", "playing", "pause", "error"]
});