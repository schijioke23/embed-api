/* global Config, MTVNPlayer */
//= util/config.js
// Zepto is the default, here we'll check if jQuery is required.
// If it is, we'll load it or use it from the page.
Config.requiresJQuery(function() {
	// $ may have been updated, let's reset the var.
	/* jshint unused:false */
	var $ = MTVNPlayer.require("$");
	//= util/core.js
	//= model
	//= player.js
	//= util/[url.js, jquery-plugin.js, end-slate-loader.js, share-util.js]
	//= third-party/swfobject.js
	//= player/flash-player.js
	//= util/finish.js
});