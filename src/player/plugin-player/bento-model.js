/*global require, BTG, _*/
var BentoModel = {
	config: function(player) {
		var cfg = player.config;
		cfg.freewheelTimeSinceLastAd = isNaN(cfg.freewheelMinTimeBtwAds) && isNaN(cfg.freewheelTimeSinceLastAd) ? null : !isNaN(cfg.freewheelTimeSinceLastAd) ? cfg.freewheelTimeSinceLastAd : cfg.freewheelMinTimeBtwAds;
		cfg.omnitureMediaTrackingEnabled = cfg.omnitureMediaTracking === true || cfg.omnitureMediaTrackingEnabled === true;
		cfg.nielsenEnabled = cfg.nielsenReporterEnabled === true || cfg.nielsenEnabled === true;

		cfg.applicationType = cfg.type;
		cfg.applicationContext = cfg.ref;
		cfg.referrer = cfg.ref;
		cfg.playerURL = document.location.href;
		cfg.omnitureFirstPartyServer = (cfg.omnitureTrackingServer ? cfg.omnitureTrackingServer : null);

		switch (cfg.applicationType) {
			case "partner":
				cfg.applicationName = cfg.partnerPlayerName;
				cfg.omnitureSuite = cfg.omniturePartnerAccount;
				cfg.omniturePathContext = BTG.AppMeasureVars.SYNDICATED_PATH;
				break;
			case "normal":
				cfg.applicationName = cfg.viralPlayerName;
				cfg.omnitureSuite = cfg.omnitureViralAccount;
				cfg.omniturePathContext = BTG.AppMeasureVars.VIRAL_PATH;
				break;
			default:
				cfg.applicationName = cfg.networkPlayerName;
				cfg.omnitureSuite = cfg.omnitureNetworkAccount;
				cfg.omniturePathContext = BTG.AppMeasureVars.NETWORK_PATH;
				break;
		}
		var customFields = new BTG.CustomFields(),
			key;
		if (typeof cfg.omnitureCustomFields === 'object') {
			for (key in cfg.omnitureCustomFields) {
				if (cfg.omnitureCustomFields.hasOwnProperty(key) && cfg.omnitureCustomFields[key]) {
					customFields.add(key, cfg.omnitureCustomFields[key]);
				}
			}
		}
		if (typeof cfg.omniturePropertyOverrides === 'object') {
			for (key in cfg.omniturePropertyOverrides) {
				if (cfg.omniturePropertyOverrides.hasOwnProperty(key) && cfg.omniturePropertyOverrides[key]) {
					customFields.add(cfg.omniturePropertyOverrides[key], key, true);
				}
			}
		}
		cfg.omnitureCustomFields = customFields;

		return player.config;
	},
	metadata: function(player) {
		var json = {},
		metadata = player.currentMetadata,
			pl = player.playlistMetadata,
			rssItem = metadata.rss,
			categories = rssItem.group.category,
			guid = rssItem.guid.split(":"),
			videoId = null,
			videoTitle = null;
		if (guid.length > 1) {
			videoId = guid[guid.length - 1];
			json.videoId = videoId;
			json.mtvnOwner = guid[3];
		}
		json.guid = rssItem.guid;

		videoTitle = categories.videoTitle || rssItem.title;

		if (videoId !== null) {
			videoTitle += "_" + videoId;
		}

		json.videoTitle = videoTitle;
		json.description = rssItem.description;
		json.videoUrl = rssItem.link;
		json.mediaCategory = categories.contentType;
		json.artistName = categories.artist;
		json.franchise = categories.franchise;
		json.playlistTitle = categories.playlistTitle;
		json.playlistType = categories.playlistType;
		json.reportable = categories.isReportable;
		json.duration = metadata.duration;
		json.beacons = metadata.beacons;
		json.isLive = metadata.isLive;
		json.playlistLength = pl.items.length;
		json.playlistMetadataItems = pl.items;
		json.isFullEpisode = player.config.isFullEpisode; // TODO check name.
		json.isAd = metadata.isAd; // This should work.

		if (categories.eventType) {
			json.eventType = categories.eventType;
		}
		if (categories.playlistURI) {
			var playlistId = categories.playlistURI;
			json.playlistURI = playlistId;
			json.playlistID = playlistId;
		}
		if (categories.playlistRepTitle) {
			json.playlistRepTitle = categories.playlistRepTitle;
		}
		if (categories.mtvnOwner) {
			json.mtvnOwner = categories.mtvnOwner;
		}
		if (categories.location) {
			json.location = categories.location;
		}
		if (categories.subBrand) {
			json.subBrand = categories.subBrand;
		}
		var duration = 0,
			reportableCount = 0;
		_.each(pl.items, function(item){
			duration += item.duration;
			if (item.rss.group.category.isReportable) {
				reportableCount++;
			}
		});

		json.hasPlayList = pl.items.length > 1 && reportableCount > 1;
		json.playlistDuration = duration;
		json.itemIndex = player.currentIndex;
		json.bandwidth = 1024;
		return json;
	}
};