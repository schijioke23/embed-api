/* global MTVNPlayer, _, provide, PackageManager, Core, Config, Url, UrlProcessor, Exports*/
// execute any on API callbacks.
if (_.isFunction(MTVNPlayer.onAPIReady)) {
	MTVNPlayer.onAPIReady();
}
provide("mtvn-player-test", _.extend({
	PackageManager: PackageManager,
	Core: Core,
	Config: Config,
	Url: Url,
	UrlProcessor: UrlProcessor
}, Exports));
/**
 * @member MTVNPlayer
 * @property {Boolean}
 * Set to true after the API is loaded.
 */
MTVNPlayer.isReady = true;