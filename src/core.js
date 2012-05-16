(function(MTVNPlayer,$) {
    "use strict";
    // private vars
    var core = MTVNPlayer.module("core"),
        instances = [],
        baseURL = "http://media.mtvnservices.com/",
        onPlayerCallbacks = [];
    // exports
    core.instances = instances;
    core.baseURL = baseURL;
    core.onPlayerCallbacks = onPlayerCallbacks;
    core.$ = $;
    /**
     * @method getPath
     * @private
     * @param {Object} config
     * Check if there's a template URL (usually used for testing),
     * otherwise join the baseURL with the config.uri
     */
    core.getPath = function(config) {
        if (config.templateURL) {
            return config.templateURL.replace("{uri}", config.uri);
        }
        return baseURL + config.uri;
    };
    /**
     * @method processEvent
     * @private
     * @param {Object} {Array} event
     * @param {Object} data
     * Check if event is an Array, if so loop through, else just execute.
     */
    core.processEvent = function(event, data) {
        if (!event) {
            return;
        }
        if (event instanceof Array) { // this will always be same-frame. (instanceof fails cross-frame.)
            for (var i = event.length; i--;) {
                event[i](data);
            }
        } else {
            event(data);
        }
    };
    /**
     * @method getPlayerInstance
     * @private
     * @param {ContentWindow} source
     * @returns {MTVNPlayer.Player} A player instance
     */
    core.getPlayerInstance = function(source) {
        var i, player = null,
            numberOfInstances = instances.length,
            currentInstance;
        for (i = numberOfInstances; i--;) {
            currentInstance = instances[i];
            if (currentInstance.source === source) {
                // compare source (contentWindow) to get events object from the right player. (if flash, source is the embed id)
                player = currentInstance.player;
                break;
            }
        }
        return player;
    };
    /**
     * @method executeCallbacks
     * @private
     * @param {MTVNPlayer.Player} player
     * Fires callbacks registered with MTVNPlayer.onPlayer
     */
    core.executeCallbacks = function(player) {
        for (var i = 0, len = onPlayerCallbacks.length; i < len; i++) {
            onPlayerCallbacks[i](player);
        }
    };
})(window.MTVNPlayer,window.jQuery || window.Zepto);