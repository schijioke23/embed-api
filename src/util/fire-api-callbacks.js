/* global MTVNPlayer*/
/**
 * @member MTVNPlayer
 * @property {Boolean}
 * Set to true after the API is loaded.
 */
MTVNPlayer.isReady = true;
(function() {
	var _ = MTVNPlayer.require("_");
	// execute any on API callbacks.
	if (_.isFunction(MTVNPlayer.onAPIReady)) {
		MTVNPlayer.onAPIReady();
	}
	// simpler than the callback chain.
	if (_.isArray(window._mtvnPlayerReady)) {
		_.each(window._mtvnPlayerReady, function(cb) {
			if (_.isFunction(cb)) {
				cb();
			}
		});
	}
})();