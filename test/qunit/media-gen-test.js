/*global MTVNPlayer, equal, test*/
test("media gen from feed or config", function() {
	var MediaGen = MTVNPlayer.require("mtvn-media-gen-util"),
		mediaGenFromFeed = "http://feed.com",
		config = {
			formFactorID: "",
			mediaGen: "http://mediagen.com/"
		};
	equal(MediaGen.getMediaGenUrl(config, mediaGenFromFeed), config.mediaGen, "no form factor use item media gen");
	config.formFactorID = "102:0";
	equal(MediaGen.getMediaGenUrl(config, mediaGenFromFeed), config.mediaGen, "form factor use config");
	config.formFactorID = "102:1";
	equal(MediaGen.getMediaGenUrl(config, mediaGenFromFeed), "http://feed.com", "form factor use item media gen");
});
test("media gen config processing", function() {
	var MediaGen = MTVNPlayer.require("mtvn-media-gen-util"),
		player = {
			config: {
				mediaGen: "http://feed.com",
				uri: "mgid:12345"
			},
			currentMetadata: {}
		},
		mediaGen = player.config.mediaGen;
	equal(MediaGen.process(player), mediaGen, "no form factor use item media gen");
	player.config.network = "value_network";
	equal(MediaGen.process(player), mediaGen + "/?network=value_network", "no form factor use item media gen");
	player.config.acceptMethods = "http,rtmpe";
	equal(MediaGen.process(player), mediaGen + "/?network=value_network&acceptMethods=http,rtmpe", "no form factor use item media gen");
	player.config.mediaGenParams = "urlParams";
	equal(MediaGen.process(player), mediaGen + "/?network=value_network&acceptMethods=http,rtmpe&mediaGenParams=urlParams", "no form factor use item media gen");
});