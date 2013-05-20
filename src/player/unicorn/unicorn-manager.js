/*global $, _, Module, VMAP, Modules, UnicornAdManager */
var UnicornManager = function() {
	function getPostRollEndTimeByDuration(adBreaks) {
		var rawEndTime;
		_.each(adBreaks, function(item) {
			if (item.timeOffset == "end") {
				var adDuration = item.adDuration;
				var rawTime = VMAP.rawTime(adDuration);
				if (rawEndTime) {
					rawEndTime = rawEndTime + rawTime;
				} else {
					rawEndTime = rawTime;
				}
			}
		});
		return rawEndTime;
	}
	var UnicornManager = Module.extend({
		initialize: function(options) {
			_.bindAll(this);
			var player = options.player;
			$.ajax({
				url: "data/unicorn.json",
				dataType: "json",
				success: this.onData
			});
			player.once("stateChange:playing", this.onPlaying);
		},
		onData:function(data) {
			this.vmap = VMAP.parse(data);
			this.model = new UnicornAdManager(this.vmap.adBreaks);
		},
		onPlaying: function() {
			this.adConfigTimer = setInterval(this.onEverySecond, 1000);
		},
		onEverySecond: function() {
			var video = this.options.player.module(Modules.VIDEO),
				model = this.model,
				currentRawTime = video.currentTime * 1000;

			//basic ad configurations
			var readableCurrentTime = VMAP.formatTime(video.currentTime);
			var assetDuration = VMAP.formatTime(video.duration);

			var rawAssetDuration = VMAP.rawTime(assetDuration);
			var currentTime = readableCurrentTime;

			//kill timer if asset duration has been reached
			if (currentTime == assetDuration) {
				//handles reset on the interval timer
				clearInterval(this.adConfigTimer);
			}

			//gets the portroll ad start time
			if (rawAssetDuration > 0) {
				if (!this.formattedPostRollStartTime) {
					//get postroll start time
					var postrollTimeFlag = model.totalPostrollTime;
					var rawPostRollDuration = VMAP.rawTime(postrollTimeFlag);
					var rawPostRollStartTime = rawAssetDuration - rawPostRollDuration;
					this.formattedPostRollStartTime = VMAP.formatTime(rawPostRollStartTime);
					this.formattedPostRollEndTime = VMAP.formatTime(rawPostRollStartTime + getPostRollEndTimeByDuration(model.adBreaks));
				}
			}

			//display current time and asset duration in UI
			console.log("unicorn-manager.js:42 currentTime: readableCurrentTime", readableCurrentTime);
			console.log("unicorn-manager.js:43 totalTime: assetDuration", assetDuration);

			//main ad management logic during asset playback
			if (currentTime <= model.totalPrerollTime) {

				//Basic ad configuration
				video.removeAttribute("controls");

				//set ad type config variables
				this.adType = "preroll";
				this.currentAdState = true;
				this.hasPrerollStarted = true;

				//ad slot configuration
				// UMOASAdSlotManager.AdSlotConfiguration(model.adBreaks, currentRawTime, adType, totalPrerollads, currentTime, totalPrerollTime, formattedMidRollStartTime, formattedMidRollEndTime, formattedPostRollStartTime, formattedPostRollEndTime, preRollAdManager, currentAdState, hasPrerollStarted);

				//handle ad overlay in the UI
				this.handleAdOverlay(this.currentAdState);


			} else if (currentTime >= formattedMidRollStartTime && currentTime <= formattedMidRollEndTime) {

				//Basic ad configuration
				video.removeAttribute("controls");

				//set ad type config variables
				this.adType = "midroll";
				this.currentAdState = true;
				this.hasMidrollStarted = true;

				//ad slot configuration
				// UMOASAdSlotManager.AdSlotConfiguration(model.adBreaks, currentRawTime, adType, totalMidrollads, currentTime, totalMidrollTime, formattedMidRollStartTime, formattedMidRollEndTime, formattedPostRollStartTime, formattedPostRollEndTime, midRollAdManager, currentAdState, hasMidrollStarted);

				//handle ad overlay in the UI
				this.handleAdOverlay(this.currentAdState);


			} else if (currentTime >= formattedPostRollStartTime) {

				//Basic ad configuration
				video.removeAttribute("controls");

				//clear and set ad type
				this.adType = "postroll";
				this.currentAdState = true;
				this.hasPostrollStarted = true;

				//ad slot configuration
				// UMOASAdSlotManager.AdSlotConfiguration(model.adBreaks, currentRawTime, adType, totalPostrollads, currentTime, totalPostrollTime, formattedMidRollStartTime, formattedMidRollEndTime, formattedPostRollStartTime, formattedPostRollEndTime, postRollAdManager, currentAdState, hasPostrollStarted);

				//we have to handle for the postroll state once current time and asset duration are =
				if (currentTime == assetDuration) {

					//end of asset hide ad overlay
					this.currentAdState = false;
					this.handleAdOverlay(this.currentAdState);

				} else {
					//handle ad overlay in the UI
					this.handleAdOverlay(this.currentAdState);
				}

			} else {

				//turn off video click through during content playback 
				// $("#umvideo").off('click');

				//enable player controls during content playback
				if (video.hasAttribute("controls")) {

				} else {
					video.setAttribute("controls", "controls");
				}

				//set current ad state to false
				this.currentAdState = false;
				this.handleAdOverlay(this.currentAdState);

			}

		}
	});
	return UnicornManager;
}();