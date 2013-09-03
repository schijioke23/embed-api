/*global MTVNPlayer, Core, $, Config, _, PackageManager */
// HTML5 Player Module
MTVNPlayer.module("html5").initialize = _.once(function() {
    "use strict";
    var addCSS = function(e, prop, value) {
        e.style.cssText += prop + ":" + value;
    },
    /**
     * remove an instance from the hash map.
     * @ignore
     * @param {contentWindow} source
     */
    removePlayerInstance = function(source) {
        Core.instances = _.reject(Core.instances, function(instance) {
            return instance.source === source;
        });
    },
    /**
     * return the iframe to it's original width and height.
     * @method exitFullScreen
     * @ignore
     * @param {MTVNPlayer.Player} player
     */
    exitFullScreen = function(player) {
        player.isFullScreen = false;
        var c = player.config,
            e = player.containerElement;
        addCSS(e, "position", "static");
        addCSS(e, "z-index", "auto");
        addCSS(e, "width", c.width + "px");
        addCSS(e, "height", c.height + "px");
        player.element.width = c.width + "px";
        player.element.height = c.height + "px";
        player.trigger(MTVNPlayer.Events.FULL_SCREEN_CHANGE);
    },
    /**
     * @method goFullScreen
     * @ignore
     * @param {IFrameElement} iframeElement
     */
    goFullScreen = function(player) {
        var e = player.containerElement,
            highestZIndex = player.config.highestZIndex,
            cssText = player.config.fullScreenCssText;
        player.isFullScreen = true;
        e.style.cssText = cssText ? cssText : "position:fixed;left:0px;top:0px;z-index:" + (highestZIndex || 2147483645) + ";";
        addCSS(e, "width", window.innerWidth + "px");
        addCSS(e, "height", window.innerHeight + "px");
        player.element.width = window.innerWidth + "px";
        player.element.height = window.innerHeight + "px";
        window.scrollTo(0, 0);
        player.trigger(MTVNPlayer.Events.FULL_SCREEN_CHANGE);
    },
    jsonParse = function(str) {
        // choose method.
        jsonParse = function() {
            if (window.JSON) {
                return function(str) {
                    if (str) {
                        return JSON.parse(str);
                    } else {
                        return null;
                    }
                };
            } else if ($ && $.parseJSON) {
                return function(str) {
                    return $.parseJSON(str);
                };
            } else {
                return function() {
                    // no json parsing, fail silently.
                };
            }
        }();
        return jsonParse(str);
    },
    /**
     * @method getMessageData
     * @ignore
     */
    getMessageData = function(data) {
        return data.slice(data.indexOf(":") + 1);
    },
    /**
     * @method onMetadata
     * @ignore
     * @param {Object} data Event data
     * @param {MTVNPlayer.Player} player A player instance
     */
    onMetadata = function(data, player) {
        var obj = jsonParse(getMessageData(data)),
            newIndex = obj.index,
            oldIndex = player.playlistMetadata.index;
        player.currentMetadata = obj;
        if (newIndex !== -1) { // index is -1 for ads.
            player.playlistMetadata.items[obj.index] = obj;
            player.playlistMetadata.index = obj.index;
            if (newIndex !== oldIndex) {
                player.trigger(MTVNPlayer.Events.INDEX_CHANGE, newIndex);
            }
        }
        player.trigger(MTVNPlayer.Events.METADATA, obj);
    },
    /**
     * @method handleMessage
     * @ignore
     */
    handleMessage = function(event) {
        var data = event.data,
            player, playhead, events, eventTypes = MTVNPlayer.Events;
        if (data && data.indexOf && data.indexOf("logMessage:") === -1) {
            player = Core.getPlayerInstance(event.source);
            if (player) {
                events = player.events;
                if (data.indexOf("playState:") === 0) {
                    player.state = getMessageData(data);
                    player.trigger(eventTypes.STATE_CHANGE, player.state);
                    player.trigger(eventTypes.STATE_CHANGE + ":" + player.state, player.state);
                } else if (data.indexOf("config:") === 0) {
                    Config.copyProperties(player.config, jsonParse(getMessageData(data)));
                } else if (data.indexOf("performance:") === 0) {
                    if (player.config.performance) {
                        Core.processPerformance(player, jsonParse(getMessageData(data)));
                    }
                } else if (data.indexOf("playlistComplete") === 0) {
                    player.trigger(eventTypes.PLAYLIST_COMPLETE);
                } else if (data.indexOf("metadata:") === 0) {
                    onMetadata(data, player);
                } else if (data.indexOf("mediaStart") === 0) {
                    player.trigger(eventTypes.MEDIA_START);
                } else if (data.indexOf("mediaEnd") === 0) {
                    player.trigger(eventTypes.MEDIA_END);
                } else if (data.indexOf("playheadUpdate") === 0) {
                    var lastPlayhead = Math.floor(player.playhead);
                    playhead = parseInt(getMessageData(data), 10);
                    player.playhead = playhead;
                    player.trigger(eventTypes.PLAYHEAD_UPDATE, playhead);
                    // support for cue points.
                    if (lastPlayhead != Math.floor(playhead)) {
                        player.trigger(eventTypes.PLAYHEAD_UPDATE + ":" + Math.floor(playhead), playhead);
                    }
                } else if (data.indexOf("playlistMetadata:") === 0) {
                    player.playlistMetadata = jsonParse(getMessageData(data));
                } else if (data === "onReady") {
                    player.ready = true;
                    var fv = player.config.flashVars;
                    if (fv && fv.sid) {
                        player.message.call(player, "setSSID:" + fv.sid);
                    }
                    var startIndex = parseInt(player.config.startIndex, 10);
                    if (!isNaN(startIndex) && startIndex > 0) {
                        player.message.call(player, "startIndex:" + startIndex);
                    }
                    Core.executeCallbacks(player);
                    player.trigger(eventTypes.READY);
                } else if (data === "fullscreen") {
                    if (player.isFullScreen) {
                        exitFullScreen(player);
                    } else {
                        goFullScreen(player);
                    }
                } else if (data.indexOf("overlayRectChange:") === 0) {
                    player.trigger(eventTypes.OVERLAY_RECT_CHANGE, jsonParse(getMessageData(data)));
                } else if (data.indexOf("onUIStateChange:") === 0) {
                    player.trigger(eventTypes.UI_STATE_CHANGE, jsonParse(getMessageData(data)));
                } else if (data.indexOf("airplay") === 0) {
                    player.trigger(eventTypes.AIRPLAY);
                } else if (data.indexOf("onEndSlate:") === 0 || data.indexOf("endslate") === 0) {
                    player.trigger(PackageManager.Events.ENDSLATE, jsonParse(getMessageData(data)));
                }
            }
        }
    },
    createElement = function(player) {
        var config = player.config,
            element = document.createElement("iframe"),
            targetDiv = document.getElementById(player.id);
        element.setAttribute("id", player.id);
        element.setAttribute("src", Core.getPath(config));
        element.setAttribute("frameborder", "0");
        element.setAttribute("scrolling", "no");
        element.setAttribute("type", "text/html");
        element.width = element.height = "100%";
        targetDiv.parentNode.replaceChild(element, targetDiv);
        player.element = element;
    };
    /**
     * create the player iframe
     * @method create
     * @ignore
     */
    this.create = function(player, exists) {
        if (!exists) {
            createElement(player);
        }
        Core.instances.push({
            source: player.element.contentWindow,
            player: player
        });
        if (typeof window.addEventListener !== 'undefined') {
            window.addEventListener('message', handleMessage, false);
        } else if (typeof window.attachEvent !== 'undefined') {
            window.attachEvent('onmessage', handleMessage);
        }
    };
    /**
     * Send messages to the iframe via post message.
     * Run in the context of {@link MTVNPlayer.Player}
     * @method message
     * @ignore
     */
    this.message = function(message) {
        if (!this.ready) {
            throw new Error("MTVNPlayer.Player." + message + "() called before player loaded.");
        }
        switch (message) {
            case "goFullScreen":
                goFullScreen.apply(this, [this]);
                break;
            case "exitFullScreen":
                exitFullScreen.apply(this, [this]);
                break;
            case "playUri":
            case "playURI":
                this.config.uri = arguments[1];
                // when calling play uri from the player we lose the ref, call it from the page instead.
                this.element.src = Core.getPath(this.config);
                break;
            default:
                if (arguments[1] !== undefined) {
                    message += ":" + arguments[1] + (arguments[2] !== undefined ? "," + arguments[2] : "");
                }
                return this.element.contentWindow.postMessage(message, "*");
        }
    };
    this.destroy = function() {
        removePlayerInstance(this.element.contentWindow);
        this.element.parentNode.removeChild(this.element);
    };
    function callFullScreenOnAll() {
        var i, player = null,
            instances = Core.instances,
            numberOfInstances = instances.length;
        for (i = numberOfInstances; i--;) {
            player = instances[i].player;
            if (player.isFullScreen) {
                goFullScreen(player);
            }
        }
    }
    // set up orientationchange handler
    window.addEventListener("orientationchange", function() {
        callFullScreenOnAll();
        // some browsers don't have a refreshed innerWidth and innerHeight immediately, invoke again after 500ms.
        setTimeout(callFullScreenOnAll, 500);
    }, false);
});