/*global MTVNPlayer, _, PackageManager, Core, Config, UrlProcessor, VMAP, VMAPAdModel*/
// execute any on API callbacks.VMAPAdModel
if (_.isFunction(MTVNPlayer.onAPIReady)) {
	MTVNPlayer.onAPIReady();
}
//exports 
MTVNPlayer.provide("mtvn-player-test",{
	PackageManager:PackageManager,
	Core:Core,
	Config: Config,
	UrlProcessor:UrlProcessor,
	VMAPAdModel:VMAPAdModel,
	VMAP:VMAP
});
/**
 * @member MTVNPlayer
 * @property {Boolean}
 * Set to true after the API is loaded.
 */
MTVNPlayer.isReady = true;