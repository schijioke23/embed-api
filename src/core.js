(function(core, $) {
    "use strict";
    if (core.initialized) {
        return;
    }
    core.initialized = true;
    // private vars
    var instances = [],
        baseURL = "http://media.mtvnservices.com/",
        onPlayerCallbacks = [];
    // exports
    /**
     * @property instances
     * @ignore
     * An array of all the player instances.
     */
    core.instances = instances;
    /**
     * @property baseURL
     * @ignore
     * The base URL for the player request and for swf object. 
     */
    core.baseURL = baseURL;
    /**
     * @property onPlayerCallbacks
     * @ignore
     * These are fired when a player laods. 
     */
    core.onPlayerCallbacks = onPlayerCallbacks;
    core.$ = $;

    /**
     * @property isHTML5Player
     * @ignore
     * The logic that determines whether we're using flash or html
     */
    core.isHTML5Player = function() {
        var n = window.navigator.userAgent.toLowerCase();
        return n.indexOf("iphone") !== -1 || n.indexOf("ipad") !== -1;
    }();
    
    /**
     * @method getPath
     * @ignore
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
     * @ignore
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
     * @ignore
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
     * @ignore
     * @param {MTVNPlayer.Player} player
     * Fires callbacks registered with MTVNPlayer.onPlayer
     */
    core.executeCallbacks = function(player) {
        for (var i = 0, len = onPlayerCallbacks.length; i < len; i++) {
            onPlayerCallbacks[i](player);
        }
    };
})(window.MTVNPlayer.module("core"), window.jQuery || window.Zepto);