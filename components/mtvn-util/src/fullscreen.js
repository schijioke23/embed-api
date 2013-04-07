/*global MTVNPlayer, _, Backbone*/
Util.FullScreen = function(document) {
	var cancelFunc = document.cancelFullScreen || document.mozCancelFullScreen || document.webkitCancelFullScreen,
		FullScreen = _.extend({}, Backbone.Events, {
			toggle: function(element) {
				if (FullScreen.isFullScreen()) {
					return FullScreen.cancelFullScreen();
				} else {
					return FullScreen.requestFullScreen(element);
				}
			},
			requestFullScreen: function(element) {
					element = element || document.documentElement;
				var requestFunc = element.requestFullScreen || element.mozRequestFullScreen || element.webkitRequestFullScreen;
				if (requestFunc) {
					requestFunc.apply(element);
					return true;
				}
				return false;
			},
			cancelFullScreen: function() {
				if (cancelFunc) {
					cancelFunc();
					return true;
				}
				return false;
			},
			isFullScreen: function() {
				return ((document.fullScreenElement !== undefined && document.fullScreenElement !== null) || (document.mozFullScreen !== undefined && document.mozFullScreen === true) || (document.webkitIsFullScreen !== undefined && document.webkitIsFullScreen === true));
			},
			Events: {
				FULL_SCREEN_CHANGE: "fullscreenChange"
			}
		}),
		vendorFullscreenChange;
	if (document.fullScreenEnabled || document.fullscreenEnabled) {
		vendorFullscreenChange = "fullscreenchange";
	} else if (document.mozFullscreenEnabled || document.mozFullScreenEnabled) {
		vendorFullscreenChange = "mozfullscreenchange";
	} else if (document.webkitFullscreenEnabled || document.webkitFullScreenEnabled) {
		vendorFullscreenChange = "webkitfullscreenchange";
	}
	if (vendorFullscreenChange) {
		document.addEventListener(vendorFullscreenChange, function() {
			FullScreen.trigger(FullScreen.Events.FULL_SCREEN_CHANGE, {
				type: FullScreen.Events.FULL_SCREEN_CHANGE,
				data: FullScreen.isFullScreen()
			});
		}, false);
	}
	return FullScreen;
}(document);	