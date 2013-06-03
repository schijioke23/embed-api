/* exported ShareUtil */
var ShareUtil = function() {
	var getEmbedCodeDimensions = function(config, el) {
		// we don't need to know the exaxt dimensions, just enough to get the ratio
		var width = config.width === "100%" ? el.clientWidth : config.width,
			height = config.height === "100%" ? el.clientHeight : config.height,
			Dimensions16x9 = {
				width: 512,
				height: 288
			},
			Dimensions4x3 = {
				width: 360,
				height: 293
			},
			aspect = width / height,
			Diff4x3 = Math.abs(aspect - 4 / 3),
			Diff16x9 = Math.abs(aspect - 16 / 9);
		return Diff16x9 < Diff4x3 ? Dimensions16x9 : Dimensions4x3;
	};
	return {
		getEmbedCode: function() {
			var config = this.config,
				metadata = this.currentMetadata,
				displayDataPrefix = "<p style=\"text-align:left;background-color:#FFFFFF;padding:4px;margin-top:4px;margin-bottom:0px;font-family:Arial, Helvetica, sans-serif;font-size:12px;\">",
				displayMetadata = (function() {
					if (!metadata) {
						return "";
					}
					var copy = "",
						categories = metadata.rss.group.categories,
						source = categories.source,
						sourceLink = categories.sourceLink,
						seoHTMLText = categories.seoHTMLText;
					if (source) {
						if (sourceLink) {
							copy += "<b><a href=\"" + sourceLink + "\">" + source + "</a></b>";
						} else {
							copy += "<b>" + source + "</b> ";
						}
					}
					if (seoHTMLText) {
						if (copy) {
							copy += "<br/>";
						}
						copy += "Get More: " + seoHTMLText;
					}
					if (copy) {
						copy = displayDataPrefix + copy + "</p>";
					}
					return copy;
				})(),
				embedDimensions = getEmbedCodeDimensions(config, this.element),
				embedCode = "<div style=\"background-color:#000000;width:{divWidth}px;\"><div style=\"padding:4px;\">" + "<iframe src=\"http://media.mtvnservices.com/embed/{uri}\" width=\"{width}\" height=\"{height}\" frameborder=\"0\"></iframe>" + "{displayMetadata}</div></div>";
			embedCode = embedCode.replace(/\{uri\}/, config.uri);
			embedCode = embedCode.replace(/\{width\}/, embedDimensions.width);
			embedCode = embedCode.replace(/\{divWidth\}/, embedDimensions.width + 8);
			embedCode = embedCode.replace(/\{height\}/, embedDimensions.height);
			embedCode = embedCode.replace(/\{displayMetadata\}/, displayMetadata);
			return embedCode;
		}
	};
}();