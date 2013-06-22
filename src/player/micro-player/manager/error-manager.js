/* global _, Module, Modules, require*/
/* exported ErrorManager */
var ErrorManager = Module.extend({
	name: "ErrorManager",
	initialize: function() {
		_.bindAll(this);
		this.player.on(Modules.Events.MEDIA_GEN_ERROR, this.onMediaGenError);
	},
	onMediaGenError: function(event) {
		require("mtvn-player/dialog", _.partial(this.showMessage, "", event.data));
	},
	showMessage: function(title, message, Dialog) {
		var $el = this.player.$el,
			dialog = new Dialog({
				title: title,
				message: message
			});
		$el.append(dialog.$el.css({
			width: $el.width(),
			height: $el.height()
		}));
	},
	destroy: function() {
		// nothing to clean up.
	}
}, {
	NAME: "ErrorManager"
});