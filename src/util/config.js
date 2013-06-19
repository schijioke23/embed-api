/* global _, MTVNPlayer */
/**
 * @ignore
 * The config module has helper functions for dealing with the config object.
 **/
var Config = {
    /**
     * @ignore
     * Copy one event object to another, building an array when necessary.
     */
    copyEvents: function(toObj, fromObj) {
        var newEvent, currentEvent;
        if (fromObj) {
            for (var prop in fromObj) {
                if (fromObj.hasOwnProperty(prop)) {
                    newEvent = fromObj[prop];
                    if (_.isFunction(newEvent) || _.isArray(newEvent)) {
                        currentEvent = toObj[prop];
                        if (currentEvent) {
                            // the event object already exists, we need to augment it
                            if (_.isArray(currentEvent)) {
                                if (_.isArray(newEvent)) {
                                    // combine the arrays
                                    toObj[prop] = currentEvent.concat(newEvent);
                                } else {
                                    // tack on the event to an existing array
                                    currentEvent.push(newEvent);
                                }
                            } else {
                                // make a new array and concat the new array, or just make an array with two items.
                                toObj[prop] = _.isArray(newEvent) ? [currentEvent].concat(newEvent) : [currentEvent, newEvent];
                            }
                        } else {
                            // just set it...
                            toObj[prop] = newEvent;
                        }
                    }
                }
            }
        }
        return toObj;
    },
    /**
     * @ignore
     * Copy one config object to another, this includes a deep copy for flashvars, attributes, and params.
     * The properties will not be overriden on the toObj, unless override is specified.
     */
    copyProperties: function(toObj, fromObj, override) {
        toObj = toObj || {};
        function exists(value) {
            return value !== undefined && value !== null;
        }
        if (fromObj) {
            for (var prop in fromObj) {
                if (fromObj.hasOwnProperty(prop)) {
                    if (exists(fromObj[prop])) {
                        var propName = prop.toLowerCase();
                        if (propName === "flashvars" || propName === "attributes" || propName === "params" || propName === "test") {
                            toObj[prop] = toObj[prop] || {};
                            Config.copyProperties(toObj[prop], fromObj[prop], override);
                        } else {
                            // make sure width and height are defined and not zero
                            if ((prop === "width" || prop === "height") && !fromObj[prop]) {
                                continue;
                            }
                            // don't override if the prop exists
                            if (!override && exists(toObj[prop])) {
                                continue;
                            }
                            toObj[prop] = fromObj[prop];
                        }
                    }
                }
            }
        }
        return toObj;
    },
    versionIsMinimum: function(required, version) {
        function chopBuild(version) {
            if (version.indexOf("-") !== -1) {
                return version.slice(0, required.indexOf("-"));
            }
            return version;
        }
        if (required && version) {
            required = chopBuild(required);
            version = chopBuild(version);
            if (required === version) {
                return true;
            }
            // convert to arrays
            required = required.split(".");
            version = version.split(".");
            for (var i = 0, l = version.length; i < l; i++) {

                var u = parseInt(required[i], 10),
                    r = parseInt(version[i], 10);
                u = isNaN(u) ? 0 : u;
                r = isNaN(r) ? 0 : r;
                // continue to the next digit
                if (u == r) {
                    continue;
                }

                // else return result
                return u < r;
            }
        }
    },
    requiresJQuery: function(callback) {
        // Zepto recommened way to check for IE. 
        if ('__proto__' in {}) {
            callback();
        } else {
            var $ = window.jQuery;
            // TODO we can lower this version if we want to test first.
            if ($ && Config.versionIsMinimum("1.9.0", $.fn.jquery)) {
                MTVNPlayer.provide("$", $);
                callback();
            } else {
                // load jQuery async.
                MTVNPlayer.loadPackages({
                    "$": {
                        shim: true,
                        url: "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js"
                    }
                }, callback);
            }
        }
    },
    buildConfig: function(el, config) {
        config = Config.copyProperties(config, window.MTVNPlayer.defaultConfig);
        // make sure the height and width are defined.
        // 640x360 is now the default.
        config = Config.copyProperties(config, {
            width: 640,
            height: 360
        });
        var getDataAttr = function(attr) {
            return el.getAttribute("data-" + attr);
        },
            getStyleAttr = function(attr) {
                return parseInt(el.style[attr], 10);
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
            /**
             * @ignore
             * Allow the element to define some custom flashvars instead of
             * using querystring format on the data-flashVars object.
             */
            copyCustomPropertiesToFlashVars = function(obj) {
                var customProperties = ["autoPlay", "sid", "ssid"],
                    i, propValue, propName;
                for (i = customProperties.length; i--;) {
                    propName = customProperties[i];
                    propValue = getDataAttr(propName);
                    if (propValue) {
                        if (!obj) {
                            obj = {};
                        }
                        obj[propName] = propValue;
                    }
                }
                return obj;
            },
            configFromEl = {
                uri: getDataAttr("contenturi"),
                width: getStyleAttr("width") || null,
                height: getStyleAttr("height") || null,
                flashVars: copyCustomPropertiesToFlashVars(getObjectFromNameValue("flashVars")),
                attributes: getObjectFromNameValue("attributes")
            };
        return Config.copyProperties(config, configFromEl, true);
    }
};