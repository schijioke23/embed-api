/*global Logger, require*/
/* exported Module */
var Module = require("mtvn-util").Module.extend({
	constructor: function(options) {
		this.options = options || {};
		// if it wasn't for this line, I wouldn't have to extend.
		this.player = options.player;
		var loggerName = this.name || options.moduleId;
		this.logger = new Logger("MTVNPlayer" + (loggerName ? "." + loggerName : ""));
		this.initialize.apply(this, arguments);
	}
});