/*global MTVNPlayer, require, _, Module, Modules, Events*/
/**
 * Hook into module events and send them through the embed api (this.player)
 */
var APIManager = Module.extend({
	name: "APIManager",
	initialize: function() {
		_.bindAll(this);
		this.playlist = this.configurePlaylist(this.player.module(Modules.PLAYLIST));
		this.video = this.configureVideo(this.player.module(Modules.VIDEO));
	},
	configurePlaylist: function(playlist) {
		var e = require("mtvn-playlist").Events;
		playlist.on(e.READY, this.onPlaylistReady);
		playlist.on(e.ITEM_READY, this.onItemReady);
		return playlist;
	},
	configureVideo: function(video) {
		var e = require("mtvn-playback").Events;
		video.on(e.STATE, this.onState);
		video.on(e.STATE, this.proxyEvent);
		video.on(e.PLAYHEAD, this.proxyEvent);
		video.on(e.DURATION, this.onDuration);
		video.on(e.DURATION, this.proxyEvent);
		video.on(e.BUFFERED, this.onBuffered);
		video.on(e.END, this.proxyEvent);
		return video;
	},
	onDuration: function(event) {
		var metatdata = this.player.currentMetadata;
		metatdata.duration = event.data;
		this.player.trigger(Events.METADATA, metatdata);
	},
	onState: function(event) {
		this.checkMediaStart(event.data);
		this.player.trigger(Events.STATE_CHANGE + ":" + event.data, event.data);
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
		this.checkPlayerReady();
	},
	onPlaylistReady: function(event) {
		var player = this.player;
		player.playlistMetadata = event.data;
		player.currentMetadata = player.playlistMetadata.items[0];
		this.player.trigger(Events.METADATA, player.currentMetadata);
	}
}, {
	EVENT_MAP: {
		"state": Events.STATE_CHANGE,
		"playhead": Events.PLAYHEAD_UPDATE
	}
});