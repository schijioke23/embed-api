/*global Url, require, provide */
/*exports UrlProcessor */
var UrlProcessor = {
	getUrlProcessorUrl: function(config, feedUrl) {
		var ff = require("mtvn-util").mapFormFactorID(config.formFactorID, {
			"102": {
				name: "useUrlProcessorFromFeed",
				value: [false, true]
			}
		});
		return ff.useUrlProcessorFromFeed ? feedUrl : config.mediaGen;
	},
	mediaGen: function(player, url) {
		var Util = require("mtvn-util"),
			config = player.config,
			templateData = Util.buildTemplateData(player);
		url = UrlProcessor.getUrlProcessorUrl(player.config, url);
		if(!url){
			throw "no media gen url.";
		}
		url = url.replace("{uri}", "{metadata.rss.guid}");
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
	},
	feed: function(player, url) {
		var Util = require("mtvn-util"),
			config = player.config,
			templateData = Util.buildTemplateData(player);
		if(!url){
			throw "no feed url.";
		}
		if (config.network) {
			url = Url.setQueryStringParam(url, "network", config.network);
		}
		url = Util.template(url, templateData);
		return url;
	}

};