/* global $, _, Core, Modules, PerformanceManager, 
  ConfigManager, Events, PlaybackManager, SHARED_VIDEO_ELEMENT:true, Logger*/
/* exported PlayerOverrides */
/**
 * @ignore
 * This player overrides a few methods just like the legacy flash and html5 players.
 */
var PlayerOverrides = function() {
	/**
	 * remove an instance from the hash map.
	 * @ignore
	 * @param {contentWindow} source
	 */
	var removePlayerInstance = function(id) {
		Core.instances = _.reject(Core.instances, function(instance) {
			return instance.source === id;
		});
	};
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
			// for iPhone. Activate the video element.
			if (!SHARED_VIDEO_ELEMENT) {
				var $video = $("<video></video>");
				$video[0].play();
				SHARED_VIDEO_ELEMENT = $video[0];
				(new Logger("Player")).info("video element activated.");
			}
			$(this.containerElement).css({
				position: "relative" // TODO not here.
			});
			Core.executeCallbacks(this);
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
			_.invoke(this.module(Modules.ALL), "destroy");
			this.events = [];
			if(this.$el){
				this.$el.remove(); // clean up the events.
			}
			// remove references to dom elements.
			delete this.$el;
			delete this.playerTarget;
			delete this.containerElement;
			delete this.element;
			removePlayerInstance(this.id);
		},
		isPaused: function() {
			return this.module(PlaybackManager.NAME).isPaused();
		}
	};
}();