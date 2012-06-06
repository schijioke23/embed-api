/**
 * @ignore
 * The config module has helper functions for dealing with the config object.
 */
(function(config) {
    "use strict";
    if (config.initialized) {
        return;
    }
    config.initialized = true;
    /**
     * @ignore
     * Copy one config object to another, this includes a deep copy for flashvars, attributes, and params.
     */
    var copyProperties = config.copyProperties = function(toObj, fromObj) {
            if (fromObj) {
                for (var prop in fromObj) {
                    if (fromObj.hasOwnProperty(prop)) {
                        if (fromObj[prop] !== undefined) {
                            var propName = prop.toLowerCase();
                            if (propName === "flashvars" || propName === "attributes" || propName === "params") {
                                toObj[prop] = toObj[prop] || {};
                                copyProperties(toObj[prop], fromObj[prop]);
                            } else {
                                // make sure width and height are defined and not zero
                                if((prop === "width" || prop === "height") && !fromObj[prop]){
                                    continue;
                                }
                                toObj[prop] = fromObj[prop];
                            }
                        }
                    }
                }
            }
            return toObj;
        };
    config.buildConfig = function(el, config) {
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
                width: getStyleAttr("width") || null,
                height: getStyleAttr("height") || null,
                flashVars: getObjectFromNameValue("flashVars"),
                attributes: getObjectFromNameValue("attributes")
            };
        return copyProperties(config, configFromEl);
    };
})(window.MTVNPlayer.module("config"));