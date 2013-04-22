/*global _, MTVNPlayer, Events, BTG, BentoModel, Module*/
// TODO what is capital BTG?
var BentoManager = function() {
	return Module.extend({
		name:"BentoManager",
		initialize: function() {
			var player = this.player,
				e = MTVNPlayer.Events;
			this.bento = MTVNPlayer.require("bento");
			_.bindAll(this);
			// BentoModel processing
			this.bento.onConfig(BentoModel.config(player));
			this.bento.onMetadata(BentoModel.metadata(player));
			// events
			player.on(e.MEDIA_START, this.onMediaStart);
			player.on(e.PLAYHEAD_UPDATE, this.onPlayhead);
			player.on(e.STATE_CHANGE, this.onPlayStateChange);
			player.on(e.PLAYLIST_COMPLETE, this.bento.onPlayListEnded);
			// TODO ad click
			player.on(e.INDEX_CHANGE, this.bento.onIndexChange);
			player.on(e.MEDIA_END, this.onMediaEnd);
			player.on(e.UI_STATE_CHANGE, this.onUIStateChange);
			// TODO where do these Events come from.
			// this.addListener(Events.FW_AD_METADATA, this.onAdMetadata);
			// this.addListener(Events.FW_AD_PLAYEND, this.onAdPlayEnd);
			// this.addListener(Events.FW_AD_OVERLAY_START, this.onAdOverlayStart);
			// this.addListener(Events.FW_AD_OVERLAY_END, this.onAdOverlayEnd);
		},
		isItTimeForAnAd: function() {
			if (this.hasAdComplete) {
				return true;
			}
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
						bento.onMetadata(this.packageMetadata());
						bento.onMediaStart();
						bento.onPlay(playhead);
					} else if (this.hasPaused) {
						this.hasPaused = false;
						bento.onPlayResume(playhead);
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
		onAdMetadata: function(adMetadata) {
			console.log("onAdMetadata adMetadata:" + adMetadata);
			var durations = [],
				m = {};
			m.isAdClickable(adMetadata.isClickable);
			console.log("onAdMetadata adMetadata.duration:" + adMetadata.duration);
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
			console.log("onAdComplete");
			if (!this.hasContentEnd){
				this.hasAdComplete = true;
			}
			this.hasContentEnd = false;
			this.player.trigger("AD_METADATA", {
				type: "AD_METADATA",
				data: null
			});
			this.player.trigger(Events.ON_AD_COMPLETE); // TODO
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
}();