/*global MTVNPlayer, _ */
var Core = (function(core, $) {
    "use strict";
    var baseURL = "http://media.mtvnservices.com/",
        onPlayerCallbacks = [],
        // this is needed for the jQuery plugin only.
        getLegacyEventName = function(eventName) {
            if (eventName === "uiStateChange") {
                return "onUIStateChange";
            }
            return "on" + eventName.charAt(0).toUpperCase() + eventName.substr(1);
        };
    // exports
    /**
     * @property instances
     * @ignore
     * An array of all the player instances.
     */
    core.instances = [];
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
     * Initialization that is common across player modules (meaning flash/html5).
     * This is here mostly to keep it out of the constructor.
     * @ignore
     */
    core.playerInit = function(player, playerModule) {
        // A list of event messages called before the player was ready
        var eventQueue = [];
        player.module = function() {
            var modules = {};
            return function(name) {
                if (modules[name]) {
                    return modules[name];
                }
                modules[name] = {};
                return modules[name];
            };
        }();
        player.destroy = function() {
            playerModule.destroy.apply(this, arguments);
        };
        player.message = function() {
            if (!this.ready) {
                eventQueue.push(arguments);
            } else {
                return playerModule.message.apply(this, arguments);
            }
        };
        player.one("ready", function(event) {
            var player = event.target,
                message = player.message;
            for (var i = 0, len = eventQueue.length; i < len; i++) {
                message.apply(player, eventQueue[i]);
            }
        });
    };

    /**
     * @property isHTML5Player
     * @ignore
     * The logic that determines whether we're using flash or html
     */
    core.isHTML5Player = function(userAgent) {
        var n = userAgent ? userAgent.toLowerCase() : "",
            checkSilk = function(n) {
                if (n.indexOf("silk") !== -1) {
                    var reg = /silk\/(\d)/ig,
                        result = parseInt(reg.exec(n)[1], 10);
                    return !isNaN(result) && result >= 2;
                }
                return false;
            },
            checkAndroid = function(n) {
                if (n.indexOf("android") !== -1) {
                    var reg = /android (\d)/ig,
                        result = parseInt(reg.exec(n)[1], 10);
                    return !isNaN(result) && result >= 4;
                }
                return false;
            },
            checkWiiu = function(n) {
                return n.indexOf("wiiu") !== -1;
            };
        return n.indexOf("iphone") !== -1 || n.indexOf("ipad") !== -1 || checkSilk(n) || checkAndroid(n) || checkWiiu(n);
    };

    /**
     * Utility function. Append css to the head.
     * @ignore
     */
    core.appendStyle = function(cssText) {
        var styles = document.createElement("style");
        styles.setAttribute("type", "text/css");
        document.getElementsByTagName("head")[0].appendChild(styles);
        if (styles.styleSheet) {
            styles.styleSheet.cssText = cssText;
        } else {
            styles.appendChild(document.createTextNode(cssText));
        }
    };

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
     * @method processPerformance
     * @ignore
     * @param {MTVNPlayer.Player} player
     * @param {Object} performance data
     */
    core.processPerformance = function(player, data) {
        var startTime = player.config.performance.startTime,
            eventType = MTVNPlayer.Events.PERFORMANCE;
        for (var prop in data) {
            // adjust to the start time recorded by the embed api.
            data[prop] = data[prop] - startTime;
        }
        core.processEvent(player.events[eventType], {
            data: data,
            target: player,
            type: eventType
        });
    };
    /**
     * @method processEvent
     * @ignore
     * @param {Object} {Array} event
     * @param {Object} data
     * Check if event is an Array, if so loop through, else just execute.
     */
    core.processEvent = function(event, data) {
        // trigger a jQuery event if there's an $el.
        if (data && data.target && data.target.$el) {
            data.target.$el.trigger("MTVNPlayer:" + data.type, data);
            // legacy event names
            data.target.$el.trigger("MTVNPlayer:" + getLegacyEventName(data.type), data);
        }
        if (!event) {
            return;
        }
        if (event instanceof Array) { // this will always be same-frame. (instanceof fails cross-frame.)
            // clone array
            event = event.slice();
            // fire in order
            for (var i = 0, len = event.length; i < len; i++) {
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
            numberOfInstances = core.instances.length,
            currentInstance;
        for (i = numberOfInstances; i--;) {
            currentInstance = core.instances[i];
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
        var cbs = onPlayerCallbacks.slice(),
            i = 0,
            len = cbs.length;
        for (i; i < len; i++) {
            cbs[i](player);
        }
    };
    return core;
})(window.MTVNPlayer.module("core"), window.jQuery || window.Zepto);