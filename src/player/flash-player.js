/* global MTVNPlayer, Config, Core, PackageManager, _, SWFObject */
/* exported PlayerOverrides */
/**
 * set up handling of flash external interface calls
 * create functions to map metadata to new format,
 * and handle media player events
 * @method initializeFlash
 * @ignore
 */
var PlayerOverrides = _.once(function() {
    "use strict";
    var messageNameMap = {
        play: "unpause",
        seek: "setPlayheadTime"
    },
    swfobject = SWFObject.get(),
        makeWSwfObject = function(targetID, config) {
            var attributes = config.attributes || {},
            params = config.params || {
                allowFullScreen: true
            },
            flashVars = config.flashVars || {};
            attributes.data = Core.getPath(config);
            // the parent element has the width and height in pixels.
            attributes.width = attributes.height = "100%";
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
            Core.getPlayerInstance(targetID).element = swfobject.createSWF(attributes, params, targetID);
        },
        removePlayerInstance = function(id) {
            Core.instances = _.reject(Core.instances, function(instance) {
                return instance.source === id;
            });
        },
        exitFullScreen = function() {
            try {
                this.element.exitFullScreen();
            } catch (e) {
                // fail silently. exit full screen introduced in Prime 1.12
            }
        },
        processMetadata = function(metadata, playlistItems, index, playlistMetadataItems) {
            var m = {},
            rss;
            m.duration = metadata.duration;
            // TODO no live.
            m.live = false;
            m.isAd = metadata.isAd;
            m.isBumper = metadata.isBumper;
            if (index !== undefined && index !== null) {
                m.index = index;
            } else if (playlistMetadataItems) {
                m.index = function(guid) {
                    for (var i = playlistMetadataItems.length; i--;) {
                        if (playlistMetadataItems[i].rss.guid === guid) {
                            return i;
                        }
                    }
                    return -1;
                }(metadata.guid);
            } else {
                m.index = function(guid) {
                    for (var i = playlistItems.length; i--;) {
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
            var map = MTVNPlayer.Player.flashEventMap,
                id = _.uniqueId("player"),
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
                performanceEvent = MTVNPlayer.Events.PERFORMANCE,
                onIndexChange = MTVNPlayer.Events.INDEX_CHANGE,
                playheadUpdate = MTVNPlayer.Events.PLAYHEAD_UPDATE;
            // the first metadata event will trigger the readyEvent
            map[id + metadataEvent] = function(metadata) {
                var playlistItems = element.getPlaylist().items,
                    playlistMetadata = player.playlistMetadata,
                    processedMetadata = processMetadata(metadata, playlistItems, null, playlistMetadata ? playlistMetadata.items : null),
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
                        player.trigger(onIndexChange, newIndex);
                    }
                }
                player.playlistMetadata = playlistMetadata;
                if (fireReadyEvent) {
                    player.ready = true;
                    try {
                        var playerConfig = element.getJSConfig();
                        Config.copyProperties(player.config, playerConfig);
                    } catch (e) {
                        // method getJSConfig not implemented.
                    }
                    player.trigger(readyEvent, processedMetadata);
                }
                player.trigger(metadataEvent, processedMetadata);
            };
            element.addEventListener('METADATA', mapString + metadataEvent);
            map[id + stateEvent] = function(state) {
                state = state.replace("playstates.", "");
                player.state = state;
                player.trigger(stateEvent, state);
                player.trigger(stateEvent + ":" + state, state);
            };
            element.addEventListener('STATE_CHANGE', mapString + stateEvent);
            map[id + playheadUpdate] = function(playhead) {
                var lastPlayhead = Math.floor(player.playhead);
                player.playhead = playhead;
                player.trigger(playheadUpdate, playhead);
                // support for cue points.
                if (lastPlayhead != Math.floor(playhead)) {
                    player.trigger(playheadUpdate + ":" + Math.floor(playhead), playhead);
                }
            };
            element.addEventListener('PLAYHEAD_UPDATE', mapString + playheadUpdate);
            map[id + playlistCompleteEvent] = function() {
                player.trigger(playlistCompleteEvent);
            };
            element.addEventListener('PLAYLIST_COMPLETE', mapString + playlistCompleteEvent);
            map[id + performanceEvent] = function(performanceData) {
                player.trigger(performanceEvent, performanceData);
            };
            element.addEventListener("PERFORMANCE", mapString + performanceEvent);
            map[id + mediaStart] = function() {
                player.trigger(mediaStart);
            };
            // TODO does this fire for ads?
            element.addEventListener("READY", mapString + mediaStart);
            map[id + mediaEnd] = function() {
                player.trigger(mediaEnd);
            };
            // yes, flash event is media ended unfort.
            element.addEventListener("MEDIA_ENDED", mapString + mediaEnd);
            // fired when the end slate is shown, if the player's configuration is set to do so.
            map[id + "onEndSlate"] = function(data) {
                player.trigger(PackageManager.Events.ENDSLATE, data);
            };
            element.addEventListener("ENDSLATE", mapString + "onEndSlate");
        };
    MTVNPlayer.Player.flashEventMap = {};
    window.mtvnPlayerLoaded = function(e) {
        return function(id) {
            if (e) {
                e(id);
            }
            var player = Core.getPlayerInstance(id);
                Core.executeCallbacks(player);
            addFlashEvents(player);
        };
    }(window.mtvnPlayerLoaded);
    /**
     * create an embed element
     * Run in the context of {@link MTVNPlayer.Player}
     * @method message
     * @ignore
     */
    return {
        create: function(exists) {
            var targetID = this.id,
                config = this.config;
            config.isFlash = true; // TODO not a fan of this.
            Core.instances.push({
                source: targetID,
                player: this
            });
            if (!exists) {
                makeWSwfObject(targetID, config);
            }
        },
        destroy: function() {
            swfobject.removeSWF(this.element.id);
            removePlayerInstance(this.id);
        },
        /**
         * Send messages to the swf via flash external interface
         * Run in the context of {@link MTVNPlayer.Player}
         * @method message
         * @ignore
         */
        message: function(message) {
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
        }
    };
});