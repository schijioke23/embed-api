/* global MTVNPlayer, _, provide, EndSlateLoader, Core, Config, Exports, Logger*/
provide("mtvn-player-test", _.extend({
	EndSlateLoader: EndSlateLoader,
	Core: Core,
	Config: Config
}, Exports));
(new Logger("MTVNPlayer")).log("v" + MTVNPlayer.version + " built:" + MTVNPlayer.build);