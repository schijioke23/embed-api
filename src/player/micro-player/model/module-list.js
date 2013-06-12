/* global _, Events*/
/* exported Modules */
var Modules = {
	ALL: "all", // get a list of all modules?
	PLAYLIST: "playlist",
	VIDEO: "video",
	Events: {
		CONFIG: "config",
		DESTROY: "destroyModules",
		VMAP: "vmap",
		UNICORN_AD: "unicornAd",
		MEDIA_GEN_ERROR: "mediaGenError",
		AD_COMPLETE: "adComplete",
		AD_WILL_PLAY: "adWillPlay"
	}
};
_.extend(Events, Modules.Events);