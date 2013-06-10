/* global _, $, Module, Modules, require, Events, PlayState, UserManager*/
/* exported PlaybackManager */
var PlaybackManager = Module.extend({
	initialize: function() {
		var Video = require("mtvn-playback"),
			Playlist = require("mtvn-util").Playlist;
		_.bindAll(this);
		_.extend(this, require("Backbone").Events);

		// Video module
		var video = this.video = this.player.module(Modules.VIDEO, new(Video.Html5.Player)({
			controls: this.player.config.useNativeControls,
			el: PlaybackManager.SHARED_VIDEO_ELEMENT
		}));
		this.player.element = video.el;
		video.$el.css({
			width: "100%",
			height: "100%",
			position: "absolute"
		});
		$(this.player.playerTarget).replaceWith(video.el);
		this.listenTo(video, Video.Events.END, this.onMediaEnd);

		// Playlist module
		this.playlist = this.player.module(Modules.PLAYLIST);
		this.listenTo(this.playlist, Playlist.Events.ITEM_READY, this.onItemReady);

		// To save an activated video element.
		this.player.once(Events.STATE_CHANGE + ":" + PlayState.PLAYING, this.onPlaying);
	},
	play: function(startTime) {
		if (this.player.module(UserManager).isOk()) {
			// reset the queued start time.
			this.queuedStartTime = 0;
			// the item we're trying to play.
			var currentItem = this.playlist.currentItem;
			// it's been loaded.
			if (currentItem.ready) {
				this.playItem(currentItem);
			} else { // load new mediagen
				this.loadItem(startTime);
			}
		}
	},
	loadItem: function(startTime) {
		this.playlist.loadItem(this.playlist.currentIndex);
		this.logger.log("waiting for item (media gen or vmap) at index:" + this.playlist.currentIndex);
		// TODO, this shouldn't be in the video module.
		this.video.callPlayAfterSeek = !this.video.isPaused();
		// queue start time.
		this.queuedStartTime = startTime;
	},
	playItem: function(currentItem) {
		// check the media gen for errors.
		if (this.hasError(currentItem)) {
			return;
		}
		// play new item for the media gen that is currently loaded.
		if (this.currentLoadedIndex !== this.playlist.currentIndex) {
			this.logger.log("loading new index: " + this.playlist.currentIndex);
			this.setVideoSrc(this.getRenditions());
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
	getStateHistory: function() {
		return this.video.stateHistory;
	},
	onItemReady: function(event) {
		this.logger.log("onItemReady", event.data);
		this.setVideoSrc(this.getRenditions());
		this.play(this.queuedStartTime);
	},
	onPlaying: function() {
		PlaybackManager.SHARED_VIDEO_ELEMENT = this.video.el;
	},
	onMediaEnd: function() {
		// should never fire for ads.
		this.player.trigger(Events.MEDIA_END);
		this.logger.log("onMediaEnd() playNextVideo()");
		this.playNextVideo();
	},
	playNextVideo: function() {
		this.logger.log("playNextVideo() playlist.hasNext():" + this.playlist.hasNext() + " currentLoadedIndex:" + this.currentLoadedIndex);
		if (this.playlist.hasNext()) {
			this.playlist.goToNext();
			this.play(0);
		} else {
			this.currentPlayingIndex = this.currentLoadedIndex = -1;
			this.video.setControls(false);
			this.player.exitFullScreen();
			this.player.trigger(Events.PLAYLIST_COMPLETE);
		}
	},
	setVideoSrc: function(src) {
		if (!src) {
			this.logger.error("no src in media gen for currentLoadedIndex:" + this.currentLoadedIndex);
		}
		this.currentLoadedIndex = this.playlist.currentIndex;
		this.logger.log("setVideoSrc() for currentLoadedIndex:" + this.currentLoadedIndex, src);
		this.video.isLive(this.playlist.currentItem.isLive);
		this.video.callPlayAfterSeek = !this.video.isPaused();
		this.video.setSrc(src);
	},
	getRenditions: function() {
		return this.playlist.currentItem.rss.mediaGen.renditions;
	},
	hasError: function() {
		var renditions = this.getRenditions();
		if (!renditions || renditions.length === 0) {
			this.player.trigger(Modules.Events.MEDIA_GEN_ERROR, this.playlist.currentItem.rss.mediaGen.errorMessage);
		}
		return false;
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
			case "exitFullScreen":
				break;
			case "playIndex":
				var index = parseInt(args[0], 10),
					startTime = parseInt(args[1], 10);
				if (!isNaN(index)) {
					this.logger.info("playIndex()", index, startTime);
					this.playlist.loadItem(index);
					this.play(isNaN(startTime) ? 0 : startTime);
				}
				break;
			case "setVolume":
				return this.video.volume.apply(this.video, args);
			default:
				if (!this.video[message]) {
					throw message + " not implemented.";
				}
				return this.video[message].apply(this.video, args);
		}
	},
	destroy: function() {
		this.stopListening();
		this.video.destroy();
	}
}, {
	SHARED_VIDEO_ELEMENT: null,
	AD_EVENTS: ["timeupdate", "playing", "pause", "error"],
	NAME: "PlaybackManager"
});