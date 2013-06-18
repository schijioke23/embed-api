/*global Core, Config, MTVNPlayer, Logger, SHARED_VIDEO_ELEMENT:true*/
(function() {
    var eventPrefix = "MTVNPlayer:",
        $ = window.$ || $,
        // support for MTVN.config.player
        legacyConfig = function(MTVN) {
            if (MTVN && MTVN.config && MTVN.config.player) {
                return MTVN.config.player;
            }
        }(window.MTVN),
        // also copy the properties from MTVN.player.config or MTVNPlayer.defaultConfig.
        defaultConfig = Config.copyProperties({}, legacyConfig || MTVNPlayer.defaultConfig),
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
            for (var prop in MTVNPlayer.Player.prototype) {
                el.bind(eventPrefix + prop, invoke);
            }
        },
        // creates a player and hooks up
        createPlayer = function($el, config, events) {
            // ugh. first copy the default, but don't override.
            // I have to do this since internally I don't support the MTVN.config stuff.
            config = Config.copyProperties(config, defaultConfig);
            // next apply that config to the element properties.
            config = Config.buildConfig($el[0], config);
            var player = new MTVNPlayer.Player($el[0], config, events);
            $el.data("player", player);
            player.$el = $el;
            mapMethods($el);
        };
    // main plugin function
    $.fn.player = function(options) {
        options = options || {};
        if ($.isFunction(options)) {
            options = {
                callback: options
            };
        }
        // callback is fired after an MTVNPlayer is created.
        var callback = $.isFunction(options.callback) ? options.callback : function() {},
            // first we look for .MTVNPlayer, then we refine to .MTVNPlayers with contenturis.
            self = this.not(function() {
                return $(this).data("contenturi") ? false : true;
            }),
            canUsePlaceholder = MTVNPlayer.Player.prototype.canUsePlaceholder;
        if (self.length > 0) {
            // prepare placeholders.
            self.each(function() {
                var $el = $(this);
                if (canUsePlaceholder && $el.children().length > 0) { // if element has children, assume placeholders.
                    // inject placeholder styles.
                    setStyles();
                    // wrap the placeholder and add the button.
                    $el.html(function(idx, old) {
                        return '<div class="MTVNPlayer_placeholder">' + old + '<div class=\"MTVNPlayer_placeholder_button\"></div></div>';
                    });
                    // when clicked, create a player.
                    $el.delegate("div.MTVNPlayer_placeholder", "click", function(e) {
                        e.preventDefault();
                        // for iPhone. Activate the video element.
                        if(!SHARED_VIDEO_ELEMENT){
                            var $video = $("<video></video>");
                            $video[0].play();
                            SHARED_VIDEO_ELEMENT = $video[0];
                            (new Logger("MTVNPlayer.Placeholder")).info("video element activated.");
                        }
                        // store markup for later use
                        $el.find("div.MTVNPlayer_placeholder").hide();
                        $el.bind("MTVNPlayer:showPlaceholder", function() {
                            $el.children().not("div.MTVNPlayer_placeholder").remove();
                            $el.find("div.MTVNPlayer_placeholder").show();
                            delete $el.data().player;
                        });
                        $el.data("autoplay", true);
                        createPlayer($el, options.config, options.events);
                        callback();
                    });
                } else { // else create the player
                    $el.empty();
                    createPlayer($el, options.config, options.events);
                    callback();
                }
            });
        } else {
            // nothing happened.
            callback();
        }
    };
})();