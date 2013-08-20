(function(context) {
	"use strict";
	var MTVNPlayer = context.MTVNPlayer,
		_ = MTVNPlayer.require("_");
	// return any dependencies the Embed API may have leaked into global.
	MTVNPlayer.noConflict();
	// remove the noConflict function from the api 
	delete MTVNPlayer.noConflict;
	// execute any on API callbacks.
	if (_.isFunction(MTVNPlayer.onAPIReady)) {
		MTVNPlayer.onAPIReady();
	}
	// simpler than the callback chain.
	if (_.isArray(context._mtvnPlayerAPIReady)) {
		_.each(context._mtvnPlayerAPIReady, function(cb) {
			if (_.isFunction(cb)) {
				cb();
			}
		});
	}
	// define the array, so we can override push.
	context._mtvnPlayerAPIReady = [];
	// override push to fire callbacks immediately
	context._mtvnPlayerAPIReady.push = function(cb) {
		cb();
	};
})(window);