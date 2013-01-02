
;
(function($, w) {

    var version = "0.1";
    var logMessage = "";
    var src = {
        "playerApi": "http://media.mtvnservices.com/player/api/1.6.0.js"
    }

    var defaults = {
        "width": "100%",
        "height": "100%",
        "flashVars": {
            "autoPlay": "true",
            "ssid": undefined,
            "sid": undefined
        },
        "params": {
            "wmode": undefined,
            "allowFullScreen": undefined,
            "allowScriptAccess": undefined
        }
    }

    var styled = false;

    if ($.fn.player) // don't do this code if its already done
    return false

    var log = function() {

        if (typeof console == 'undefined') {
            return false;
        }

        logMessage = "Player Plugin: " + arguments[0];

        console.log.apply(console, [logMessage]);
    }

        function tryCB(f) {
            if ($.isFunction(f)) {
                f();
            }
        }

        function loadPlayerAPI(callback) {

            if (w.yepnope) {

                w.yepnope({
                    test: (window.MTVNPlayer && window.MTVNPlayer.Player),
                    nope: src['playerApi'],
                    complete: function() {
                        tryCB(callback);
                    }
                });

            } else {

                log("This plugin depends on yepnope.js, it is not on the page.")
                return false;
            }

        }



    var counter = 3300;

    function genId() {
        return "vp_" + counter++;
    }

    function createConfig(data) {

        var conf = $.extend(true, {}, defaults);

        if (!$.isObject) {
            $.isObject = $.isPlainObject;
        }

        var deepClone = function(target, source) {

            for (var key in source) {

                if ($.isObject(source[key])) {

                    target[key] = $.isObject(target[key]) ? target[key] : {};
                    deepClone(target[key], source[key]);

                } else {
                    target[key] = source[key];

                }
            }

            return target;

        }


        if ((w.MTVN) && (w.MTVN.conf) && (w.MTVN.conf.player)) {
            deepClone(conf, w.MTVN.conf.player)
        }

        var copyProps = function(obj) {

            for (var prop in obj) {

                if ($.isObject(obj[prop])) {

                    copyProps(obj[prop])

                } else {

                    if (typeof data[prop.toLowerCase()] !== "undefined") {
                        obj[prop] = data[prop.toLowerCase()]
                    }

                    if (typeof obj[prop] === "undefined") {
                        delete obj[prop];
                    }

                }

            }

            return obj

        }

        copyProps(conf);

        return conf
    }


    var setStyles = function() {

        var styles = document.createElement("style");
        styles.setAttribute("type", "text/css");


        var rules = "\
.MTVNPlayer_placeholder {cursor:pointer; position: relative;}\
.MTVNPlayer_placeholder_button {\
  position:absolute;\
  height: 100%;\
  width: 100%;\
  top:0;\
  left:0;\
  background: no-repeat url(http://media.mtvnservices.com/player/images/Button_playBig_upSkin.png) center;\
}\
\
.MTVNPlayer_placeholder_button:hover {\
  background-image: url(http://media.mtvnservices.com/player/images/Button_playBig_overSkin.png)\
}";

        document.getElementsByTagName("head")[0].appendChild(styles);

        if (styles.styleSheet) {
            styles.styleSheet.cssText = rules;
        } else {
            var el = document.createTextNode(rules)
            styles.appendChild(el);
        }

        return true

    }


    $.fn.player = function(options) {

        var self = this

        var preparePlaceholders = function() {

            self.each(function() {
                var el = $(this);

                if (el.children().length > 0) { // if element has  children, assume placeholders

                    if (!styled) {
                        styled = setStyles();
                    }

                    el.html(function(idx, old) {
                        return '<div class="MTVNPlayer_placeholder">' + old + '<div class=\"MTVNPlayer_placeholder_button\"></div></div>'
                    });

                    el.delegate("div.MTVNPlayer_placeholder", "click", function(e) { // then add an onclick to the element that will do that same thing

                        e.preventDefault();

                        el.find("div.MTVNPlayer_placeholder").hide(); // store markup for later use

                        el.bind("MTVNPlayer:showPlaceholder", function() {
                            el.children().not("div.MTVNPlayer_placeholder").remove();
                            el.find("div.MTVNPlayer_placeholder").show();
                            delete el.data().player;
                        });

                        el.data("autoplay", true); // turn auto play on

                        plugPlayer(el);

                    });

                } else { // else add the div for the player to grow into.

                    plugPlayer(el)

                }
            });
        }

        var mapEvents = function(el) {

            if (!el) {
                return false;
            }

            if (!w.MTVNPlayer) {
                return false;
            }


            if (MTVNPlayer.Events) {

                var eventObj = {};

                for (prop in MTVNPlayer.Events) {

                    (function() {

                        var eventName = MTVNPlayer.Events[prop];

                        eventObj[eventName] = function(a) {

                            el.trigger("MTVNPlayer:" + eventName, [a, el.data("player")]);

                        }

                    })();
                }
            }


            if (MTVNPlayer.Player && MTVNPlayer.Player.prototype) {

                for (prop in MTVNPlayer.Player.prototype) {
                    (function() {
                        var item = prop;
                        console.log(item);
                        el.bind("MTVNPlayer:" + item, function() {
                            console.log("hi?");
                            if (el.data("player")) {
                                el.data("player")[item]();
                            }
                        });

                    })()
                }

            }

            return eventObj;

        }

        var plugPlayer = function(el) {
            
            var conf,
            _player,
            _uri;


            var playerId = genId();
            el.append('<div id="' + playerId + '" class="_replaced" ></div>');


            if (_uri = el.data("contenturi")) {

                conf = createConfig(el.data());
                conf.uri = _uri;


                _player = new MTVNPlayer.Player(playerId, conf, mapEvents(el));
                el.data("player", _player);
            }

            tryCB(options);

        }

        if (options === "info") {

            return {
                "version": version,
                "defaults": defaults,
                "logMessage": logMessage,
                "createConfig": createConfig
            }

        } else {

            self = self.not(function() {
                if ($(this).data("contenturi")) {
                    return false
                }

                return true

            })

            if (self.length > 0) {
                if (w['MTVNPlayer'] && w['MTVNPlayer']['Player']) {
                    preparePlaceholders();
                } else {
                    loadPlayerAPI(function() {
                        preparePlaceholders()
                    });
                }
            } else {
                tryCB(options);
            }

        }

    };

})(window["jQuery"] || window["Zepto"], window); 