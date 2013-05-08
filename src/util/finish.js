/*global MTVNPlayer, _, PackageManager, Core, Config, UrlProcessor*/
// execute any on API callbacks.
if (_.isFunction(MTVNPlayer.onAPIReady)) {
	MTVNPlayer.onAPIReady();
}
//exports 
MTVNPlayer.provide("mtvn-player-test",{
	PackageManager:PackageManager,
	Core:Core,
	Config: Config,
	UrlProcessor:UrlProcessor
});
/**
 * @member MTVNPlayer
 * @property {Boolean}
 * Set to true after the API is loaded.
 */
MTVNPlayer.isReady = true;