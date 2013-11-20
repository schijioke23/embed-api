/* global MTVNPlayer */
MTVNPlayer.configurePackages({
	// We only need $ for the HTML5 player for now. So Zepto is ok.
	// However, jQuery may be provided by the page. See Config.provideJQuery.
	"$": {
		shim: true,
		exports: "Zepto",
		url: "http://cdnjs.cloudflare.com/ajax/libs/zepto/1.0/zepto.min.js"
	},
	"mtvn-util": {
		url: "http://media.mtvnservices.com/player/js/util/1.5.0/mtvn-util.min.js"
	},
	"mtvn-player/cc-prefs": {
		shim: true,
		url: "http://media.mtvnservices.com/player/js/cc-prefs/0.2.0/cc-prefs.min.js",
		exports: "CCPrefs",
		css: "http://media.mtvnservices.com/player/js/cc-prefs/0.2.0/style.css"
	}
});