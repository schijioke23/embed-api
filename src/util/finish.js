/*global MTVNPlayer, _*/
// execute any on API callbacks.
if (_.isFunction(MTVNPlayer.onAPIReady)) {
	MTVNPlayer.onAPIReady();
}
/**
 * @member MTVNPlayer
 * @property {Boolean}
 * Set to true after the API is loaded.
 */
MTVNPlayer.isReady = true;