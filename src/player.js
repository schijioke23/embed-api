 /*global MTVNPlayer, Core, $, _, Config, Events, PlayState, PlayerOverrides, Modules, ShareUtil, Contentless*/
 /**
  * @class MTVNPlayer.Player
  * The player object: use it to hook into events ({@link MTVNPlayer.Events}), call methods, and read properties.
  *      var player = new MTVNPlayer.Player(element/id,config,events);
  *      player.on("metadata",function(event){console.log("metadata",event.data);});
  *      player.pause();
  * @constructor
  * Create a new MTVNPlayer.Player
  * @param {String/HTMLElement} id-or-element Pass in a string id, or an actual HTMLElement
  * @param {Object} config config object, see: {@link MTVNPlayer.Player#config}
  * @param {Object} events Event callbacks, see: {@link MTVNPlayer.Events}
  * @returns MTVNPlayer.Player
  */
 MTVNPlayer.Player = function() {
   // static methods variables
   var throwError = function(message) {
     throw new Error("Embed API:" + message);
   },
     document = window.document,
     PLAYER_CONTAINER_PREFIX = "mtvnPlayerContainer",
     Player, fixEventName = function(eventName) {
       if (eventName && eventName.indexOf("on") === 0) {
         if (eventName === "onUIStateChange") {
           return "uiStateChange";
         }
         return eventName.charAt(2).toLowerCase() + eventName.substr(3);
       }
       return eventName;
     },
     /**
      * @method checkEventName
      * @private
      * @param {String} eventName
      * Check if the event exists in our list of events.
      */
     checkEventName = function(eventName) {
       var eventArgs;
       if (eventName.indexOf(":") !== -1) {
         var parts = eventName.split(":");
         eventName = parts[0];
         eventArgs = parts[1];
       }
       var check = function(events) {
         for (var event in events) {
           if (events.hasOwnProperty(event) && events[event] === eventName) {
             return true; // has event
           }
         }
         return false;
       };
       if (eventArgs) {
         if (eventName === Events.STATE_CHANGE) {
           if (!_.contains(PlayState, eventArgs)) {
             throwError("event \"" + eventName + "\" doesn't have state \"" + eventArgs + "\"");
           }
         }
       }
       if (check(Events)) {
         return;
       }
       throwError("event:" + eventName + " doesn't exist.");
     },
     /**
      * @method checkEvents
      * @private
      * @param {Object} events
      * Loop through the events, and check the event names
      */
     checkEvents = function(events) {
       for (var event in events) {
         if (events.hasOwnProperty(event) && event.indexOf("on") === 0) {
           events[fixEventName(event)] = events[event];
           delete events[event];
         }
       }
       for (event in events) {
         if (events.hasOwnProperty(event)) {
           checkEventName(event);
         }
       }
     },
     getDim = function(dim) {
       return isNaN(dim) ? dim : dim + "px";
     },
     createTarget = function() {
       var target = document.createElement("div");
       target.setAttribute("id", _.uniqueId("mtvnPlayer"));
       return target;
     };
   // end private vars
   /**
    * @member MTVNPlayer
    * Whenever a player is created, the callback passed will fire with the player as the first
    * argument, providing an easy way to hook into player events in a decoupled way.
    * @param {Function} callback A callback fired when every player is created.
    *
    *     MTVNPlayer.onPlayer(function(player){
    *          // player is the player that was just created.
    *          // we can now hook into events.
    *          player.on("playheadUpdate",function(event) {
    *              // do something when "playheadUpdate" fires.
    *          }
    *
    *          // or look for information about the player.
    *          var uri = player.config.uri;
    *     });
    */
   MTVNPlayer.onPlayer = function(callback) {
     Core.onPlayerCallbacks.push(callback);
   };
   /**
    * @member MTVNPlayer
    * (Available in 1.6.0) Remove a callback registered width {@link MTVNPlayer#onPlayer}
    * @param {Function} callback A callback fired when every player is created.
    */
   MTVNPlayer.removeOnPlayer = function(callback) {
     var index = Core.onPlayerCallbacks.indexOf(callback);
     if (index !== -1) {
       Core.onPlayerCallbacks.splice(index, 1);
     }
   };
   /**
    * @member MTVNPlayer
    * Returns an array containing each {@link MTVNPlayer.Player} created.
    * @returns {Array} An array containing each {@link MTVNPlayer.Player} created.
    *      var players = MTVNPlayer.getPlayers();
    *      for(var i = 0, len = players.length; i < len; i++){
    *          var player = players[i];
    *          if(player.config.uri === "mgid:cms:video:thedailyshow.com:12345"){
    *              // do something
    *          }
    *      }
    */
   MTVNPlayer.getPlayers = function() {
     var result = [],
       instances = Core.instances,
       i = instances.length;
     for (i; i--;) {
       result.push(instances[i].player);
     }
     return result;
   };
   /**
    * @member MTVNPlayer
    * Returns a player that matches a specific uri
    * @returns MTVNPlayer.Player
    */
   MTVNPlayer.getPlayer = function(uri) {
     var instances = Core.instances,
       i = instances.length;
     for (i; i--;) {
       if (instances[i].player.config.uri === uri) {
         return instances[i].player;
       }
     }
     return null;
   };
   /**
    * @member MTVNPlayer
    * Garbage collection, looks for all {@link MTVNPlayer.Player} that are no longer in the document,
    * and removes them from the hash map.
    */
   MTVNPlayer.gc = function() {
     var elementInDocument = function(element) {
       while (element.parentNode) {
         element = element.parentNode;
         if (element == document) {
           return true;
         }
       }
       return false;
     };
     var instances = Core.instances,
       i = instances.length;
     for (i; i--;) {
       var player = instances[i].player,
         el = player.containerElement;
       if (!el || !elementInDocument(el)) {
         instances.splice(i, 1);
         player.destroy();
       }
     }
   };
   /**
    * @member MTVNPlayer
    * Create players from elements in the page.
    * This should be used if you need to create multiple players that are the same.
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
    *                      // do something custom
    *                      var player = event.target; // the player that dispatched the event
    *                      var playheadTime = event.data // some events have a data property with event-specific data
    *                      if(player.config.uri === "mgid:cms:video:thedailyshow.com:12345"){
    *                              // here we're checking if the player that dispatched the event has a specific URI.
    *                              // however, we also could have called MTVNPlayer#createPlayers with a different selector to distingush.
    *                      }
    *                  }
    *              });
    *      </script>
    */
   MTVNPlayer.createPlayers = function(selectorQuery, config, events) {
     if (!selectorQuery) {
       selectorQuery = ".MTVNPlayer";
     }
     var elements = $(selectorQuery);
     for (var i = 0, len = elements.length; i < len; i++) {
       new MTVNPlayer.Player(elements[i], config, events);
     }
     return elements.length;
   };

   Player = function(elementOrId, config, events) {
     // in case constructor is called without new.
     if (!(this instanceof Player)) {
       return new Player(elementOrId, config, events);
     }
     /** 
      * @property {Boolean} ready
      * The current ready state of the player
      */
     this.ready = false;
     /**
      * @property {String} state
      * The current play state of the player.
      */
     this.state = null;
     /**
      * The current metadata is the metadata that is playing back at this moment.
      * This could be ad metadata, or it could be content metadata.
      * To access the metadata for the content items in the playlist see {@link MTVNPlayer.Player#playlistMetadata}
      *
      * *The best way to inspect the metadata is by using a modern browser and calling console.log("metadata",metadata);*
      * @property {Object} currentMetadata
      *
      * @property {Number} currentMetadata.index
      * The index of this metadata in relation to the playlist items. If isAd is true, the index will be -1.
      *
      * @property {Number} currentMetadata.duration
      * The duration of the content. This will update as the duration becomes more accurate.
      *
      * @property {Boolean} currentMetadata.live
      * Whether or not the video that's playing is a live stream.
      *
      * @property {Boolean} currentMetadata.isAd
      * Whether or not the video that's playing is an advertisment.
      *
      * @property {Boolean} currentMetadata.isBumper
      * Whether or not the video that's playing is a bumper.
      *
      * @property {Object} currentMetadata.rss
      * The data in the rss feed maps to this object, mirroring the rss's hierarchy
      * @property {String} currentMetadata.rss.title
      * Corresponds to the rss title.
      * @property {String} currentMetadata.rss.description
      * Corresponds to the rss description.
      * @property {String} currentMetadata.rss.link
      * Corresponds to the rss link.
      * @property {String} currentMetadata.rss.guid
      * Corresponds to the rss guid.
      * @property {Object} currentMetadata.rss.group
      * Corresponds to the rss group.
      * @property {Object} currentMetadata.rss.group.categories
      * Corresponds to the rss group categories
      *
      */
     this.currentMetadata = null;
     /**
      * @property {Object} playlistMetadata
      * The playlistMetadata is the metadata about all the playlist items.
      *
      * @property {Array} playlistMetadata.items
      * An array of metadata corresponding to each playlist item, see:{@link MTVNPlayer.Player#currentMetadata}
      */
     this.playlistMetadata = null;
     /** @property {Number} playhead
      * The current playhead time in seconds.
      */
     this.playhead = 0;
     /**
      * @property {HTMLElement} element
      * The swf embed or the iframe element.
      */
     this.element = null;
     /**
      * @cfg {Object} config The main configuration object.
      * @cfg {String} [config.uri] (required) The URI of the media.
      * @cfg {Number} [config.width] (required) The width of the player
      * @cfg {Number} [config.height] (required) The height of the player
      * @cfg {Object} [config.flashVars] Flashvars are passed to the flash player
      * @cfg {Object} [config.params] wmode, allowFullScreen, etc. (allowScriptAccess is always forced to true). See [Adobe Help][1]
      * [1]: http://kb2.adobe.com/cps/127/tn_12701.html
      * @cfg {Object} [config.attributes] see [Adobe Help][1]
      * [1]: http://kb2.adobe.com/cps/127/tn_12701.html
      * @cfg {String} [config.fullScreenCssText] When the HTML5 player goes full screen, this is the css that is set on the iframe.
      * @cfg {String} [config.templateURL] (For TESTING) A URL to use for the embed of iframe src. The template var for uri is {uri}, such as http://site.com/uri={uri}.
      *
      */
     this.config = config || {};

     /**
      * @ignore
      * a way to share code with out augmenting the prototype, not used very much.
      */
     this.module = (function() {
       var module = {};
       /**
        * @ignore
        * framework-y stuff.
        * You can call module(UserManager) and register an instance of UserManager.
        * If you want to retrieve the instance just call module(UserManager) again.
        * Or you can call module("some-user-manager", UserManager), to register a new UserManager,
        * and then retrieve it via the id module("some-user-manager").
        */
       return function(name, object) {
         if (name === Modules.ALL) {
           return module;
         }
         // you can pass just an object
         if (_.isObject(name)) {
           object = name;
           // the object could have a NAME property
           if (!object.NAME) {
             // otherwise generate one and set the NAME property for next time.
             object.NAME = _.uniqueId("PrivateModule");
           }
           name = object.NAME;
         }
         if (module[name]) {
           return module[name];
         }
         if (!object) {
           throw "Can't add null object for " + name + " module.";
         }
         // instantiate a function, or set an object.
         module[name] = (_.isFunction(object) ? new object({
           player: this,
           module: this.module,
           moduleId: name
         }) : object);
         // return the newly created module.
         return module[name];
       };
     })();

     // record the start time for performance analysis.
     if (this.config.performance) {
       this.config.performance = {
         startTime: (new Date()).getTime()
       };
     }

     if (this.config.contentless) {
       _.extend(Player.prototype, Contentless);
     }

     /**
      * @property {HTMLElement} isFullScreen
      * HTML5 only. See {@link MTVNPlayer.Events#fullScreenChange}
      */
     this.isFullScreen = false;
     // the player target will be replaced by an iframe or swf.
     var playerTarget = createTarget();

     // the player target is going to go inside the containerElement.
     this.containerElement = _.isElement(elementOrId) ? elementOrId : document.getElementById(elementOrId);
     // TODO, freewheel needs an ID, is this the best way to check if one exists?
     if (!_.isString(this.containerElement.id)) {
       this.containerElement.id = _.uniqueId(PLAYER_CONTAINER_PREFIX);
     }

     // TODO remove this and just use the playerTarget.id through out.
     this.id = playerTarget.id;
     this.playerTarget = playerTarget;

     // process the element and the config.
     this.config = Config.buildConfig(this.containerElement, this.config);

     // set the width and height.
     // if these were set already on the element, then
     this.containerElement.style.width = getDim(this.config.width);
     this.containerElement.style.height = getDim(this.config.height);

     // the player (a swf or an iframe), is a child of the element retrieved.
     this.containerElement.appendChild(playerTarget);

     this.events = Config.copyEvents(events || {}, MTVNPlayer.defaultEvents);

     // make sure the events are valid
     checkEvents(events);

     // wait for ready event
     var eventQueue = [];
     this.message = _.wrap(this.message, function(func) {
       var args = _.rest(_.toArray(arguments));
       if (!this.ready) {
         eventQueue.push(args);
       } else {
         return func.apply(this, args);
       }
     });

     // wait for ready event, then fire the eventQueue.
     this.one(Events.READY, function(event) {
       var player = event.target,
         message = player.message;
       for (var i = 0, len = eventQueue.length; i < len; i++) {
         message.apply(player, eventQueue[i]);
       }
     });

     // check for element before creating
     if (!this.containerElement) {
       if (document.readyState === "complete") {
         throwError("target div " + this.id + " not found");
       } else {
         // wait for document ready, then try again.
         (function(ref) {
           $(document).ready(function() {
             if (document.getElementById(ref.id)) {
               ref.create();
             } else {
               throwError("target div " + ref.id + " not found");
             }
           });
         })(this);
       }
       return;
     } else {
       this.create();
     }
   };
   // public api
   Player.prototype = {
     /**
      * @ignore
      * Used internally by the placeholder code.
      */
     canUsePlaceholder: true,
     /**
      * 2.1.0 Use {@link MTVNPlayer.Player#element}
      * @deprecated
      * @returns HTMLElement the object/embed element for flash or the iframe element for the HTML5 Player.
      */
     getPlayerElement: function() {
       return this.element;
     },
     /**
      * Begins playing or unpauses.
      */
     play: function() {
       this.message("play");
     },
     /**
      * Pauses the media.
      */
     pause: function() {
       this.message("pause");
     },
     /**
      * Mutes the volume
      */
     mute: function() {
       this.message("mute");
     },
     /**
      * Returns the volume to the level before it was muted.
      */
     unmute: function() {
       this.message("unmute");
     },
     /**
      * Play an item from the playlist specified by the index and optionally at a certain time in the clip.
      * @param {Number} index
      * @param {Number} startTime value between 0 and the duration of the current clip.
      */
     playIndex: function(index, startTime) {
       this.message("playIndex", index, startTime);
     },
     /**
      * Play a new URI
      * @param {String} uri
      */
     playURI: function(uri) {
       this.message("playUri", uri);
     },
     /**
      * Change the volume
      * @param {Number} value between 0 and 1.
      */
     setVolume: function(volume) {
       return this.message("setVolume", volume);
     },
     /**
      * Seeks to the time specified in seconds relative to the first clip.
      * @param {Number} value between 0 and the duration of the playlist.
      * The value is relative to the first clip. It's recommended that when
      * seeking to another clip besides the first, use {@link MTVNPlayer.Player#playIndex}.
      */
     seek: function(time) {
       this.message("seek", time);
     },
     /**
      * Returns the embed code used to share this instance of the player
      * @return {String} the embed code as a string.
      */
     getEmbedCode: function() {
       return ShareUtil.getEmbedCode.call(this);
     },
     /**
      * Puts the player in full screen mode, does not work for the flash player do the flash restrictions.
      */
     goFullScreen: function(el) {
       this.message("goFullScreen", el);
     },
     /**
      * Exits full screen and returns the player to its initial embed size.
      * Does not work with Prime builds older than 1.12.
      */
     exitFullScreen: function() {
       this.message("exitFullScreen");
     },
     /**
      * Show user clip screen.
      * For flash only (api v2.4.0)
      */
     createUserClip: function() {
       return this.message("createUserClip");
     },
     /**
      * Adds an event listener for an event.
      * @deprecated use {@link MTVNPlayer.Player#on} instead.
      * @param {String} eventName an {@link MTVNPlayer.Events}.
      * @param {Function} callback The function to invoke when the event is fired.
      */
     bind: function(eventName, callback) {
       if (!_.isFunction(callback)) {
         throwError("adding " + eventName + " with callback that is not a function");
       }
       eventName = fixEventName(eventName);
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
      * @deprecated use {@link MTVNPlayer.Player#off} instead.
      * @param {String} eventName an MTVNPlayer.Event.
      * @param {Function} callback The function to that was bound to the event.
      */
     unbind: function(eventName, callback) {
       eventName = fixEventName(eventName);
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
     },
     /**
      * Adds an event listener for an event that will only fire once and then be removed.
      * @deprecated use {@link MTVNPlayer.Player#one} instead.
      * @param {String} eventName an {@link MTVNPlayer.Events}.
      * @param {Function} callback The function to invoke when the event is fired.
      */
     once: function(eventName, callback) {
       var ref = this,
         newCB = function(event) {
           ref.unbind(eventName, newCB);
           callback(event);
         };
       this.on(eventName, newCB);
     },
     /**
      * Triggers an event off the player instance.
      * @param {String} eventName an {@link MTVNPlayer.Events}.
      * @param {Object} data Data will be available as event.data on the event object.
      */
     trigger: function(type, data) {
       if (!type) {
         throwError("event triggered without type.");
       }
       Core.processEvent(this.events[type], {
         target: this,
         data: data,
         type: type
       });
     },
     /**
      * (v2.6.4) Call this before removing a player.
      * Required for older versions of IE.
      */
     destroy: function() {
       // overriden by modules
     }
   };
   /**
    * (v2.5.0) Adds an event listener for an event.
    * @param {String} eventName an {@link MTVNPlayer.Events}.
    * @param {Function} callback The function to invoke when the event is fired.
    */
   Player.prototype.on = Player.prototype.bind;
   /**
    * (v2.5.0) Removes an event listener
    * @param {String} eventName an MTVNPlayer.Event.
    * @param {Function} callback The function to that was bound to the event.
    */
   Player.prototype.off = Player.prototype.unbind;
   /**
    * (v2.5.0) Adds an event listener for an event that will only fire once and then be removed.
    * @param {String} eventName an {@link MTVNPlayer.Events}.
    * @param {Function} callback The function to invoke when the event is fired.
    */
   Player.prototype.one = Player.prototype.once;
   /**
    * (v3.0.0) Alias for setVolume.
    * @param {Number} volume If not passed returns the current volume.
    */
   Player.prototype.volume = Player.prototype.setVolume;
   // Extend the prototype with the Player Implementation.
   _.extend(Player.prototype, PlayerOverrides);
   return Player;
 }(window);