/*global MTVNPlayer, Url*/
/*exports MediaGen */
var MediaGen = {
	getMediaGenUrl: function(config, feedUrl) {
		var Util = MTVNPlayer.require("mtvn-util");
		console.log("media-gen.js:6 config.formFactorID",config.formFactorID);
		var ff = Util.mapFormFactorID(config.formFactorID, {
			"102": {
				name: "useMediaGenFromFeed",
				value: [false, true]
			}
		});
		return ff.useMediaGenFromFeed ? feedUrl : config.mediaGen;
	},
	process: function(player, url) {
		var Util = MTVNPlayer.require("mtvn-util"),
			config = player.config,
			templateData = Util.buildTemplateData(player);
		url = MediaGen.getMediaGenUrl(player.config, url);
		if(!url){
			throw "no media gen url.";
		}
		url = url.replace("{uri}", "{metadata.guid}");
		if (config.network) {
			url = Url.setQueryStringParam(url, "network", config.network);
		}
		if (config.acceptMethods) {
			url = Url.setQueryStringParam(url, "acceptMethods", config.acceptMethods);
		}
		if (config.mediaGenParams) {
			url = Url.setQueryStringParam(url, "mediaGenParams", config.mediaGenParams);
		}
		url = Util.template(url, templateData);
		return url;
	}
};
MTVNPlayer.provide("mtvn-media-gen-util", MediaGen);