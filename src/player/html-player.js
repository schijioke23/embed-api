(function(MTVNPlayer) {
    "use strict";
    // HTML5 Player Module
    var html5 = MTVNPlayer.module("html5");
    if (html5.initialized) {
        return;
    }
    html5.initialized = true;
    html5.initialize = function() {
        html5.initialize = function() {}; //only call this once;
        // private vars
        var core = MTVNPlayer.module("core"),
            processEvent = core.processEvent,
            /**
             * return the iframe to it's original width and height.
             * @method exitFullScreen
             * @ignore
             * @param {MTVNPlayer.Player} player
             */
            exitFullScreen = function(player) {
                player.isFullScreen = false;
                var c = player.config,
                    i = player.element,
                    type = MTVNPlayer.Events.FULL_SCREEN_CHANGE;
                i.style.cssText = "postion:static;z-index:auto;";
                i.width = c.width;
                i.height = c.height;
                processEvent(player.events[type], {
                    target: player,
                    type: type
                });
            },
            /**
             * @method goFullScreen
             * @ignore
             * @param {IFrameElement} iframeElement
             */
            goFullScreen = function(player) {
                var iframeElement = player.element,
                    highestZIndex = player.config.highestZIndex,
                    cssText = player.config.fullScreenCssText,
                    type = MTVNPlayer.Events.FULL_SCREEN_CHANGE;
                player.isFullScreen = true;
                iframeElement.style.cssText = cssText ? cssText : "position:fixed;left:0px;top:0px;z-index:" + (highestZIndex || 2147483645) + ";";
                iframeElement.width = window.innerWidth;
                iframeElement.height = window.innerHeight;
                window.scrollTo(0, 0);
                processEvent(player.events[type], {
                    target: player,
                    type: type
                });
            },
            jsonParse = function(str) {
                // choose method.
                jsonParse = function() {
                    var $ = core.$;
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
                        processEvent(player.events[MTVNPlayer.Events.INDEX_CHANGE], {
                            data: newIndex,
                            target: player,
                            type: MTVNPlayer.Events.INDEX_CHANGE
                        });
                    }
                }
                processEvent(player.events[MTVNPlayer.Events.METADATA], {
                    data: obj,
                    target: player,
                    type: MTVNPlayer.Events.METADATA
                });
            },
            /**
             * @method handleMessage
             * @ignore
             */
            handleMessage = function(event) {
                var data = event.data,
                    player, playhead, events, eventTypes = MTVNPlayer.Events;
                if (data && data.indexOf && data.indexOf("logMessage:") === -1) {
                    player = core.getPlayerInstance(event.source);
                    if (player) {
                        events = player.events;
                        if (data.indexOf("playState:") === 0) {
                            player.state = getMessageData(data);
                            processEvent(events[eventTypes.STATE_CHANGE], {
                                data: player.state,
                                target: player,
                                type: eventTypes.STATE_CHANGE
                            });
                            core.processEvent(events[eventTypes.STATE_CHANGE + ":" + player.state], {
                                data: player.state,
                                target: player,
                                type: eventTypes.STATE_CHANGE + ":" + player.state
                            });
                        } else if (data.indexOf("playlistComplete") === 0) {
                            processEvent(events[eventTypes.PLAYLIST_COMPLETE], {
                                data: null,
                                target: player,
                                type: eventTypes.PLAYLIST_COMPLETE
                            });
                        } else if (data.indexOf("metadata:") === 0) {
                            onMetadata(data, player);
                        } else if (data.indexOf("mediaStart") === 0) {
                            processEvent(events[eventTypes.MEDIA_START], {
                                data: null,
                                target: player,
                                type: eventTypes.MEDIA_START
                            });
                        } else if (data.indexOf("mediaEnd") === 0) {
                            processEvent(events[eventTypes.MEDIA_END], {
                                data: null,
                                target: player,
                                type: eventTypes.MEDIA_END
                            });
                        } else if (data.indexOf("playheadUpdate") === 0) {
                            var lastPlayhead = Math.floor(player.playhead);
                            playhead = parseInt(getMessageData(data), 10);
                            player.playhead = playhead;
                            processEvent(events[eventTypes.PLAYHEAD_UPDATE], {
                                data: playhead,
                                target: player,
                                type: eventTypes.PLAYHEAD_UPDATE
                            });
                            // support for cue points.
                            if (lastPlayhead != Math.floor(playhead)) {
                                core.processEvent(events[eventTypes.PLAYHEAD_UPDATE + ":" + Math.floor(playhead)], {
                                    data: playhead,
                                    target: player,
                                    type: eventTypes.PLAYHEAD_UPDATE + ":" + Math.floor(playhead)
                                });
                            }
                        } else if (data.indexOf("playlistMetadata:") === 0) {
                            player.playlistMetadata = jsonParse(getMessageData(data));
                        } else if (data === "onReady") {
                            player.ready = true;
                            var fv = player.config.flashVars;
                            if (fv && fv.sid) {
                                player.message.call(player, "setSSID:" + fv.sid);
                            }
                            core.executeCallbacks(player);
                            processEvent(events[eventTypes.READY], {
                                data: null,
                                target: player,
                                type: eventTypes.READY
                            });
                        } else if (data === "fullscreen") {
                            if (player.isFullScreen) {
                                exitFullScreen(player);
                            } else {
                                goFullScreen(player);
                            }
                        } else if (data.indexOf("overlayRectChange:") === 0) {
                            processEvent(events[eventTypes.OVERLAY_RECT_CHANGE], {
                                data: jsonParse(getMessageData(data)),
                                target: player,
                                type: eventTypes.OVERLAY_RECT_CHANGE
                            });
                        } else if (data.indexOf("onUIStateChange:") === 0) {
                            processEvent(events[eventTypes.UI_STATE_CHANGE], {
                                data: jsonParse(getMessageData(data)),
                                target: player,
                                type: eventTypes.UI_STATE_CHANGE
                            });
                        } else if (data.indexOf("airplay") === 0) {
                            processEvent(events[eventTypes.AIRPLAY], {
                                data: null,
                                target: player,
                                type: eventTypes.AIRPLAY
                            });
                        } else if (data.indexOf("onEndSlate:") === 0) {
                            var endSlateEvent = MTVNPlayer.module("ModuleLoader").Events.END_SLATE;
                            processEvent(events[endSlateEvent], {
                                data: jsonParse(getMessageData(data)),
                                target: player,
                                type: "onEndSlate"
                            });
                        }
                    }
                }
            },
            createElement = function(player) {
                var config = player.config,
                    element = document.createElement("iframe"),
                    targetDiv = document.getElementById(player.id);
                element.setAttribute("id", player.id);
                element.setAttribute("src", core.getPath(config));
                element.setAttribute("frameborder", "0");
                element.setAttribute("scrolling", "no");
                element.setAttribute("type", "text/html");
                element.height = config.height;
                element.width = config.width;
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
            core.instances.push({
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
            default:
                if (arguments[1] !== undefined) {
                    message += ":" + arguments[1] + (arguments[2] !== undefined ? "," + arguments[2] : "");
                }
                return this.element.contentWindow.postMessage(message, "*");
            }
        };
        // set up orientationchange handler for iPad
        var n = window.navigator.userAgent.toLowerCase();
        if (n.indexOf("ipad") !== -1) {
            document.addEventListener("orientationchange", function() {
                var i, player = null,
                    instances = core.instances,
                    numberOfInstances = instances.length;
                for (i = numberOfInstances; i--;) {
                    player = instances[i].player;
                    if (player.isFullScreen) {
                        goFullScreen(player);
                    }
                }
            }, false);
        }
    };
})(window.MTVNPlayer);