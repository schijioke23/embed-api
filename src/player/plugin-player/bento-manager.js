/*global _, MTVNPlayer, Events, BTG, BentoModel, Module*/
var BentoManager = Module.extend({
	name: "BentoManager",
	hasSeekStart: false,
	hasSeekEnd: false,
	hasResumePlay: false,
	isBuffering: false,
	hasPlayed: false,
	hasPaused: false,
	hasAdComplete: false,
	hasContentEnd: false,
	isActive: false,
	currentIndex: -1,
	initialize: function() {
		_.bindAll(this);
		this.bento = BTG.Bento; // TODO scope this or make it an instance.
		// wait till metadata to initiate bento
		this.player.once(Events.METADATA, this.onPlayerReady);
	},
	onPlayerReady: function() {
		this.logger.log("onPlayerReady, initialize Bento");
		var e = MTVNPlayer.Events,
			player = this.player;
		// events
		player.on(e.MEDIA_START, this.onMediaStart);
		player.on(e.PLAYHEAD_UPDATE, this.onPlayhead);
		player.on(e.STATE_CHANGE, this.onPlayStateChange);
		player.on(e.PLAYLIST_COMPLETE, this.onPlaylistComplete);
		// TODO ad click
		player.on(e.INDEX_CHANGE, this.onIndexChange);
		player.on(e.MEDIA_END, this.onMediaEnd);
		player.on(e.UI_STATE_CHANGE, this.onUIStateChange);
		this.addFWEvents();
		// BentoModel processing
		this.bento.onConfig(BentoModel.config(player));
		console.log("bento-manager.js:36 BentoModel.metadata(player)",BentoModel.metadata(player));
		this.bento.onMetadata(BentoModel.metadata(player));
	},
	onIndexChange: function(event) {
		var newIndex = event.data;
		if (this.currentIndex !== newIndex) {
			this.currentIndex = newIndex;
			this.bento.onPlayIndexChanged(newIndex);
		}
	},
	onPlaylistComplete: function() {
		this.currentIndex = -1;
		this.bento.onPlayListEnded();
	},
	addFWEvents: function() {
		this.logger.log("addFWEvents");
		var events = BTG.Events;
		events.FW_AD_METADATA.add(this.onAdMetadata);
		events.FW_AD_PLAYEND.add(this.onAdComplete);
	},
	isItTimeForAnAd: function() {
		if (!this.hasAdComplete) {
			this.logger.log("isItTimeForAnAd is going to be called!!!");
			return true;
		}
		this.logger.log("it's not time for an ad.");
		this.hasAdComplete = false;
		return false;
	},
	onMediaStart: function() {
		this.hasPlayed = false;
	},
	onPlayhead: function(event) {
		var playhead = event.data;
		this.bento.onPlayheadUpdate(playhead);
		if ((this.isBuffering || this.hasSeekStart) && this.hasPlayed) {
			this.isBuffering = false;
			this.hasSeekStart = false;
			this.bento.onResumePlay(playhead);
		}
	},
	onPlayStateChange: function(event) {
		var bento = this.bento,
			playhead = this.player.playhead,
			state = event.data;
		switch (state) {
			case "playing":
				if (!this.hasPlayed) {
					this.hasPlayed = true;
					bento.onMetadata(BentoModel.metadata(this.player));
					bento.onMediaStart();
					bento.onPlay(playhead);
				} else if (this.hasPaused) {
					this.hasPaused = false;
					bento.onResumePlay(playhead);
				}
				break;
			default:
				break;
		}
		if (this.hasPlayed) {
			switch (state) {
				case "paused":
					this.hasPaused = true;
					bento.onPause(playhead);
					break;
				case "seeking":
					this.hasSeekStart = true;
					bento.onSeeking(playhead);
					break;
				case "buffering":
					this.isBuffering = true;
					bento.onBuffering(playhead);
					break;
				case "stopped":
					this.hasPlayed = false;
					bento.onPlayEnd(playhead);
					break;
				default:
					break;

			}
		}
	},
	onMediaEnd: function() {
		this.hasContentEnd = true;
	},
	onUIStateChange: function(event) {
		this.bento.onOverlayRezise(event.data.overlayRect);
	},
	// FREEWHEEEL
	playAd: function() {
		this.bento.isItTimeForAnAd(this.freewheelVO());
	},
	onAdMetadata: function(adMetadata) {
		this.logger.log("onAdMetadata adMetadata:" + adMetadata);
		var durations = [],
			m = {};
		m.isAdClickable(adMetadata.isClickable);
		this.logger.log("onAdMetadata adMetadata.duration:" + adMetadata.duration);
		durations.push(Math.max(0, adMetadata.duration));
		m.durations = durations;
		m.duration = Math.max(0, adMetadata.duration);
		// TODO or just set the currentMetadata?
		this.player.trigger("AD_METADATA", {
			type: "AD_METADATA",
			data: m
		});
		this.player.trigger(Events.MEDIA_START);
		this.player.trigger(Events.DURATION_CHANGE); // TODO event doesn't exixt
	},
	onAdComplete: function() {
		this.logger.log("onAdComplete");
		if (!this.hasContentEnd) {
			this.hasAdComplete = true;
		}
		this.hasContentEnd = false;
		this.player.trigger("AD_METADATA", {
			type: "AD_METADATA",
			data: null
		});
		this.player.trigger(Events.AD_COMPLETE);
		this.player.trigger(Events.DURATION_CHANGE); // TODO event doesn't exixt
	},
	freewheelVO: function() {
		return {
			currentItem: this.player.currentIndex,
			hasContentEnd: this.hasContentEnd,
			x: 0,
			y: 0,
			width: 450,
			height: 350
		};
	}
});