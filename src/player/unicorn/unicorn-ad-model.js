/*global _, VMAP*/
/**
 * Gets the total ad slot time and checks for multiple ads
 *
 * @adBreakNodes : an array of all the ad breaks
 *
 * @adBreakNodes : properties
 *   breakType :  generally linear
 *   breakId : preroll/midroll/postroll
 *   timeOffset : vmap slot identifier
 *   adDuration : actual running time of ad
 *
 */
var UnicornAdModel = function() {
	function parseAdBreak(adBreak) {
		var adDuration = adBreak.adDuration;
		var rawTime = VMAP.rawTime(adDuration);
		if (adBreak.timeOffset === "start") {

			if (this.totalPrerollTime) {
				this.totalPrerollTime = this.totalPrerollTime + rawTime;
			} else {
				this.totalPrerollTime = rawTime;
			}
			this.preRollAdManager.push({
				breakId: adBreak.breakId,
				duration: adDuration,
				type: "preroll"
			});
		} else if (adBreak.timeOffset === "end") {

			if (this.totalPostrollTime) {
				this.totalPostrollTime = this.totalPostrollTime + rawTime;
			} else {
				this.totalPostrollTime = rawTime;
			}

			this.postRollAdManager.push({
				breakId: adBreak.breakId,
				duration: adDuration,
				type: "postroll"
			});
		} else {

			rawTime = VMAP.rawTime(adBreak.timeOffset);

			if (this.totalMidrollTime) {
				this.totalMidrollTime = this.totalMidrollTime + rawTime;
			} else {
				this.totalMidrollTime = rawTime;
			}

			this.midRollAdManager.push({
				breakId: adBreak.breakId,
				duration: adDuration,
				timeOffset: adBreak.timeOffset,
				type: "midroll"
			});
		}
	}
	var UnicornAdModel = function(adBreaks) {
		this.preRollAdManager = [];
		this.postRollAdManager = [];
		this.midRollAdManager = [];
		_.each(adBreaks, parseAdBreak, this);
	};
	UnicornAdModel.prototype = {
		/**
		 * return the ad that's playing for the current time.
		 */
		getAd: function(currentTime) {
			if (_.isString(currentTime)) {
				currentTime = VMAP.rawTime(currentTime);
			}
			if (currentTime <= this.totalPrerollTime) {
				return this.getPreRoll(currentTime);
			} else {
				return this.getMidRoll(currentTime -= this.totalPrerollTime);
			}
		},
		getPreRoll: function(currentTime) {
			var startTime = 0;
			return _.find(this.preRollAdManager, function(ad) {
				startTime += VMAP.rawTime(ad.duration);
				return currentTime <= startTime;
			});
		},
		getMidRoll: function(currentTime) {
			var aggregateDuration = 0;
			return _.find(this.midRollAdManager, function(ad) {
				var adDuration = VMAP.rawTime(ad.duration),
					adStartsAt = VMAP.rawTime(ad.timeOffset);
				aggregateDuration += adDuration;
				var adEndsAt = adStartsAt + aggregateDuration;
				return currentTime >= adStartsAt && currentTime <= adEndsAt;
			});
		}
	};
	return UnicornAdModel;
}();