/*global MTVNPlayer*/
var Url = {
	/**
	 * This will only add the param if doesn't exist.
	 * @param url {String} the url to add the param to.
	 * @param name {String} the name of the param
	 * @param value {String} the value of the param
	 */
	addQueryStringParam: function(url, name, value) {
		var nameValuePair = name + "=" + value;
		if (url.indexOf(nameValuePair) === -1) {
			var endIndex = url.length - 1,
				questionMarkIndex = url.lastIndexOf("?");
			if (questionMarkIndex === -1 && url.lastIndexOf("/") !== endIndex) {
				url += "/";
			}
			var concat = url.lastIndexOf("&") === endIndex || questionMarkIndex === endIndex ? "" : questionMarkIndex === -1 ? "?" : "&";
			url += concat + nameValuePair;
		}
		return url;
	},
	/**
	 * This will replace the param if it exists, or add if it doesn't.
	 * @param url {String} the url to add the param to.
	 * @param name {String} the name of the param
	 * @param value {String} the value of the param
	 */
	setQueryStringParam: function(url, name, value) {
		var re = new RegExp("([?|&])" + name + "=.*?(&|$)", "i");
		if (url.match(re)) {
			return url.replace(re, '$1' + name + "=" + value + '$2');
		} else {
			return Url.addQueryStringParam(url, name, value);
		}
	}
};
MTVNPlayer.provide("mtvn-url-util", Url);