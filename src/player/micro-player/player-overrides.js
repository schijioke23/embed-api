/*global $, _, Core, Modules, PerformanceManager, ConfigManager, Events, PlaybackManager*/
/**
 * @ignore
 * This player overrides a few methods just like the legacy flash and html5 players.
 */
var PlayerOverrides = _.once(function() {
	return {
		/**
		 * @ignore
		 * load javascript and instantiate modules.
		 */
		create: function() {
			_.bindAll(this);
			Core.instances.push({
				source: this.id,
				player: this
			});
			$(this.containerElement).css({
				position: "relative" // TODO not here.
			});
			Core.executeCallbacks(this);
			// doesn't need to be referenced anywhere.
			this.module(PerformanceManager);
			// start up
			// modules will now communicate through the module object. 
			// this keeps the embed api clean.
			// the controller is the player object itself, and events go off there.
			this.module(ConfigManager);
		},
		/**
		 * @ignore
		 * forward messages along to the correct module.
		 */
		message: function() {
			var m = this.module(PlaybackManager.NAME);
			return m.message.apply(m, arguments);
		},
		destroy: function() {
			this.trigger(Events.DESTROY);
			// so modules don't even have to listen for the event.
			_.invoke(this.module(Modules.ALL),"destroy");
			this.events = [];
		},
		isPaused: function() {
			return this.module(PlaybackManager.NAME).isPaused();
		}
	};
});