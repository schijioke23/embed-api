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
		return VMAP.rawTime(durations[0].slice(0, 8));
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

	function getAdType(timeOffset) {
		if (timeOffset == "start") {
			return PREROLL;
		} else if (timeOffset == "end") {
			return POSTROLL;
		}
		return MIDROLL;
	}

	function getMidrollStartTime(adBreak) {
		var firstMidroll = _.find(adBreak, function(midroll) {
			return getAdType(midroll.timeOffset) === MIDROLL;
		});
		return firstMidroll ? VMAP.rawTime(firstMidroll.timeOffset) : 0;
	}

	function getTotalDuration(memo, item) {
		return memo + item.duration;
	}

	function getPostrollDuration(adBreak) {
		// this is used while processing, before postrolls in the parse function is done.
		var postrolls = _.where(adBreak, {
			timeOffset: "end"
		});
		return _.reduce(postrolls, function(memo, item) {
			return memo + getAdDuration(item);
		}, 0);
	}

	/**
	 * VMAP parser
	 */
	return {
		find: find,
		clean: clean,
		parse: function(vmap) {
			var trackers = [],
				prerolls = [],
				midrolls = [],
				postrolls = [],
				prerollOffset = 0,
				postrollOffset = 0,
				totalPostrollTime,
				totalDuration,
				midrollOffset;

			// let's simplify this.
			vmap = vmap["vmap:VMAP"];
			_.each(vmap, clean);
			cleanProps(vmap, "AdBreak", "Extensions");
			cleanProps(vmap.Extensions, "unicornOnce", "requestParameters");

			function adjustTime(type, duration) {
				if (type === PREROLL) {
					prerollOffset += duration;
				} else if (type === MIDROLL) {
					midrollOffset += duration;
				} else {
					postrollOffset += duration;
				}
			}

			function processAdBreak(adBreak) {
				var AdSource = adBreak.AdSource,
					type = getAdType(adBreak.timeOffset);
				if (type === MIDROLL) {
					// midroll timeOffset is a number.
					adBreak.timeOffset = VMAP.rawTime(adBreak.timeOffset);
				}
				_.each(AdSource, clean);
				// parse
				console.group(adBreak.breakId);
				var duration = getAdDuration(AdSource.VASTData.VAST.Ad);
				// 
				updateAdTracking(AdSource.id, type, _.flatten(find(AdSource, "Tracking")));
				adjustTime(type, duration);
				var result = {
					type: type,
					breakId: AdSource.id,
					timeOffset: adBreak.timeOffset,
					duration: duration
				};
				if (type == PREROLL) {
					prerolls.push(result);
				} else if (type == MIDROLL) {
					midrolls.push(result);
				} else {
					postrolls.push(result);
				}
				console.groupEnd(adBreak.breakId);
			}

			function updateAdTracking(breakId, type, tracking) {
				_.each(tracking, function(item) {
					_.each(item, clean);
					var offset = parseFloat(item.offset, 10),
						tracker = {
							breakId: breakId,
							event: item.event,
							url: item.text
						};
					if (!isNaN(offset)) {
						if (type === PREROLL) {
							tracker.timeToFire = prerollOffset + offset;
						} else if (type === MIDROLL) {
							tracker.timeToFire = prerollOffset + midrollOffset + offset;
						} else {
							tracker.timeToFire = totalDuration - totalPostrollTime + postrollOffset + offset;
						}
						console.log("Fire at", VMAP.formatTime(tracker.timeToFire), "or " + tracker.timeToFire + " seconds");
					}
					trackers.push(tracker);
				});
			}
			// aggregate of postroll durations, required before trackers are initialized.
			totalPostrollTime = getPostrollDuration(vmap.AdBreak);
			// the first midroll's offset, or start time.
			midrollOffset = getMidrollStartTime(vmap.AdBreak);
			// the whole thing, content and ads.
			totalDuration = vmap.Extensions.unicornOnce.payloadlength;
			// parse all the ad breaks.
			_.each(vmap.AdBreak, processAdBreak);
			return {
				uri: vmap.Extensions.unicornOnce.contenturi,
				totalDuration: totalDuration,
				prerolls: prerolls,
				midrolls: midrolls,
				postrolls: postrolls,
				totalPostrollTime: totalPostrollTime,
				totalPrerollTime: _.reduce(prerolls, getTotalDuration, 0),
				totalMidrollTime: _.reduce(midrolls, getTotalDuration, 0),
				trackers: trackers
			};
		},
		rawTime: function(seconds) {
			var b = seconds.split(/\D/);
			return (+b[0]) * 60 * 60 + (+b[1]) * 60 + (+b[2]) + (b[3] ? parseFloat("." + b[3]) : 0);
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