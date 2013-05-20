/*global _ */
var VMAP = function() {
	var PREROLL = "preroll",
		MIDROLL = "midroll",
		POSTROLL = "postroll";
	/**
	 * find all objects with a specific name.
	 */


	function find(source, target) {
		var result = [];
		if (_.isObject(source) || _.isArray(source)) {
			_.each(source, function(value, key) {
				if (key === target) {
					result.push(value);
				}
				if (_.isObject(value) || _.isArray(value)) {
					result = result.concat(find(value, target));
				}
			});
		}
		return result;
	}
	/**
	 * @return {String} Duration
	 */

	function getAdDuration(data) {
		var durations = find(data, "Duration");
		// seems to be only one?
		return durations[0].slice(0, 8);
	}

	function cleanProps(obj) {
		_.each(_.rest(_.toArray(arguments)), function(value) {
			var cleaning = obj[value];
			if (_.isArray(cleaning)) {
				_.each(cleaning, function(value) {
					_.each(value, clean);
				});
			} else {
				_.each(cleaning, clean);
			}
		});
	}
	/**
	 * remove namespaces, @'s, #'s and any unwanted nodes.
	 */

	function clean(value, key, obj) {
		if (key.indexOf("xmlns") === 0) {
			delete obj[key];
		} else {
			var parts = key.split(":");
			if (key.indexOf("@") === 0 || key.indexOf("#") === 0) {
				obj[key.slice(1)] = value;
				delete obj[key];
			} else if (parts.length === 2) {
				obj[parts[1]] = value;
				delete obj[key];
			}
		}
	}

	function isPreroll(timeOffset) {
		return timeOffset == "start";
	}

	function isPostroll(timeOffset) {
		return timeOffset == "end";
	}

	function isMidroll(timeOffset) {
		return timeOffset != "end" && timeOffset != "start";
	}

	function getAdType(timeOffset) {
		if (isPreroll(timeOffset)) {
			return PREROLL;
		} else if (isPostroll(timeOffset)) {
			return POSTROLL;
		}
		return MIDROLL;
	}

	function getPostrollDuration(adBreak) {
		var postRolls = _.where(adBreak, {
			timeOffset: "end"
		});
		return _.reduce(postRolls, function(memo, item) {
			return memo + VMAP.rawTime(getAdDuration(item));
		},0);
	}

	/**
	 * VMAP parser
	 */
	return {
		find: find,
		clean: clean,
		parse: function(vmap) {
			var trackers = [],
				adBreaks = [],
				prerollAggregate = 0,
				postrollDuration = null,
				totalDuration = null,
				postrollAggregate = 0,
				midrollAggregate = 0;

			function adjustTime(type, adDuration) {
				var duration = VMAP.rawTime(adDuration);
				if (type === PREROLL) {
					prerollAggregate += duration;
				} else if (type === MIDROLL) {
					midrollAggregate += duration;
				} else {
					postrollAggregate += duration;
				}
			}

			function adjustMidroll(type, timeOffset) {
				if (type === MIDROLL) {
					if (midrollAggregate === 0) {
						midrollAggregate += VMAP.rawTime(timeOffset);
					}
				}
			}

			function getAdBreaks(adBreak) {
				var AdSource = adBreak.AdSource,
					type = getAdType(adBreak.timeOffset);
				_.each(adBreak.AdSource, clean);
				// parse
				console.group(adBreak.breakId);
				var adDuration = getAdDuration(AdSource.VASTData.VAST.Ad);
				// 
				adjustMidroll(type, adBreak.timeOffset);
				updateAdTracking(AdSource.id, type, _.flatten(find(AdSource, "Tracking")));
				adjustTime(type, adDuration, adBreak.timeOffset);
				adBreaks.push({
					breakType: adBreak.breakType,
					breakId: AdSource.id,
					timeOffset: adBreak.timeOffset,
					adDuration: adDuration
				});
				console.groupEnd(adBreak.breakId);
			}

			function updateAdTracking(index, type, tracking) {
				console.log("UPDATE AD TRACKING vmap-parser.js:112 type ", type);
				_.each(tracking, function(item) {
					_.each(item, clean);
					var offset = parseInt(item.offset, 10),
						tracker = {
							breakId: index,
							offset: offset,
							event: item.event,
							url: item.text
						};
					var timeToFire;
					if (!isNaN(offset)) {
						if (type === PREROLL) {
							timeToFire = prerollAggregate + offset;
						} else if (type === MIDROLL) {
							timeToFire = prerollAggregate + midrollAggregate + offset;
						} else {
							timeToFire = totalDuration - postrollDuration + postrollAggregate + offset;
						}
						console.debug("vmap-parser.js:135 timeToFire", timeToFire);
						tracker.timeToFire = timeToFire;
					}
					trackers.push(tracker);
				});
			}
			// let's simplify this.
			vmap = vmap["vmap:VMAP"];
			_.each(vmap, clean);
			cleanProps(vmap, "AdBreak", "Extensions");
			cleanProps(vmap.Extensions, "unicornOnce", "requestParameters");
			postrollDuration = getPostrollDuration(vmap.AdBreak);
			totalDuration = vmap.Extensions.unicornOnce.payloadlength;
			console.log("vmap-parser.js:100 vmap", vmap);
			// parse adBreak
			_.each(vmap.AdBreak, getAdBreaks);
			return {
				uri: vmap.Extensions.unicornOnce.contenturi,
				adBreaks: adBreaks,
				trackers: trackers
			};
		},
		rawTime: function(seconds) {
			var b = seconds.split(/\D/);
			var secTime = (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]);
			return secTime;
		},
		formatTime: function(secs) {
			var hours = Math.floor(secs / (60 * 60));

			var divisor_for_minutes = secs % (60 * 60);
			var minutes = Math.floor(divisor_for_minutes / 60);

			var divisor_for_seconds = divisor_for_minutes % 60;
			var seconds = Math.ceil(divisor_for_seconds);

			// This line gives you 12-hour (not 24) time
			if (hours > 12) {
				hours = hours - 12;
			}

			// These lines ensure you have two-digits
			if (hours < 10) {
				hours = "0" + hours;
			}
			if (minutes < 10) {
				minutes = "0" + minutes;
			}
			if (seconds < 10) {
				seconds = "0" + seconds;
			}

			// This formats your string to HH:MM:SS
			var t = hours + ":" + minutes + ":" + seconds;

			return t;
		}
	};
}();