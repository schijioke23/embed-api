/*global $, Modules, PlaybackManager, UnicornAdManager, VMAP */
var UnicornPlaybackManager = PlaybackManager.extend({
	loadUnicornOnceURL: false,
	initialize: function() {
		PlaybackManager.prototype.initialize.apply(this, arguments);
	},
	onItemReady: function() {
		if (this.loadUnicornOnceURL) {
			return;
		}
		this.loadUnicornOnceURL = true;
		var vmapURL = "http://onceux.unicornmedia.com/now/ads/vmap/od/auto/b11dbc9b-9d90-4edb-b4ab-769e0049209b/2455340c-8dcd-412e-a917-c6fadfe268c7/3a41c6e4-93a3-4108-8995-64ffca7b9106/bigbuckbunny?umtp=0&output=1";
		$.ajax({
			type: "get",
			url: "/player/jsonp/?callback=?&url=" + encodeURIComponent(vmapURL),
			dataType: "jsonp",
			success: this.onData
		});
	},
	setVideoSrc: function() {
		console.log("unicorn-playback-manager.js:19 this.vmap.uri", this.vmap.uri);
		this.video.setSrc(this.vmap.uri);
		this.video.play();
	},
	onData: function(data) {
		this.vmap = VMAP.parse(data);
		console.log("unicorn-playback-manager.js:24 this.vmap", this.vmap);
		this.player.trigger(Modules.Events.VMAP, this.vmap);
		this.setVideoSrc();
	}
});