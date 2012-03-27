/** 
 * For creating a player inline see MTVNPlayer.Player constructor.
 * For creating a player or group of players defined in HTML see {@link MTVNPlayer#createPlayers}
 * @static 
 */
var MTVNPlayer = MTVNPlayer || {};
if (!MTVNPlayer.Player) {
    /**
     * Events dispatched by {@link MTVNPlayer.Player}.
     *
     * All events have a target property (event.target) which is the player that dispatched the event.
     * Some events have a data property (event.data) which contains data specific to the event.
     * 
     * # How to listen to events
     * Attached to player instance via {@link MTVNPlayer.Player#bind}:
     *      player.bind("onMetadata",function(event) {  
     *             var metadata = event.data;
     *          }    
     *      });
     * Passed in as an Object to the constructor {@link MTVNPlayer.Player}:
     *      var player = new MTVNPlayer.Player("video-player",config,{
     *              onMetadata:function(event) {
     *                  var metadata = event.data;
     *              }
     *      });
     * Passed as an Object into {@link MTVNPlayer#createPlayers}
     *      MTVNPlayer.createPlayers("div.MTVNPlayer",config,{
     *              onMetadata:function(event) {
     *                  var metadata = event.data;
     *                  // player that dispatched the event
     *                  var player = event.player;
     *                  var uri = event.player.config.uri;
     *              }
     *      });
     * Attached to player from {@link MTVNPlayer#onPlayer}
     *      MTVNPlayer.onPlayer(function(player){
     *              player.bind("onMetadata",function(event) {  
     *                  var metadata = event.data;
     *              }    
     *      });
     * 
     */
    MTVNPlayer.Events = {
        /**
         * @event onMetadata
         * Fired when the metadata changes. event.data is the metadata.
         */
        METADATA: "onMetadata",
        /**
         * @event onStateChange
         * Fired when the play state changes. event.data is the state.
         */
        STATE_CHANGE: "onStateChange",
        /**
         * @event onMediaStart
         * Fired once per playlist item (content + ads/bumpers).
         */
        MEDIA_START: "onMediaStart",
        /**
         * @event onMediaEnd
         * Fired when a playlist item ends, this includes its prerolls and postrolls
         */
        MEDIA_END: "onMediaEnd",
        /**
         * @event onPlayheadUpdate
         * Fired as the playhead moves. event.data is the playhead time.
         */
        PLAYHEAD_UPDATE: "onPlayheadUpdate",
        /**
         * @event onPlaylistComplete
         * Fired once per playlist item (content + ads/bumpers)
         */
        PLAYLIST_COMPLETE: "onPlaylistComplete",
        /**
         * @deprecated 1.5.0 Use {@link MTVNPlayer.Events#onUIStateChange} instead
         * @event onOverlayRectChange
         * Fired when the GUI appears, event.data contains an {Object} {x:0,y:0,width:640,height:320}
         */
        OVERLAY_RECT_CHANGE: "onOverlayRectChange",
        /**
         * @event onReady
         * Fired once the API and metadata are available
         */
        READY: "onReady",
        /**
         * @event onUIStateChange
         * Fired when the UI changes its state, ususally due to user interaction, or lack of.
         * 
         * event.data will contain information about the state.
         
         * - data.active <code>Boolean</code>: If true, user has activated the UI by clicking or touching. 
         * If false, the user has remained idle with out interaction for a predetermined amount of time.
         * - data.overlayRect <code>Object</code>: the area that is not obscured by the GUI, a rectangle such as <code>{x:0,y:0,width:640,height:320}</code>
         */
        UI_STATE_CHANGE: "onUIStateChange"
    };
    // swfobject callback
    MTVNPlayer.onSWFObjectLoaded = null;
    /**  
     * @class MTVNPlayer.Player
     * The player object: use it to hook into events ({@link MTVNPlayer.Events}), call methods, and read properties.
     *      var player = new MTVNPlayer.Player(element/id,config,events);
     *      player.bind("onReady",function(event){player.mute();});
     *      player.pause();
     * @constructor
     * Create a new MTVNPlayer.Player
     * @param {String/HTMLElement} id-or-element Pass in a string id, or an actual HTMLElement
     * @param {Object} config config object, see: {@link MTVNPlayer.Player#config}
     * @param {Object} events Event callbacks, see: {@link MTVNPlayer.Events}
     * @returns MTVNPlayer.Player
     */
    MTVNPlayer.Player = (function(window, $) {
        "use strict";
        // static methods variables
        var baseURL = "http://media.mtvnservices.com/",
            swfobjectBase = baseURL + "player/api/swfobject/",
            html5 = null,
            flash = null,
            selector = $,
            throwError = function(message) {
                throw new Error("Embed API:" + message);
            },
            onPlayerCallbacks = [],
            document = window.document,
            isIDevice = (function() {
                var n = window.navigator.userAgent.toLowerCase();
                return n.indexOf("iphone") !== -1 || n.indexOf("ipad") !== -1;
            })(),
            getPath = function(config) {
                if (config.templateURL) {
                    return config.templateURL.replace("{uri}", config.uri);
                }
                return baseURL + config.uri;
            },
            instances = [],
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
            Player,
            /**
             * @method getPlayerInstance
             * @private
             * @param {ContentWindow} source
             * @returns {MTVNPlayer.Player} A player instance
             */
            getPlayerInstance = function(source) {
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
            },
            message = function(message) {
                if (this.isFlash) {
                    if (message === "play") {
                        message = "unpause";
                    }
                    var delimiterIndex = message.indexOf(":"),
                        methodName, args;
                    if (delimiterIndex !== -1) {
                        methodName = message.slice(0, delimiterIndex);
                        args = message.slice(delimiterIndex + 1);
                        return this.getPlayerElement()[methodName](args);
                    } else {
                        return this.getPlayerElement()[message]();
                    }
                }
                return this.getPlayerElement().contentWindow.postMessage(message, "*");
            },
            /**
             * @method checkEventName
             * @private
             * @param {String} eventName
             * Check if the event exists in our list of events.
             */
            checkEventName = function(eventName) {
                var event, events = MTVNPlayer.Events;
                for (event in events) {
                    if (events.hasOwnProperty(event) && events[event] === eventName) {
                        return;
                    }
                }
                throw new Error("MTVNPlayer.Player event:" + eventName + " doesn't exist.");
            },
            /**
             * @method checkEvents
             * @private
             * @param {Object} events
             * Loop through the events, and check the event names
             */
            checkEvents = function(events) {
                for (var event in events) {
                    if (events.hasOwnProperty(event)) {
                        checkEventName(event);
                    }
                }
            },
            /**
             * @method processEvent
             * @private
             * @param {Object} {Array} event
             * @param {Object} data
             * Check if event is an Array, if so loop through, else just execute.
             */
            processEvent = function(event, data) {
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
            },
            /**
             * return the iframe to it's original width and height
             * @method exitFullScreen
             * @private
             * @param {MTVNPlayer.Player} player
             */
            exitFullScreen = function(player) {
                player.isFullScreen = false;
                var c = player.config,
                    i = player.getPlayerElement();
                i.style.cssText = "postion:static;z-index:auto;";
                i.width = c.width;
                i.height = c.height;
            },
            /**
             * @method goFullScreen
             * @private
             * @param {IFrameElement} iframeElement
             */
            goFullScreen = function(player) {
                var iframeElement = player.getPlayerElement(),
                    highestZIndex = player.config.highestZIndex,
                    cssText = player.config.fullScreenCssText;
                player.isFullScreen = true;
                iframeElement.style.cssText = cssText ? cssText : "position:fixed;left:0px;top:0px;z-index:" + (highestZIndex || 2147483645) + ";";
                iframeElement.width = isIDevice ? window.innerWidth : "100%"; // 100% doesn't work on iPad.
                iframeElement.height = isIDevice ? window.innerHeight : "100%";
                window.scrollTo(0, 0);
            },
            executeCallbacks = function(player) {
                for (var i = 0, len = onPlayerCallbacks.length; i < len; i++) {
                    onPlayerCallbacks[i](player);
                }
            },
            initializeHTML = function() {
                initializeHTML = function() {}; // call only once
                html5 = {};
                /**
                 * @method getMessageData
                 * @private
                 */
                var getMessageData = function(data) {
                        return data.slice(data.indexOf(":") + 1);
                    },
                    /**
                     * @method onMetadata
                     * @private
                     * @param {Object} data Event data
                     * @param {MTVNPlayer.Player} player A player instance
                     */
                    onMetadata = function(data, player) {
                        var obj = jsonParse(getMessageData(data));
                        player.currentMetadata = obj;
                        if (obj.index !== -1) { // index is -1 for ads.
                            player.playlistMetadata.items[obj.index] = obj;
                            player.playlistMetadata.index = obj.index;
                        }
                        processEvent(player.events.onMetadata, {
                            data: obj,
                            target: player
                        });
                    },
                    /**
                     * @method handleMessage
                     * @private
                     */
                    handleMessage = function(event) {
                        var data = event.data,
                            player, events;
                        if (data && data.indexOf && data.indexOf("logMessage:") === -1) {
                            player = getPlayerInstance(event.source);
                            if (player) {
                                events = player.events;
                                if (data.indexOf("playState:") === 0) {
                                    player.state = getMessageData(data);
                                    processEvent(events.onStateChange, {
                                        data: player.state,
                                        target: player
                                    });
                                } else if (data.indexOf("playlistComplete") === 0) {
                                    processEvent(events.onPlaylistComplete, {
                                        data: null,
                                        target: player
                                    });
                                } else if (data.indexOf("metadata:") === 0) {
                                    onMetadata(data, player);
                                } else if (data.indexOf("mediaStart") === 0) {
                                    processEvent(events.onMediaStart, {
                                        data: null,
                                        target: player
                                    });
                                } else if (data.indexOf("mediaEnd") === 0) {
                                    processEvent(events.onMediaEnd, {
                                        data: null,
                                        target: player
                                    });
                                } else if (data.indexOf("playheadUpdate") === 0) {
                                    processEvent(events.onPlayheadUpdate, {
                                        data: parseInt(getMessageData(data), 10),
                                        target: player
                                    });
                                } else if (data.indexOf("playlistMetadata:") === 0) {
                                    player.playlistMetadata = jsonParse(getMessageData(data));
                                } else if (data === "onReady") {
                                    var fv = player.config.flashVars;
                                    if (fv && fv.sid) {
                                        message.call(player, "setSSID:" + fv.sid);
                                    }
                                    executeCallbacks(player);
                                    processEvent(events.onReady, {
                                        data: null,
                                        target: player
                                    });
                                } else if (data === "fullscreen") {
                                    if (player.isFullScreen) {
                                        exitFullScreen(player);
                                    } else {
                                        player.isFullScreen = true;
                                        goFullScreen(player);
                                    }
                                } else if (data.indexOf("overlayRectChange:") === 0) {
                                    processEvent(events.onOverlayRectChange, {
                                        data: jsonParse(getMessageData(data)),
                                        target: player
                                    });
                                } else if (data.indexOf("onUIStateChange:") === 0) {
                                    processEvent(events.onUIStateChange, {
                                        data: jsonParse(getMessageData(data)),
                                        target: player
                                    });
                                }
                            }
                        }
                    };
                /**
                 * create the player iframe
                 * @method create
                 * @private
                 */
                html5.create = function(player) {
                    var config = player.config,
                        element = document.createElement("iframe"),
                        targetDiv = document.getElementById(player.id);
                    element.setAttribute("id", player.id);
                    element.setAttribute("src", getPath(config));
                    element.setAttribute("frameborder", "0");
                    element.setAttribute("scrolling", "no");
                    element.setAttribute("type", "text/html");
                    element.height = config.height;
                    element.width = config.width;
                    targetDiv.parentNode.replaceChild(element, targetDiv);
                    if (typeof window.addEventListener !== 'undefined') {
                        window.addEventListener('message', handleMessage, false);
                    } else if (typeof window.attachEvent !== 'undefined') {
                        window.attachEvent('onmessage', handleMessage);
                    }
                    instances.push({
                        source: element.contentWindow,
                        player: player
                    });
                };
                // set up orientationchange handler for iPad
                var n = window.navigator.userAgent.toLowerCase();
                if (n.indexOf("ipad") !== -1) {
                    document.addEventListener("orientationchange", function() {
                        var i, player = null,
                            numberOfInstances = instances.length;
                        for (i = numberOfInstances; i--;) {
                            player = instances[i].player;
                            if (player.isFullScreen) {
                                goFullScreen(player);
                            }
                        }
                    }, false);
                }
            },
            /**
             * set up handling of flash external interface calls
             * create functions to map metadata to new format,
             * and handle media player events
             * @method initializeFlash
             * @private
             */
            initializeFlash = function() {
                initializeFlash = function() {}; // only call once
                flash = {};
                var swfobject = window.swfobject || MTVNPlayer.swfobject,
                    makeWSwfObject = function(targetID, config) {
                        var attributes = config.attributes || {},
                            params = config.params || {
                                allowFullScreen: true
                            },
                            flashVars = config.flashVars || {};
                        // we always want script access.
                        params.allowScriptAccess = "always";
                        flashVars.objectID = targetID; // TODO objectID is used by the player.
                        swfobject.embedSWF(getPath(config), targetID, config.width, config.height, "10.0.0", swfobjectBase + "expressInstall.swf", flashVars, params, attributes);
                    },
                    swfObjectInit = {
                        requested: false,
                        items: []
                    },
                    onSWFObjectLoaded = function(loadedSwfObject) {
                        swfobject = loadedSwfObject;
                        delete MTVNPlayer.onSWFObjectLoaded;
                        for (var items = swfObjectInit.items, i = items.length; i--;) {
                            items[i]();
                        }
                    };
                MTVNPlayer.onSWFObjectLoaded = onSWFObjectLoaded;
                flash.create = function(player) {
                    var tag, firstScriptTag, targetID = player.id,
                        config = player.config;
                    instances.push({
                        source: targetID,
                        player: player
                    });
                    if (typeof(swfobject) === "undefined") {
                        // queue request
                        swfObjectInit.items.push((function(elementId, elementConfig) {
                            var callBack = function() {
                                    makeWSwfObject(elementId, elementConfig);
                                };
                            return callBack;
                        }(targetID, config)));
                        // load swf object
                        if (!swfObjectInit.requested) {
                            swfObjectInit.requested = true;
                            tag = document.createElement('script');
                            tag.src = swfobjectBase + "swfobject.js";
                            tag.language = "javascript";
                            firstScriptTag = document.getElementsByTagName('script')[0];
                            if (!firstScriptTag) {
                                firstScriptTag = document.body; // for buster tests
                            }
                            firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
                        }
                    } else {
                        makeWSwfObject(targetID, config);
                    }
                };
                MTVNPlayer.Player.flashEventMap = {};
                var processMetadata = function(metadata, playlistItems, index) {
                        var m = {},
                            rss;
                        m.duration = metadata.duration;
                        // TODO no live. 
                        m.live = false;
                        m.isAd = metadata.isAd;
                        m.isBumper = metadata.isBumper;
                        if (index !== undefined) {
                            m.index = index;
                        } else {
                            m.index = function(guid) {
                                var len = playlistItems.length,
                                    i;
                                for (i = len; i--;) {
                                    if (playlistItems[i].metaData.guid === guid) {
                                        return i;
                                    }
                                }
                                return -1;
                            }(metadata.guid);
                        }
                        rss = m.rss = {};
                        rss.title = metadata.title;
                        rss.description = metadata.description;
                        rss.guid = metadata.guid;
                        rss.link = metadata.link;
                        rss.image = metadata.thumbnail;
                        rss.group = {};
                        rss.group.categories = (function() {
                            var displayData = metadata.displayData;
                            return {
                                isReportable: metadata.reportable,
                                source: displayData.source,
                                sourceLink: displayData.sourceLink,
                                seoHTMLText: displayData.seoHTMLText
                            };
                        })();
                        return m;
                    },
                    processPlaylistMetadata = function(metadata) {
                        var m = {},
                            items = metadata.items,
                            numberOfItems = items.length,
                            i;
                        m.description = metadata.description;
                        m.title = metadata.title;
                        m.link = metadata.link;
                        m.items = [];
                        for (i = numberOfItems; i--;) {
                            m.items[i] = processMetadata(items[i], null, i);
                        }
                        return m;
                    },
                    getPlaylistItemsLegacy = function(playlistItems) {
                        var m = {
                            items: []
                        },
                            numberOfItems = playlistItems.length,
                            i;
                        for (i = numberOfItems; i--;) {
                            m.items[i] = processMetadata(playlistItems[i].metaData, null, i);
                        }
                        return m;
                    },
                    addFlashEvents = function(player) {
                        var events = player.events,
                            map = MTVNPlayer.Player.flashEventMap,
                            id = "player" + Math.round(Math.random() * 1000000),
                            element = player.getPlayerElement(),
                            mapString = "MTVNPlayer.Player.flashEventMap." + id,
                            // this list of events is just for legibility. google closure compiler
                            // will in-line the strings
                            metadataEvent = MTVNPlayer.Events.METADATA,
                            stateEvent = MTVNPlayer.Events.STATE_CHANGE,
                            playlistCompleteEvent = MTVNPlayer.Events.PLAYLIST_COMPLETE,
                            readyEvent = MTVNPlayer.Events.READY,
                            mediaEnd = MTVNPlayer.Events.MEDIA_END,
                            mediaStart = MTVNPlayer.Events.MEDIA_START,
                            playheadUpdate = MTVNPlayer.Events.PLAYHEAD_UPDATE;
                        // the first metadata event will trigger the readyEvent
                        map[id + metadataEvent] = function(metadata) {
                            var playlistItems = player.getPlayerElement().getPlaylist().items,
                                processedMetadata = processMetadata(metadata, playlistItems),
                                playlistMetadata = player.playlistMetadata,
                                fireReadyEvent = false;
                            player.currentMetadata = processedMetadata;
                            if (processedMetadata.index !== -1) { // index is -1 for ads.
                                if (!playlistMetadata) {
                                    // this is our first metadata event
                                    fireReadyEvent = true;
                                    try {
                                        playlistMetadata = processPlaylistMetadata(player.getPlayerElement().getPlaylistMetadata());
                                    } catch (e) {
                                        playlistMetadata = getPlaylistItemsLegacy(playlistItems);
                                    }
                                }
                                playlistMetadata.items[processedMetadata.index] = processedMetadata;
                                playlistMetadata.index = processedMetadata.index;
                                player.playlistMetadata = playlistMetadata;
                                if (fireReadyEvent) {
                                    processEvent(events[readyEvent], {
                                        data: processedMetadata,
                                        target: player
                                    });
                                }
                            }
                            processEvent(events[metadataEvent], {
                                data: processedMetadata,
                                target: player
                            });
                        };
                        element.addEventListener('METADATA', mapString + metadataEvent);
                        map[id + stateEvent] = function(state) {
                            player.state = state;
                            processEvent(events[stateEvent], {
                                data: state,
                                target: player
                            });
                        };
                        element.addEventListener('STATE_CHANGE', mapString + stateEvent);
                        map[id + playheadUpdate] = function(playhead) {
                            player.playhead = playhead;
                            processEvent(events[playheadUpdate], {
                                data: playhead,
                                target: player
                            });
                        };
                        element.addEventListener('PLAYHEAD_UPDATE', mapString + playheadUpdate);
                        map[id + playlistCompleteEvent] = function() {
                            processEvent(events[playlistCompleteEvent], {
                                data: null,
                                target: player
                            });
                        };
                        element.addEventListener('PLAYLIST_COMPLETE', mapString + playlistCompleteEvent);
                        map[id + mediaStart] = function() {
                            processEvent(events[mediaStart], {
                                data: null,
                                target: player
                            });
                        };
                        // TODO does this fire for ads?
                        element.addEventListener("READY", mapString + mediaStart);
                        map[id + mediaEnd] = function() {
                            processEvent(events[mediaEnd], {
                                data: null,
                                target: player
                            });
                        };
                        // yes, flash event is media ended unfort.
                        element.addEventListener("MEDIA_ENDED", mapString + mediaEnd);
                    };
                window.mtvnPlayerLoaded = function(e) {
                    return function(id) {
                        if (e) {
                            e(id);
                        }
                        var player = getPlayerInstance(id);
                        executeCallbacks(player);
                        addFlashEvents(player);
                    };
                }(window.mtvnPlayerLoaded);
            },
            getEmbedCode = function() {
                var config = this.config,
                    metadata = this.currentMetadata,
                    displayDataPrefix = "<p style=\"text-align:left;background-color:#FFFFFF;padding:4px;margin-top:4px;margin-bottom:0px;font-family:Arial, Helvetica, sans-serif;font-size:12px;\">",
                    displayMetadata = (function() {
                        if (!metadata) {
                            return "";
                        }
                        var copy = "",
                            categories = metadata.rss.group.categories,
                            source = categories.source,
                            sourceLink = categories.sourceLink,
                            seoHTMLText = categories.seoHTMLText;
                        if (source) {
                            if (sourceLink) {
                                copy += "<b><a href=\"" + sourceLink + "\">" + source + "</a></b>";
                            } else {
                                copy += "<b>" + source + "</b> ";
                            }
                        }
                        if (seoHTMLText) {
                            if (copy) {
                                copy += "<br/>";
                            }
                            copy += "Get More: " + seoHTMLText;
                        }
                        if (copy) {
                            copy = displayDataPrefix + copy + "</p>";
                        }
                        return copy;
                    })(),
                    embedCode = "<div style=\"background-color:#000000;width:{divWidth}px;\"><div style=\"padding:4px;\">" + "<iframe src=\"http://media.mtvnservices.com/embed/{uri}\" width=\"{width}\" height=\"{height}\" frameborder=\"0\"></iframe>" + "{displayMetadata}</div></div>";
                embedCode = embedCode.replace(/\{uri\}/, config.uri);
                embedCode = embedCode.replace(/\{width\}/, config.width);
                embedCode = embedCode.replace(/\{divWidth\}/, config.width + 8);
                embedCode = embedCode.replace(/\{height\}/, config.height);
                embedCode = embedCode.replace(/\{displayMetadata\}/, displayMetadata);
                return embedCode;
            },
            copyProperties = function(toObj, fromObj) {
                if (fromObj) {
                    for (var prop in fromObj) {
                        if (fromObj.hasOwnProperty(prop)) {
                            if (fromObj[prop]) {
                                var propName = prop.toLowerCase();
                                if (propName === "flashvars" || propName === "attributes" || propName === "params") {
                                    copyProperties(toObj[prop], fromObj[prop]);
                                } else {
                                    toObj[prop] = fromObj[prop];
                                }
                            }
                        }
                    }
                }
                return toObj;
            },
            buildConfig = function(el, config) {
                var getDataAttr = function(attr) {
                        return el.getAttribute("data-" + attr);
                    },
                    getStyleAttr = function(attr) {
                        return el.style[attr];
                    },
                    getObjectFromNameValue = function(attr) {
                        attr = getDataAttr(attr);
                        if (attr) {
                            var i, result = {},
                                pairs = attr.split("&"),
                                pair;
                            for (i = pairs.length; i--;) {
                                pair = pairs[i].split("=");
                                if (pair && pair.length == 2) {
                                    result[pair[0]] = pair[1];
                                }
                            }
                            return result;
                        }
                    },
                    configFromEl = {
                        uri: getDataAttr("contenturi"),
                        width: getStyleAttr("width"),
                        height: getStyleAttr("height"),
                        flashVars: getObjectFromNameValue("flashVars"),
                        attributes: getObjectFromNameValue("attributes")
                    };
                return copyProperties(config, configFromEl);
            },
            createId = function(target) {
                var newID = "mtvnPlayer" + Math.round(Math.random() * 10000000);
                target.setAttribute("id", newID);
                return newID;
            };
        // end private vars
        /**
         * @member MTVNPlayer
         * Whenever a player is created, the callback passed will fire with the player as the first
         * argument, providing an easy way to hook into player events in a decoupled way.
         * @param {Function} callback A callback fired when every player is created.
         * 
         *     MTVNPlayer.onPlayer(function(player){
         *         player.bind("onReady",function(event) {  
         *             // do something
         *         }    
         *     });
         */
        MTVNPlayer.onPlayer = function(callback) {
            onPlayerCallbacks.push(callback);
        };
        /**
         * @member MTVNPlayer
         * (Available in 1.6.0) Remove a callback registered width {@link MTVNPlayer#onPlayer}
         * @param {Function} callback A callback fired when every player is created.
         */
        MTVNPlayer.removeOnPlayer = function(callback) {
            var index = onPlayerCallbacks.indexOf(callback);
            if (index !== -1) {
                onPlayerCallbacks.splice(index, 1);
            }
        };
        /**
         * @member MTVNPlayer
         * Returns an array containing each {@link MTVNPlayer.Player} created.
         * @returns {Array} An array containing each {@link MTVNPlayer.Player} created. 
         */
        MTVNPlayer.getPlayers = function() {
            var result = [],
                i = instances.length;
            for (i; i--;) {
                result.push(instances[i].player);
            }
            return result;
        };
        /**
         * @member MTVNPlayer
         * Create players from elements in the page.
         * @param {String} selector default is "div.MTVNPlayer"
         * @param {Object} config {@link MTVNPlayer.Player#config}
         * @param {Object} events {@link MTVNPlayer.Events}
         *
         * Example:
         *      <div class="MTVNPlayer" data-contenturi="mgid:cms:video:nick.com:920786"/>
         *      <script type="text/javascript">
         *              MTVNPlayer.createPlayers("div.MTVNPlayer",{width:640,height:320})
         *      </script>
         *  With events:
         *      <div class="MTVNPlayer" data-contenturi="mgid:cms:video:nick.com:920786"/>
         *      <script type="text/javascript">
         *              MTVNPlayer.createPlayers("div.MTVNPlayer",{width:640,height:320},{
         *                  onPlayheadUpdate:function(event) {
         *                      // do something
         *                  }
         *              });
         *      </script>
         */
        MTVNPlayer.createPlayers = function(selectorQuery, config, events) {
            if (!selectorQuery) {
                selectorQuery = "div.MTVNPlayer";
            }
            if (!selector) {
                /**
                 * micro-selector 
                 * @method selector
                 * @private
                 * author:  Fabio Miranda Costa
                 * github:  fabiomcosta
                 * twitter: @fabiomiranda
                 * license: MIT-style license
                 */
                (function(document) {
                    var elements, parsed, parsedClasses, parsedPseudos, pseudos = {},
                        context, currentDocument, reTrim = /^\s+|\s+$/g;
                    var supports_querySelectorAll = !! document.querySelectorAll;
                    var $u = function(selector, _context, append) {
                            elements = append || [];
                            context = _context || $u.context;
                            if (supports_querySelectorAll) {
                                try {
                                    arrayFrom(context.querySelectorAll(selector));
                                    return elements;
                                } catch (e) {}
                            }
                            currentDocument = context.ownerDocument || context;
                            parse(selector.replace(reTrim, ''));
                            find();
                            return elements;
                        };
                    var matchSelector = function(node) {
                            if (parsed.tag) {
                                var nodeName = node.nodeName.toUpperCase();
                                if (parsed.tag == '*') {
                                    if (nodeName < '@') return false; // Fix for comment nodes and closed nodes
                                } else {
                                    if (nodeName != parsed.tag) return false;
                                }
                            }
                            if (parsed.id && node.getAttribute('id') != parsed.id) {
                                return false;
                            }
                            if ((parsedClasses = parsed.classes)) {
                                var className = (' ' + node.className + ' ');
                                for (var i = parsedClasses.length; i--;) {
                                    if (className.indexOf(' ' + parsedClasses[i] + ' ') < 0) return false;
                                }
                            }
                            if ((parsedPseudos = parsed.pseudos)) {
                                for (var i = parsedPseudos.length; i--;) {
                                    var pseudoClass = pseudos[parsedPseudos[i]];
                                    if (!(pseudoClass && pseudoClass.call($u, node))) return false;
                                }
                            }
                            return true;
                        };
                    var find = function() {
                            var parsedId = parsed.id,
                                merge = ((parsedId && parsed.tag || parsed.classes || parsed.pseudos) || (!parsedId && (parsed.classes || parsed.pseudos))) ? arrayFilterAndMerge : arrayMerge;
                            if (parsedId) {
                                var el = currentDocument.getElementById(parsedId);
                                if (el && (currentDocument === context || contains(el))) {
                                    merge([el]);
                                }
                            } else {
                                merge(context.getElementsByTagName(parsed.tag || '*'));
                            }
                        };
                    var parse = function(selector) {
                            parsed = {};
                            while ((selector = selector.replace(/([#.:])?([^#.:]*)/, parser))) {};
                        };
                    var parser = function(all, simbol, name) {
                            if (!simbol) {
                                parsed.tag = name.toUpperCase();
                            } else if (simbol == '#') {
                                parsed.id = name;
                            } else if (simbol == '.') {
                                if (parsed.classes) {
                                    parsed.classes.push(name);
                                } else {
                                    parsed.classes = [name];
                                }
                            } else if (simbol == ':') {
                                if (parsed.pseudos) {
                                    parsed.pseudos.push(name);
                                } else {
                                    parsed.pseudos = [name];
                                }
                            }
                            return '';
                        };
                    var slice = Array.prototype.slice;
                    var arrayFrom = function(collection) {
                            elements = slice.call(collection, 0);
                        };
                    var arrayMerge = function(collection) {
                            for (var i = 0, node; node = collection[i++];) {
                                elements.push(node);
                            }
                        };
                    try {
                        slice.call(document.documentElement.childNodes, 0);
                    } catch (e) {
                        arrayFrom = arrayMerge;
                    }
                    var arrayFilterAndMerge = function(found) {
                            for (var i = 0, node; node = found[i++];) {
                                if (matchSelector(node)) elements.push(node);
                            }
                        };
                    var contains = function(node) {
                            do {
                                if (node === context) return true;
                            } while ((node = node.parentNode));
                            return false;
                        };
                    $u.pseudos = pseudos;
                    $u.context = document;
                    selector = $u;
                })(document);
            }
            var elements = selector(selectorQuery);
            for (var i = 0, len = elements.length; i < len; i++) {
                new MTVNPlayer.Player(elements[i], copyProperties(config || {}, MTVNPlayer.defaultConfig), events);
            }
        };
        Player = function(elementOrId, config, events) {
            this.state = this.currentMetadata = this.playlistMetadata = null;
            /**
             * @cfg {Object} config The main configuration object.
             * @cfg {String} [config.uri] (required) The URI of the media.
             * @cfg {Number} [config.width] (required) The width of the player
             * @cfg {Number} [config.height] (required) The height of the player
             * @cfg {Object} [config.flashVars] Flashvars are passed to the flash player
             * @cfg {Object} [config.attributes] Probably not useful (see [Adobe Help][1])
             * [1]: http://kb2.adobe.com/cps/127/tn_12701.html
             * @cfg {String} [config.fullScreenCssText] When the HTML5 player goes full screen, this is the css that is set on the iframe.
             * @cfg {String} [config.templateURL] (For TESTING) A URL to use for the embed of iframe src. The template var for uri is {uri}, such as http://site.com/uri={uri}.
             *
             */
            this.config = config || {};
            var create = null,
                el = null,
                isElement = (function(o) {
                    return typeof HTMLElement === "object" ? o instanceof HTMLElement : //DOM2
                    typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string";
                })(elementOrId);
            if (isElement) {
                el = elementOrId;
                this.id = createId(el);
                this.config = buildConfig(el, this.config);
            } else {
                this.id = elementOrId;
                el = document.getElementById(this.id);
            }
            this.events = events || {};
            this.isFlash = this.config.isFlash === undefined ? !isIDevice : this.config.isFlash;
            // make sure the events are valid
            checkEvents(events);
            // this is called later, and references the iframe or embed created, not the target el.
            // TODO just store the ref to the element in this.element.
            this.getPlayerElement = (function() {
                var container = null;
                return function() {
                    if (!container) {
                        container = document.getElementById(this.id);
                    }
                    return container;
                };
            })();
            if (this.isFlash) {
                initializeFlash();
                create = flash.create;
            } else {
                initializeHTML();
                create = html5.create;
            }
            // check for element before creating
            if (!el) {
                if (document.readyState === "complete") {
                    throwError("target div " + this.id + " not found");
                } else {
                    if ($) {
                        (function(ref) {
                            $(document).ready(function() {
                                if (document.getElementById(ref.id)) {
                                    create(ref);
                                } else {
                                    throwError("target div " + ref.id + " not found");
                                }
                            });
                        })(this);
                    } else {
                        throwError("Only call new MTVNPlayer.Player(targetID,..) after the targetID element is in the DOM.");
                    }
                }
                return;
            } else {
                create(this);
            }
        };
        // public api
        Player.prototype = {
            /**
             * Begins playing or unpauses.
             */
            play: function() {
                message.call(this, "play");
            },
            /**
             * Pauses the media.
             */
            pause: function() {
                message.call(this, "pause");
            },
            /**
             * Mutes the volume
             */
            mute: function() {
                message.call(this, "mute");
            },
            /**
             * Returns the volume to the level before it was muted.
             */
            unmute: function() {
                message.call(this, "unmute");
            },
            /**
             * Play an item from the playlist specified by the index
             * @param {Number} index
             */
            playIndex: function(index) {
                message.call(this, "playIndex:" + index);
            },
			/**
             * Play the next item in the playlist, provided that the current item is not an ad
             */
            next: function() {
				if (this.currentMetadata && !this.currentMetadata.isAd){
					message.call(this, "next");
				}
            },
			/**
             * Play the previous item in the playlist, provided that the current item is not an ad
             */
            previous: function() {
				if (this.currentMetadata && !this.currentMetadata.isAd){
					message.call(this, "previous");
				}
            },
            /**
             * Play a new URI
             * @param {String} uri
             */
            playURI: function(uri) {
                message.call(this, "playUri:" + uri);
            },
            /**
             * Change the volume
             * @param {Number} value between 0 and 1.
             */
            setVolume: function(v) {
                message.call(this, "volume:" + v);
            },
            /**
             * Seeks to the time specified in seconds.
             * @param {Number} value between 0 and the duration of the clip or playlist.
             */
            seek: function(v) {
                message.call(this, "seek:" + v);
            },
            /**
             * Returns the embed code used to share this instance of the player
             * @return {String} the embed code as a string.
             */
            getEmbedCode: function() {
                return getEmbedCode.call(this);
            },
            /**
             * Puts the player in full screen mode, does not work for the flash player do the flash restrictions.
             */
            goFullScreen: function() {
                if (html5) {
                    goFullScreen.apply(this, [this]);
                }
            },
            /**
             * Exits full screen and returns the player to its initial embed size.
             * Does not work with Prime builds older than 1.12. 
             */
            exitFullScreen: function() {
                if (html5) {
                    exitFullScreen.apply(this, [this]);
                } else {
                    try {
                        this.getPlayerElement().exitFullScreen();
                    } catch (e) {
                        // fail silently. exit full screen introduced in Prime 1.12
                    }
                }
            },
            /**
             * Adds an event listener for an event.
             * @param {String} eventName an {@link MTVNPlayer.Events}.
             * @param {Function} callback The function to invoke when the event is fired. 
             */
            bind: function(eventName, callback) {
                checkEventName(eventName);
                var currentEvent = this.events[eventName];
                if (!currentEvent) {
                    currentEvent = callback;
                } else if (currentEvent instanceof Array) {
                    currentEvent.push(callback);
                } else {
                    currentEvent = [callback, currentEvent];
                }
                this.events[eventName] = currentEvent;
            },
            /**
             * Removes an event listener
             * @param {String} eventName an MTVNPlayer.Event.
             * @param {Function} callback The function to that was bound to the event.
             */
            unbind: function(eventName, callback) {
                checkEventName(eventName);
                var i, currentEvent = this.events[eventName];
                if (!currentEvent) {
                    return;
                } else if (currentEvent instanceof Array) {
                    for (i = currentEvent.length; i--;) {
                        if (currentEvent[i] === callback) {
                            currentEvent.splice(i, 1);
                            break;
                        }
                    }
                } else {
                    this.events[eventName] = null;
                }
            }
        };
        return Player;
    }(window, window.jQuery || window.Zepto));
    if (typeof MTVNPlayer.onAPIReady === "function") {
        MTVNPlayer.onAPIReady();
    }
    /**
     * @member MTVNPlayer
     * @property {Boolean} 
     * Set to true after the API is loaded.
     */
    MTVNPlayer.isReady = true;
}