/*global Core, Config, MTVNPlayer */
 (function($) {
     "use strict";
     if($) {
         var eventPrefix = "MTVNPlayer:",
             // support for MTVN.config.player
             legacyConfig = function(MTVN) {
                 if(MTVN && MTVN.config && MTVN.config.player) {
                     return MTVN.config.player;
                 }
             }(window.MTVN),
             // default config creates players at 100% width and height,
             // also copy the properties from MTVN.player.config or MTVNPlayer.defaultConfig.
             defaultConfig = Config.copyProperties({
                 "width": "100%",
                 "height": "100%"
             }, legacyConfig || MTVNPlayer.defaultConfig),
             // inject styles once.
             setStyles = function() {
                 setStyles = function() {};
                 var rules = "\n.MTVNPlayer_placeholder {cursor:pointer; position: relative;}\n" + ".MTVNPlayer_placeholder_button {\n" + "position:absolute;\n" + "height: 100%;\n" + "width: 100%;\n" + "top:0;\n" + "left:0;\n" + "background: no-repeat url(http://media.mtvnservices.com/player/images/Button_playBig_upSkin.png) center;\n" + "}\n" + "\n" + ".MTVNPlayer_placeholder_button:hover {\n" + "background-image: url(http://media.mtvnservices.com/player/images/Button_playBig_overSkin.png)\n" + "}\n";
                 Core.appendStyle(rules);
             },
             // allow $("MTVNPlayer").trigger("MTVNPlayer:playIndex",[0,20]);.
             mapMethods = function(el) {
                 var player = el.data("player"),
                     invoke = function(event, arg1, arg2) {
                         var method = event.type.replace(eventPrefix, "");
                         player[method].apply(player, [arg1, arg2]);
                     };
                 for(var prop in MTVNPlayer.Player.prototype) {
                     el.bind(eventPrefix + prop, invoke);
                 }
             },
             // creates a player and hooks up
             createPlayer = function($el) {
                 var config = Config.buildConfig($el[0], defaultConfig),
                     player;
                 player = new MTVNPlayer.Player($el[0], config);
                 $el.data("player", player);
                 player.$el = $el;
                 mapMethods($el);
             };
         // main plugin function
         $.fn.player = function(options) {
             // callback is fired after an MTVNPlayer is created.
             var callback = $.isFunction(options) ? options : function() {},
                 // first we look for .MTVNPlayer, then we refine to .MTVNPlayers with contenturis.
                 self = this.not(function() {
                     return $(this).data("contenturi") ? false : true;
                 });
             if(self.length > 0) {
                 // prepare placeholders.
                 self.each(function() {
                     var $el = $(this);
                     if(!MTVNPlayer.isHTML5Player && $el.children().length > 0) { // if element has children, assume placeholders.
                         // inject placeholder styles.
                         setStyles();
                         // wrap the placeholder and add the button.
                         $el.html(function(idx, old) {
                             return '<div class="MTVNPlayer_placeholder">' + old + '<div class=\"MTVNPlayer_placeholder_button\"></div></div>';
                         });
                         // when clicked, create a player.
                         $el.delegate("div.MTVNPlayer_placeholder", "click", function(e) {
                             e.preventDefault();
                             // store markup for later use
                             $el.find("div.MTVNPlayer_placeholder").hide();
                             $el.bind("MTVNPlayer:showPlaceholder", function() {
                                 $el.children().not("div.MTVNPlayer_placeholder").remove();
                                 $el.find("div.MTVNPlayer_placeholder").show();
                                 delete $el.data().player;
                             });
                             $el.data("autoplay", true);
                             createPlayer($el);
                             callback();
                         });
                     } else { // else add the div for the player to grow into.
                         $el.empty();
                         createPlayer($el);
                         callback();
                     }
                 });
             } else {
                 // nothing happened.
                 callback();
             }
         };
     }
 })(window.jQuery || window.Zepto);