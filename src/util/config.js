(function(MTVNPlayer) {
    "use strict";
    var config = MTVNPlayer.module("config");
    var copyProperties = config.copyProperties = function(toObj, fromObj) {
            if (fromObj) {
                for (var prop in fromObj) {
                    if (fromObj.hasOwnProperty(prop)) {
                        if (fromObj[prop]) {
                            var propName = prop.toLowerCase();
                            if (propName === "flashvars" || propName === "attributes" || propName === "params") {
                                toObj[prop] = toObj[prop] || {};
                                copyProperties(toObj[prop], fromObj[prop]);
                            } else {
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
                width: getStyleAttr("width"),
                height: getStyleAttr("height"),
                flashVars: getObjectFromNameValue("flashVars"),
                attributes: getObjectFromNameValue("attributes")
            };
        return copyProperties(config, configFromEl);
    };
})(window.MTVNPlayer);