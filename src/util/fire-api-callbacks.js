/* global MTVNPlayer*/
/**
 * @member MTVNPlayer
 * @property {Boolean}
 * Set to true after the API is loaded.
 */
MTVNPlayer.isReady = true;
(function(context) {
	var _ = MTVNPlayer.require("_");
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
})(window);