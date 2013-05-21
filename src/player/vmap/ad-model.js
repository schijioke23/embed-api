/* global _, VMAP*/
/* exported VMAPAdModel*/
var VMAPAdModel = function(model) {
	_.extend(this, model);
};
VMAPAdModel.prototype = {
	/**
	 * @param {Number} the time to evaluate agains the VMAP.
	 * @return the ad that's playing for the current time.
	 */
	getAd: function(currentTime) {
		if (_.isString(currentTime)) {
			currentTime = VMAP.rawTime(currentTime);
		}
		if (currentTime <= this.totalPrerollTime) {
			return this.getPreroll(currentTime);
		} else if (currentTime >= this.totalDuration - this.totalPostrollTime) {
			return this.getPostroll(currentTime);
		} else {
			return this.getMidroll(currentTime -= this.totalPrerollTime);
		}
	},
	/**
	 * if a preroll exists for the time specified, return it.
	 */
	getPreroll: function(currentTime) {
		var startTime = 0;
		return _.find(this.prerolls, function(ad) {
			startTime += ad.duration;
			return currentTime <= startTime;
		});
	},
	/**
	 * if a midroll exists for the time specified, return it.
	 */
	getMidroll: function(currentTime) {
		var aggregateDuration = 0;
		return _.find(this.midrolls, function(ad) {
			var adStartsAt = ad.timeOffset;
			aggregateDuration += ad.duration;
			var adEndsAt = adStartsAt + aggregateDuration;
			return currentTime >= adStartsAt && currentTime <= adEndsAt;
		});
	},
	/**
	 * if a postroll exists for the time specified, return it.
	 */
	getPostroll: function(currentTime) {
		var aggregateDuration = 0;
		return _.find(this.postrolls, function(ad) {
			var adStartsAt = this.totalDuration - this.totalPostrollTime + aggregateDuration;
			aggregateDuration += ad.duration;
			var adEndsAt = adStartsAt + ad.duration;
			return currentTime >= adStartsAt && currentTime <= adEndsAt;
		}, this);
	}
};