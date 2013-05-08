/*global MTVNPlayer, require, _, Module, Modules, Events*/
/**
 * Hook into module events and send them through the embed api (this.player)
 */
var APIManager = Module.extend({
	name: "APIManager",
	initialize: function() {
		_.bindAll(this);
		_.extend(this, require("Backbone").Events);
		this.playlist = this.configurePlaylist(this.player.module(Modules.PLAYLIST));
		this.video = this.configureVideo(this.player.module(Modules.VIDEO));
		this.listenTo(this.playlist, Events.AD_COMPLETE, this.onAdComplete);
		this.listenTo(this.playlist, Events.DESTROY, this.destroy);
	},
	configurePlaylist: function(playlist) {
		var e = require("mtvn-playlist").Events;
		this.listenTo(playlist, e.READY, this.onPlaylistReady);
		this.listenTo(playlist, e.ITEM_READY, this.onItemReady);
		return playlist;
	},
	configureVideo: function(video) {
		var e = require("mtvn-playback").Events;
		this.listenTo(video, e.STATE, this.onState);
		this.listenTo(video, e.DURATION, this.onDuration);
		this.listenTo(video, e.DURATION, this.proxyEvent);
		this.listenTo(video, e.PLAYHEAD, this.onPlayhead);
		this.listenTo(video, e.BUFFERED, this.onBuffered);
		this.listenTo(video, e.END, this.proxyEvent);
		return video;
	},
	onPlayhead: function(event) {
		var playhead = event.data;
		var lastPlayhead = Math.floor(this.player.playhead);
		this.player.playhead = playhead;
		this.player.trigger(Events.PLAYHEAD_UPDATE, playhead);
		if (lastPlayhead != Math.floor(playhead)) {
			this.player.trigger(Events.PLAYHEAD_UPDATE + ":" + Math.floor(playhead), playhead);
		}
	},
	onDuration: function(event) {
		var m = this.player.currentMetadata;
		m.duration = event.data;
		this.player.trigger(Events.METADATA, m);
	},
	onState: function(event) {
		var state = APIManager.STATE_MAP[event.data] || event.data;
		this.player.state = state;
		this.checkMediaStart(state);
		this.player.trigger(Events.STATE_CHANGE, state);
		this.player.trigger(Events.STATE_CHANGE + ":" + state, state);
	},
	onAdComplete: function() {
		// really? I don't believe this is right.
		// this.proxyEvent({
		//  type: Event.MEDIA_END
		// });
	},
	proxyEvent: function(event) {
		this.player.trigger(APIManager.EVENT_MAP[event.type] || event.type, event.data);
	},
	checkPlayerReady: function() {
		var player = this.player;
		if (!player.ready) {
			player.ready = true;
			player.trigger(Events.READY);
		}
	},
	checkMediaStart: function(s) {
		if (s === MTVNPlayer.PlayState.PLAYING && !this.player.currentMetadata.isAd) {
			if (this.playlist.currentIndex != this.currentPlayingIndex) {
				this.currentPlayingIndex = this.playlist.currentIndex;
				this.logger.log("checkMediaStart() send MEDIA_START for index:" + this.currentPlayingIndex);
				this.player.trigger(Events.MEDIA_START);
			}
		}
	},
	onItemReady: function(event) {
		this.player.currentMetadata = event.data; // TODO check this with a multi item playlist
	},
	onPlaylistReady: function(event) {
		var player = this.player;
		player.playlistMetadata = event.data;
		player.currentMetadata = player.playlistMetadata.items[0];
		this.player.trigger(Events.METADATA, player.currentMetadata);
		this.checkPlayerReady();
	},
	destroy: function() {
		this.stopListening();
	}
}, {
	EVENT_MAP: {
		"state": Events.STATE_CHANGE,
		"playhead": Events.PLAYHEAD_UPDATE
	},
	STATE_MAP: {
		"pause": "paused"
	}
});