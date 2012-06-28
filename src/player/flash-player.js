(function(MTVNPlayer) {
    "use strict";
    var flash = MTVNPlayer.module("flash"),
        core = MTVNPlayer.module("core");
    if (flash.initialized) {
        return;
    }
    flash.initialized = true;
    /**
     * set up handling of flash external interface calls
     * create functions to map metadata to new format,
     * and handle media player events
     * @method initializeFlash
     * @ignore
     */
    flash.initialize = function() {
        flash.initialize = function() {}; // only call once
        var messageNameMap = {
            play: "unpause",
            seek: "setPlayheadTime"
        },
            swfobject = flash.getSWFObject(),
            makeWSwfObject = function(targetID, config) {
                var attributes = config.attributes || {},
                    params = config.params || {
                        allowFullScreen: true
                    },
                    flashVars = config.flashVars || {};
                attributes.data = core.getPath(config);
                attributes.width = config.width;
                attributes.height = config.height;
                // we always want script access.
                params.allowScriptAccess = "always";
                flashVars.objectID = targetID; // TODO objectID is used by the player.
                params.flashVars = (function(fv) {
                    var s = "";
                    for (var p in fv) {
                        s += p + "=" + fv[p] + "&";
                    }
                    return s ? s.slice(0, -1) : "";
                })(flashVars);
                core.getPlayerInstance(targetID).element = swfobject.createSWF(attributes, params, targetID);
            },
            exitFullScreen = function() {
                try {
                    this.element.exitFullScreen();
                } catch (e) {
                    // fail silently. exit full screen introduced in Prime 1.12
                }
            },
            processMetadata = function(metadata, playlistItems, index) {
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
                    element = player.element,
                    mapString = "MTVNPlayer.Player.flashEventMap." + id,
                    // this list of events is just for legibility. google closure compiler
                    // will in-line the strings
                    metadataEvent = MTVNPlayer.Events.METADATA,
                    stateEvent = MTVNPlayer.Events.STATE_CHANGE,
                    playlistCompleteEvent = MTVNPlayer.Events.PLAYLIST_COMPLETE,
                    readyEvent = MTVNPlayer.Events.READY,
                    mediaEnd = MTVNPlayer.Events.MEDIA_END,
                    mediaStart = MTVNPlayer.Events.MEDIA_START,
                    onIndexChange = MTVNPlayer.Events.INDEX_CHANGE,
                    playheadUpdate = MTVNPlayer.Events.PLAYHEAD_UPDATE;
                // the first metadata event will trigger the readyEvent
                map[id + metadataEvent] = function(metadata) {
                    var playlistItems = element.getPlaylist().items,
                        processedMetadata = processMetadata(metadata, playlistItems),
                        playlistMetadata = player.playlistMetadata,
                        fireReadyEvent = false,
                        newIndex = processedMetadata.index,
                        lastIndex = playlistMetadata ? playlistMetadata.index : -1;
                    player.currentMetadata = processedMetadata;
                    if (!playlistMetadata) {
                        // this is our first metadata event
                        fireReadyEvent = true;
                        try {
                            playlistMetadata = processPlaylistMetadata(element.getPlaylistMetadata());
                        } catch (e) {
                            playlistMetadata = getPlaylistItemsLegacy(playlistItems);
                        }
                    }
                    if (newIndex !== -1) { // index is -1 for ads.
                        playlistMetadata.items[newIndex] = processedMetadata;
                        playlistMetadata.index = newIndex;
                        if (lastIndex !== newIndex) {
                            core.processEvent(events[onIndexChange], {
                                data: newIndex,
                                target: player,
                                type: onIndexChange
                            });
                        }
                    }
                    player.playlistMetadata = playlistMetadata;
                    if (fireReadyEvent) {
                        player.ready = true;
                        core.processEvent(events[readyEvent], {
                            data: processedMetadata,
                            target: player,
                            type: readyEvent
                        });
                    }
                    core.processEvent(events[metadataEvent], {
                        data: processedMetadata,
                        target: player,
                        type: metadataEvent
                    });
                };
                element.addEventListener('METADATA', mapString + metadataEvent);
                map[id + stateEvent] = function(state) {
                    player.state = state;
                    core.processEvent(events[stateEvent], {
                        data: state,
                        target: player,
                        type: stateEvent
                    });
                };
                element.addEventListener('STATE_CHANGE', mapString + stateEvent);
                map[id + playheadUpdate] = function(playhead) {
                    player.playhead = playhead;
                    core.processEvent(events[playheadUpdate], {
                        data: playhead,
                        target: player,
                        type: playheadUpdate
                    });
                };
                element.addEventListener('PLAYHEAD_UPDATE', mapString + playheadUpdate);
                map[id + playlistCompleteEvent] = function() {
                    core.processEvent(events[playlistCompleteEvent], {
                        data: null,
                        target: player,
                        type: playlistCompleteEvent
                    });
                };
                element.addEventListener('PLAYLIST_COMPLETE', mapString + playlistCompleteEvent);
                map[id + mediaStart] = function() {
                    core.processEvent(events[mediaStart], {
                        data: null,
                        target: player,
                        type: mediaStart
                    });
                };
                // TODO does this fire for ads?
                element.addEventListener("READY", mapString + mediaStart);
                map[id + mediaEnd] = function() {
                    core.processEvent(events[mediaEnd], {
                        data: null,
                        target: player,
                        type: mediaEnd
                    });
                };
                // yes, flash event is media ended unfort.
                element.addEventListener("MEDIA_ENDED", mapString + mediaEnd);
            };
        MTVNPlayer.Player.flashEventMap = {};
        /**
         * create an embed element
         * Run in the context of {@link MTVNPlayer.Player}
         * @method message
         * @ignore
         */
        this.create = function(player,exists) {
            var tag, firstScriptTag, targetID = player.id,
                config = player.config;
            core.instances.push({
                source: targetID,
                player: player
            });
            if (!exists) {
                makeWSwfObject(targetID, config);
            }
        };
        /**
         * Send messages to the swf via flash external interface
         * Run in the context of {@link MTVNPlayer.Player}
         * @method message
         * @ignore
         */
        this.message = function(message) {
            if (!this.ready) {
                throw new Error("MTVNPlayer.Player." + message + "() called before player loaded.");
            }
            // translate api method to flash player method
            message = messageNameMap[message] || message;
            switch (message) {
            case "exitFullScreen":
                // needs to be screened
                exitFullScreen.call(this);
                return;
            case "goFullScreen":
                // do nothing, unsupported in flash
                return;
            default:
                break;
            }
            // pass up to two arguments
            if (arguments[1] !== undefined && arguments[2] !== undefined) {
                return this.element[message](arguments[1], arguments[2]);
            } else if (arguments[1] !== undefined) {
                return this.element[message](arguments[1]);
            } else {
                return this.element[message]();
            }
        };
        window.mtvnPlayerLoaded = function(e) {
            return function(id) {
                if (e) {
                    e(id);
                }
                var player = core.getPlayerInstance(id);
                core.executeCallbacks(player);
                addFlashEvents(player);
            };
        }(window.mtvnPlayerLoaded);
    };
})(window.MTVNPlayer);