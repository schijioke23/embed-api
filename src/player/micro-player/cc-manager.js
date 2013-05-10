/*global _, Module, MTVNPlayer, Modules, UserManager */
var ClosedCaptionManager = Module.extend({
	name: "ClosedCaptionManager",
	initialize: function() {
		_.bindAll(this);
		this.userPrefs = this.player.module(UserManager);
		this.videoElement = this.player.module(Modules.VIDEO).el;
		this.player.once(MTVNPlayer.Events.MEDIA_START, this.processState);
	},
	onContentChange: function() {

	},
	initializeEl: _.once(function() {
		// create container
		containerElement = document.createElement("div");
		containerElement.id = "captionaterContainer";
		player.el.appendChild(containerElement);
		this.videoElement._containerObject = containerElement;
	}),
	toggle: function() {
		this.userPrefs.isCCOn(!this.userPrefs.isCCOn);
		this.processState();
	},
	turnCCOn: function() {
		var item = player.currentMetadata;
		var mTexts = item.group.texts;
		if (mText && mTexts.length > 0) {
			_.each(item.group.text, function(text) {
				if (isValidLanguage(text)) {
					this.logger.log("toggle() set timed text:" + text.src);
					if (currentVideoTrackElement !== null) {
						// keep just one track for now (or forever).
						videoElement.removeChild(currentVideoTrackElement);
					}
					this.currentVideoTrackElement = createTrackElement(text);
					this.videoElement.appendChild(this.currentVideoTrackElement);
				}
			});
			this.initializeEl();
			// call captionify every time, if the index changed or the media ended, or if it's the first time, then it will actually captionify.
			captionify(videoElement);
			showCaptions(videoElement);
			setCaptionCSS();
		} else if (this.ccJustClicked) {
			// UserMessage um = new UserMessage("Sorry, no closed captioning available.", true); // TODO (gianni) localize
			// facade.sendNotification(ApplicationFacade.SHOW_ERROR_MESSAGE, um);
		}
	},
	processState: function() {
		if (!MTVNPlayer.has("captionator")) {
			MTVNPlayer.loadPackages({
				"captionator": {
					shim: true,
					url: "http://media.mtvnservices-d.mtvi.com/player/api/module/captionator/0.0.1/captionator.min.js"
				}
			}, this.processState);
		} else {
			console.log("cc-manager.js:27 this.playlist", this.playlist);
			var ccOn = this.userPrefs.isCCOn(),
				isPlayingAd = this.player.currentMetadata.isAd;
			if (!isPlayingAd && ccOn) {
				this.turnCCOn();
			} else {
				this.hideCaptions();
				if (!isPlayingAd) {
					this.logger.log("toggle() off.");
				} else {
					this.logger.log("toggle() playing ad, after will turn:" + (ccOn ? "on" : "off"));
				}
			}
		}
	},
	hideCaptions: function() {
		this.logger.log("hideCaptions");
		var textTracks = this.videoElement.textTracks;
		if (textTracks && textTracks.length > 0) {
			textTracks[textTracks.length - 1].setMode(this.captionator.TextTrack.OFF);
		}
	},
	removeCaptions: function() {

	}
});