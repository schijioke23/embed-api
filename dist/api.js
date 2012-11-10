/**
 * For creating a player inline you can use the MTVNPlayer.Player constructor.
 * For creating multiple players defined in HTML see MTVNPlayer.createPlayers
 * @static
 */
var MTVNPlayer = window.MTVNPlayer || {};
(function(MTVNPlayer) {
    "use strict";
    if (!MTVNPlayer.module) {
        MTVNPlayer.module = function() {
            var modules = {};
            return function(name) {
                if (modules[name]) {
                    return modules[name];
                }
                modules[name] = {};
                return modules[name];
            };
        }();
    }
})(MTVNPlayer);

(function(context){
    // we're leaking yepnope into global. 
    // noConflict will be called after we store references
    // to the modules that we're using.
    var oldYepNope = context.yepnope;
    MTVNPlayer.noConflict = function(){
        context.yepnope = oldYepNope;
    };
})(window);
(function(core, $) {
    "use strict";
    if (core.initialized) {
        return;
    }
    core.initialized = true;
    // private vars
    var instances = [],
        baseURL = "http://media.mtvnservices.com/",
        onPlayerCallbacks = [];
    // exports
    /**
     * @property instances
     * @ignore
     * An array of all the player instances.
     */
    core.instances = instances;
    /**
     * @property baseURL
     * @ignore
     * The base URL for the player request and for swf object. 
     */
    core.baseURL = baseURL;
    /**
     * @property onPlayerCallbacks
     * @ignore
     * These are fired when a player laods. 
     */
    core.onPlayerCallbacks = onPlayerCallbacks;
    core.$ = $;

    /**
     * Initialization that is common across player modules (meaning flash/html5).
     * This is here mostly to keep it out of the constructor.
     * @ignore
     */
    core.playerInit = function(player, playerModule) {
        // A list of event messages called before the player was ready
        var eventQueue = [];
        player.module = function() {
            var modules = {};
            return function(name) {
                if (modules[name]) {
                    return modules[name];
                }
                modules[name] = {};
                return modules[name];
            };
        }();
        player.message = function() {
            if (!this.ready) {
                eventQueue.push(arguments);
            } else {
                return playerModule.message.apply(this, arguments);
            }
        };
        player.once("onReady", function(event) {
            var player = event.target,
                message = player.message;
            for (var i = 0, len = eventQueue.length; i < len; i++) {
                message.apply(player, eventQueue[i]);
            }
        });
    };

    /**
     * @property isHTML5Player
     * @ignore
     * The logic that determines whether we're using flash or html
     */
    core.isHTML5Player = function(userAgent) {
        var n = userAgent ? userAgent.toLowerCase() : "",
            checkSilk = function(n) {
                if(n.indexOf("silk") !== -1){
                    var reg = /silk\/(\d)/ig,
                        result = parseInt(reg.exec(n)[1],10);
                        return !isNaN(result) && result >= 2;
                }
                return false;
            };
        return n.indexOf("iphone") !== -1 || n.indexOf("ipad") !== -1 || checkSilk(n);
    };

    /**
     * Utility function. Check if the argument is a element.
     * @ignore
     */
    core.isElement = function(o) {
        return typeof window.HTMLElement === "object" ? o instanceof window.HTMLElement : //DOM2
        typeof o === "object" && o.nodeType === 1 && typeof o.nodeName === "string";
    };

    /**
     * @method getPath
     * @ignore
     * @param {Object} config
     * Check if there's a template URL (usually used for testing),
     * otherwise join the baseURL with the config.uri
     */
    core.getPath = function(config) {
        if (config.templateURL) {
            return config.templateURL.replace("{uri}", config.uri);
        }
        return baseURL + config.uri;
    };
    /**
     * @method processEvent
     * @ignore
     * @param {Object} {Array} event
     * @param {Object} data
     * Check if event is an Array, if so loop through, else just execute.
     */
    core.processEvent = function(event, data) {
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
    };
    /**
     * @method getPlayerInstance
     * @ignore
     * @param {ContentWindow} source
     * @returns {MTVNPlayer.Player} A player instance
     */
    core.getPlayerInstance = function(source) {
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
    };
    /**
     * @method executeCallbacks
     * @ignore
     * @param {MTVNPlayer.Player} player
     * Fires callbacks registered with MTVNPlayer.onPlayer
     */
    core.executeCallbacks = function(player) {
        for (var i = 0, len = onPlayerCallbacks.length; i < len; i++) {
            onPlayerCallbacks[i](player);
        }
    };
})(window.MTVNPlayer.module("core"), window.jQuery || window.Zepto);
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
     * Copy one event object to another, building an array when necessary.
     */
    config.copyEvents = function(toObj, fromObj) {
        var newEvent, currentEvent;
        if (fromObj) {
            for (var prop in fromObj) {
                if (fromObj.hasOwnProperty(prop)) {
                    newEvent = fromObj[prop];
                    if (newEvent !== undefined) {
                        currentEvent = toObj[prop];
                        if (currentEvent) {
                            // the event object already exists, we need to augment it
                            if (currentEvent instanceof Array) {
                                if (newEvent instanceof Array) {
                                    // combine the arrays
                                    toObj[prop] = currentEvent.concat(newEvent);
                                } else {
                                    // tack on the event to an existing array
                                    currentEvent.push(newEvent);
                                }
                            } else {
                                // make a new array and concat the new array, or just make an array with two items.
                                toObj[prop] = newEvent instanceof Array ? [currentEvent].concat(newEvent) : [currentEvent, newEvent];
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
    };
    /**
     * @ignore
     * Copy one config object to another, this includes a deep copy for flashvars, attributes, and params.
     */
    var copyProperties = config.copyProperties = function(toObj, fromObj) {
            if (fromObj) {
                for (var prop in fromObj) {
                    if (fromObj.hasOwnProperty(prop)) {
                        if (fromObj[prop] !== undefined && fromObj[prop] !== null) {
                            var propName = prop.toLowerCase();
                            if (propName === "flashvars" || propName === "attributes" || propName === "params") {
                                toObj[prop] = toObj[prop] || {};
                                copyProperties(toObj[prop], fromObj[prop]);
                            } else {
                                // make sure width and height are defined and not zero
                                if ((prop === "width" || prop === "height") && !fromObj[prop]) {
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
(function(mod, document) {
    "use strict";
    var selector = null;
    mod.find = function(query) {
        mod.initialize();
        return selector(query);
    };
    /**
     * micro-selector
     * @method selector
     * @ignore
     * author:  Fabio Miranda Costa
     * github:  fabiomcosta
     * twitter: @fabiomiranda
     * license: MIT-style license
     */
    mod.initialize = function() {
        mod.initialize = function() {};
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
                    for (var j = parsedPseudos.length; j--;) {
                        var pseudoClass = pseudos[parsedPseudos[j]];
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
                while ((selector = selector.replace(/([#.:])?([^#.:]*)/, parser))) {}
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
                for (var i = 0, len = collection.length; i < len; i++) {
                    elements.push(collection[i]);
                }
            };
        try {
            slice.call(document.documentElement.childNodes, 0);
        } catch (e) {
            arrayFrom = arrayMerge;
        }
        var arrayFilterAndMerge = function(found) {
                for (var i = 0, len = found.length; i < len; i++) {
                    var node = found[i];
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
    };
})(window.MTVNPlayer.module("selector"), window.document);
/*	SWFObject v2.2 <http://code.google.com/p/swfobject/> 
	is released under the MIT License <http://www.opensource.org/licenses/mit-license.php> 
*/
(function(FlashModule) {
    // creates the swfobject class.
    FlashModule.getSWFObject = function() {
        if (!window.MTVNPlayer.swfobject) {
            var swfobject = function() {
                    var D = "undefined",
                        r = "object",
                        S = "Shockwave Flash",
                        W = "ShockwaveFlash.ShockwaveFlash",
                        q = "application/x-shockwave-flash",
                        R = "SWFObjectExprInst",
                        x = "onreadystatechange",
                        O = window,
                        j = document,
                        t = navigator,
                        T = false,
                        U = [h],
                        o = [],
                        N = [],
                        I = [],
                        l, Q, E, B, J = false,
                        a = false,
                        n, G, m = true,
                        M = function() {
                            var aa = typeof j.getElementById != D && typeof j.getElementsByTagName != D && typeof j.createElement != D,
                                ah = t.userAgent.toLowerCase(),
                                Y = t.platform.toLowerCase(),
                                ae = Y ? /win/.test(Y) : /win/.test(ah),
                                ac = Y ? /mac/.test(Y) : /mac/.test(ah),
                                af = /webkit/.test(ah) ? parseFloat(ah.replace(/^.*webkit\/(\d+(\.\d+)?).*$/, "$1")) : false,
                                X = !+"\v1",
                                ag = [0, 0, 0],
                                ab = null;
                            if (typeof t.plugins != D && typeof t.plugins[S] == r) {
                                ab = t.plugins[S].description;
                                if (ab && !(typeof t.mimeTypes != D && t.mimeTypes[q] && !t.mimeTypes[q].enabledPlugin)) {
                                    T = true;
                                    X = false;
                                    ab = ab.replace(/^.*\s+(\S+\s+\S+$)/, "$1");
                                    ag[0] = parseInt(ab.replace(/^(.*)\..*$/, "$1"), 10);
                                    ag[1] = parseInt(ab.replace(/^.*\.(.*)\s.*$/, "$1"), 10);
                                    ag[2] = /[a-zA-Z]/.test(ab) ? parseInt(ab.replace(/^.*[a-zA-Z]+(.*)$/, "$1"), 10) : 0
                                }
                            } else {
                                if (typeof O.ActiveXObject != D) {
                                    try {
                                        var ad = new ActiveXObject(W);
                                        if (ad) {
                                            ab = ad.GetVariable("$version");
                                            if (ab) {
                                                X = true;
                                                ab = ab.split(" ")[1].split(",");
                                                ag = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                                            }
                                        }
                                    } catch (Z) {}
                                }
                            }
                            return {
                                w3: aa,
                                pv: ag,
                                wk: af,
                                ie: X,
                                win: ae,
                                mac: ac
                            }
                        }(),
                        k = function() {
                            if (!M.w3) {
                                return
                            }
                            if ((typeof j.readyState != D && j.readyState == "complete") || (typeof j.readyState == D && (j.getElementsByTagName("body")[0] || j.body))) {
                                f()
                            }
                            if (!J) {
                                if (typeof j.addEventListener != D) {
                                    j.addEventListener("DOMContentLoaded", f, false)
                                }
                                if (M.ie && M.win) {
                                    j.attachEvent(x, function() {
                                        if (j.readyState == "complete") {
                                            j.detachEvent(x, arguments.callee);
                                            f()
                                        }
                                    });
                                    if (O == top) {
                                        (function() {
                                            if (J) {
                                                return
                                            }
                                            try {
                                                j.documentElement.doScroll("left")
                                            } catch (X) {
                                                setTimeout(arguments.callee, 0);
                                                return
                                            }
                                            f()
                                        })()
                                    }
                                }
                                if (M.wk) {
                                    (function() {
                                        if (J) {
                                            return
                                        }
                                        if (!/loaded|complete/.test(j.readyState)) {
                                            setTimeout(arguments.callee, 0);
                                            return
                                        }
                                        f()
                                    })()
                                }
                                s(f)
                            }
                        }();

                    function f() {
                        if (J) {
                            return
                        }
                        try {
                            var Z = j.getElementsByTagName("body")[0].appendChild(C("span"));
                            Z.parentNode.removeChild(Z)
                        } catch (aa) {
                            return
                        }
                        J = true;
                        var X = U.length;
                        for (var Y = 0; Y < X; Y++) {
                            U[Y]()
                        }
                    }

                    function K(X) {
                        if (J) {
                            X()
                        } else {
                            U[U.length] = X
                        }
                    }

                    function s(Y) {
                        if (typeof O.addEventListener != D) {
                            O.addEventListener("load", Y, false)
                        } else {
                            if (typeof j.addEventListener != D) {
                                j.addEventListener("load", Y, false)
                            } else {
                                if (typeof O.attachEvent != D) {
                                    i(O, "onload", Y)
                                } else {
                                    if (typeof O.onload == "function") {
                                        var X = O.onload;
                                        O.onload = function() {
                                            X();
                                            Y()
                                        }
                                    } else {
                                        O.onload = Y
                                    }
                                }
                            }
                        }
                    }

                    function h() {
                        if (T) {
                            V()
                        } else {
                            H()
                        }
                    }

                    function V() {
                        var X = j.getElementsByTagName("body")[0];
                        var aa = C(r);
                        aa.setAttribute("type", q);
                        var Z = X.appendChild(aa);
                        if (Z) {
                            var Y = 0;
                            (function() {
                                if (typeof Z.GetVariable != D) {
                                    var ab = Z.GetVariable("$version");
                                    if (ab) {
                                        ab = ab.split(" ")[1].split(",");
                                        M.pv = [parseInt(ab[0], 10), parseInt(ab[1], 10), parseInt(ab[2], 10)]
                                    }
                                } else {
                                    if (Y < 10) {
                                        Y++;
                                        setTimeout(arguments.callee, 10);
                                        return
                                    }
                                }
                                X.removeChild(aa);
                                Z = null;
                                H()
                            })()
                        } else {
                            H()
                        }
                    }

                    function H() {
                        var ag = o.length;
                        if (ag > 0) {
                            for (var af = 0; af < ag; af++) {
                                var Y = o[af].id;
                                var ab = o[af].callbackFn;
                                var aa = {
                                    success: false,
                                    id: Y
                                };
                                if (M.pv[0] > 0) {
                                    var ae = c(Y);
                                    if (ae) {
                                        if (F(o[af].swfVersion) && !(M.wk && M.wk < 312)) {
                                            w(Y, true);
                                            if (ab) {
                                                aa.success = true;
                                                aa.ref = z(Y);
                                                ab(aa)
                                            }
                                        } else {
                                            if (o[af].expressInstall && A()) {
                                                var ai = {};
                                                ai.data = o[af].expressInstall;
                                                ai.width = ae.getAttribute("width") || "0";
                                                ai.height = ae.getAttribute("height") || "0";
                                                if (ae.getAttribute("class")) {
                                                    ai.styleclass = ae.getAttribute("class")
                                                }
                                                if (ae.getAttribute("align")) {
                                                    ai.align = ae.getAttribute("align")
                                                }
                                                var ah = {};
                                                var X = ae.getElementsByTagName("param");
                                                var ac = X.length;
                                                for (var ad = 0; ad < ac; ad++) {
                                                    if (X[ad].getAttribute("name").toLowerCase() != "movie") {
                                                        ah[X[ad].getAttribute("name")] = X[ad].getAttribute("value")
                                                    }
                                                }
                                                P(ai, ah, Y, ab)
                                            } else {
                                                p(ae);
                                                if (ab) {
                                                    ab(aa)
                                                }
                                            }
                                        }
                                    }
                                } else {
                                    w(Y, true);
                                    if (ab) {
                                        var Z = z(Y);
                                        if (Z && typeof Z.SetVariable != D) {
                                            aa.success = true;
                                            aa.ref = Z
                                        }
                                        ab(aa)
                                    }
                                }
                            }
                        }
                    }

                    function z(aa) {
                        var X = null;
                        var Y = c(aa);
                        if (Y && Y.nodeName == "OBJECT") {
                            if (typeof Y.SetVariable != D) {
                                X = Y
                            } else {
                                var Z = Y.getElementsByTagName(r)[0];
                                if (Z) {
                                    X = Z
                                }
                            }
                        }
                        return X
                    }

                    function A() {
                        return !a && F("6.0.65") && (M.win || M.mac) && !(M.wk && M.wk < 312)
                    }

                    function P(aa, ab, X, Z) {
                        a = true;
                        E = Z || null;
                        B = {
                            success: false,
                            id: X
                        };
                        var ae = c(X);
                        if (ae) {
                            if (ae.nodeName == "OBJECT") {
                                l = g(ae);
                                Q = null
                            } else {
                                l = ae;
                                Q = X
                            }
                            aa.id = R;
                            if (typeof aa.width == D || (!/%$/.test(aa.width) && parseInt(aa.width, 10) < 310)) {
                                aa.width = "310"
                            }
                            if (typeof aa.height == D || (!/%$/.test(aa.height) && parseInt(aa.height, 10) < 137)) {
                                aa.height = "137"
                            }
                            j.title = j.title.slice(0, 47) + " - Flash Player Installation";
                            var ad = M.ie && M.win ? "ActiveX" : "PlugIn",
                                ac = "MMredirectURL=" + O.location.toString().replace(/&/g, "%26") + "&MMplayerType=" + ad + "&MMdoctitle=" + j.title;
                            if (typeof ab.flashvars != D) {
                                ab.flashvars += "&" + ac
                            } else {
                                ab.flashvars = ac
                            }
                            if (M.ie && M.win && ae.readyState != 4) {
                                var Y = C("div");
                                X += "SWFObjectNew";
                                Y.setAttribute("id", X);
                                ae.parentNode.insertBefore(Y, ae);
                                ae.style.display = "none";
                                (function() {
                                    if (ae.readyState == 4) {
                                        ae.parentNode.removeChild(ae)
                                    } else {
                                        setTimeout(arguments.callee, 10)
                                    }
                                })()
                            }
                            u(aa, ab, X)
                        }
                    }

                    function p(Y) {
                        if (M.ie && M.win && Y.readyState != 4) {
                            var X = C("div");
                            Y.parentNode.insertBefore(X, Y);
                            X.parentNode.replaceChild(g(Y), X);
                            Y.style.display = "none";
                            (function() {
                                if (Y.readyState == 4) {
                                    Y.parentNode.removeChild(Y)
                                } else {
                                    setTimeout(arguments.callee, 10)
                                }
                            })()
                        } else {
                            Y.parentNode.replaceChild(g(Y), Y)
                        }
                    }

                    function g(ab) {
                        var aa = C("div");
                        if (M.win && M.ie) {
                            aa.innerHTML = ab.innerHTML
                        } else {
                            var Y = ab.getElementsByTagName(r)[0];
                            if (Y) {
                                var ad = Y.childNodes;
                                if (ad) {
                                    var X = ad.length;
                                    for (var Z = 0; Z < X; Z++) {
                                        if (!(ad[Z].nodeType == 1 && ad[Z].nodeName == "PARAM") && !(ad[Z].nodeType == 8)) {
                                            aa.appendChild(ad[Z].cloneNode(true))
                                        }
                                    }
                                }
                            }
                        }
                        return aa
                    }

                    function u(ai, ag, Y) {
                        var X, aa = c(Y);
                        if (M.wk && M.wk < 312) {
                            return X
                        }
                        if (aa) {
                            if (typeof ai.id == D) {
                                ai.id = Y
                            }
                            if (M.ie && M.win) {
                                var ah = "";
                                for (var ae in ai) {
                                    if (ai[ae] != Object.prototype[ae]) {
                                        if (ae.toLowerCase() == "data") {
                                            ag.movie = ai[ae]
                                        } else {
                                            if (ae.toLowerCase() == "styleclass") {
                                                ah += ' class="' + ai[ae] + '"'
                                            } else {
                                                if (ae.toLowerCase() != "classid") {
                                                    ah += " " + ae + '="' + ai[ae] + '"'
                                                }
                                            }
                                        }
                                    }
                                }
                                var af = "";
                                for (var ad in ag) {
                                    if (ag[ad] != Object.prototype[ad]) {
                                        af += '<param name="' + ad + '" value="' + ag[ad] + '" />'
                                    }
                                }
                                aa.outerHTML = '<object classid="clsid:D27CDB6E-AE6D-11cf-96B8-444553540000"' + ah + ">" + af + "</object>";
                                N[N.length] = ai.id;
                                X = c(ai.id)
                            } else {
                                var Z = C(r);
                                Z.setAttribute("type", q);
                                for (var ac in ai) {
                                    if (ai[ac] != Object.prototype[ac]) {
                                        if (ac.toLowerCase() == "styleclass") {
                                            Z.setAttribute("class", ai[ac])
                                        } else {
                                            if (ac.toLowerCase() != "classid") {
                                                Z.setAttribute(ac, ai[ac])
                                            }
                                        }
                                    }
                                }
                                for (var ab in ag) {
                                    if (ag[ab] != Object.prototype[ab] && ab.toLowerCase() != "movie") {
                                        e(Z, ab, ag[ab])
                                    }
                                }
                                aa.parentNode.replaceChild(Z, aa);
                                X = Z
                            }
                        }
                        return X
                    }

                    function e(Z, X, Y) {
                        var aa = C("param");
                        aa.setAttribute("name", X);
                        aa.setAttribute("value", Y);
                        Z.appendChild(aa)
                    }

                    function y(Y) {
                        var X = c(Y);
                        if (X && X.nodeName == "OBJECT") {
                            if (M.ie && M.win) {
                                X.style.display = "none";
                                (function() {
                                    if (X.readyState == 4) {
                                        b(Y)
                                    } else {
                                        setTimeout(arguments.callee, 10)
                                    }
                                })()
                            } else {
                                X.parentNode.removeChild(X)
                            }
                        }
                    }

                    function b(Z) {
                        var Y = c(Z);
                        if (Y) {
                            for (var X in Y) {
                                if (typeof Y[X] == "function") {
                                    Y[X] = null
                                }
                            }
                            Y.parentNode.removeChild(Y)
                        }
                    }

                    function c(Z) {
                        var X = null;
                        try {
                            X = j.getElementById(Z)
                        } catch (Y) {}
                        return X
                    }

                    function C(X) {
                        return j.createElement(X)
                    }

                    function i(Z, X, Y) {
                        Z.attachEvent(X, Y);
                        I[I.length] = [Z, X, Y]
                    }

                    function F(Z) {
                        var Y = M.pv,
                            X = Z.split(".");
                        X[0] = parseInt(X[0], 10);
                        X[1] = parseInt(X[1], 10) || 0;
                        X[2] = parseInt(X[2], 10) || 0;
                        return (Y[0] > X[0] || (Y[0] == X[0] && Y[1] > X[1]) || (Y[0] == X[0] && Y[1] == X[1] && Y[2] >= X[2])) ? true : false
                    }

                    function v(ac, Y, ad, ab) {
                        if (M.ie && M.mac) {
                            return
                        }
                        var aa = j.getElementsByTagName("head")[0];
                        if (!aa) {
                            return
                        }
                        var X = (ad && typeof ad == "string") ? ad : "screen";
                        if (ab) {
                            n = null;
                            G = null
                        }
                        if (!n || G != X) {
                            var Z = C("style");
                            Z.setAttribute("type", "text/css");
                            Z.setAttribute("media", X);
                            n = aa.appendChild(Z);
                            if (M.ie && M.win && typeof j.styleSheets != D && j.styleSheets.length > 0) {
                                n = j.styleSheets[j.styleSheets.length - 1]
                            }
                            G = X
                        }
                        if (M.ie && M.win) {
                            if (n && typeof n.addRule == r) {
                                n.addRule(ac, Y)
                            }
                        } else {
                            if (n && typeof j.createTextNode != D) {
                                n.appendChild(j.createTextNode(ac + " {" + Y + "}"))
                            }
                        }
                    }

                    function w(Z, X) {
                        if (!m) {
                            return
                        }
                        var Y = X ? "visible" : "hidden";
                        if (J && c(Z)) {
                            c(Z).style.visibility = Y
                        } else {
                            v("#" + Z, "visibility:" + Y)
                        }
                    }

                    function L(Y) {
                        var Z = /[\\\"<>\.;]/;
                        var X = Z.exec(Y) != null;
                        return X && typeof encodeURIComponent != D ? encodeURIComponent(Y) : Y
                    }
                    var d = function() {
                            if (M.ie && M.win) {
                                window.attachEvent("onunload", function() {
                                    var ac = I.length;
                                    for (var ab = 0; ab < ac; ab++) {
                                        I[ab][0].detachEvent(I[ab][1], I[ab][2])
                                    }
                                    var Z = N.length;
                                    for (var aa = 0; aa < Z; aa++) {
                                        y(N[aa])
                                    }
                                    for (var Y in M) {
                                        M[Y] = null
                                    }
                                    M = null;
                                    for (var X in swfobject) {
                                        swfobject[X] = null
                                    }
                                    swfobject = null
                                })
                            }
                        }();
                    return {
                        registerObject: function(ab, X, aa, Z) {
                            if (M.w3 && ab && X) {
                                var Y = {};
                                Y.id = ab;
                                Y.swfVersion = X;
                                Y.expressInstall = aa;
                                Y.callbackFn = Z;
                                o[o.length] = Y;
                                w(ab, false)
                            } else {
                                if (Z) {
                                    Z({
                                        success: false,
                                        id: ab
                                    })
                                }
                            }
                        },
                        getObjectById: function(X) {
                            if (M.w3) {
                                return z(X)
                            }
                        },
                        embedSWF: function(ab, ah, ae, ag, Y, aa, Z, ad, af, ac) {
                            var X = {
                                success: false,
                                id: ah
                            };
                            if (M.w3 && !(M.wk && M.wk < 312) && ab && ah && ae && ag && Y) {
                                w(ah, false);
                                K(function() {
                                    ae += "";
                                    ag += "";
                                    var aj = {};
                                    if (af && typeof af === r) {
                                        for (var al in af) {
                                            aj[al] = af[al]
                                        }
                                    }
                                    aj.data = ab;
                                    aj.width = ae;
                                    aj.height = ag;
                                    var am = {};
                                    if (ad && typeof ad === r) {
                                        for (var ak in ad) {
                                            am[ak] = ad[ak]
                                        }
                                    }
                                    if (Z && typeof Z === r) {
                                        for (var ai in Z) {
                                            if (typeof am.flashvars != D) {
                                                am.flashvars += "&" + ai + "=" + Z[ai]
                                            } else {
                                                am.flashvars = ai + "=" + Z[ai]
                                            }
                                        }
                                    }
                                    if (F(Y)) {
                                        var an = u(aj, am, ah);
                                        if (aj.id == ah) {
                                            w(ah, true)
                                        }
                                        X.success = true;
                                        X.ref = an
                                    } else {
                                        if (aa && A()) {
                                            aj.data = aa;
                                            P(aj, am, ah, ac);
                                            return
                                        } else {
                                            w(ah, true)
                                        }
                                    }
                                    if (ac) {
                                        ac(X)
                                    }
                                })
                            } else {
                                if (ac) {
                                    ac(X)
                                }
                            }
                        },
                        switchOffAutoHideShow: function() {
                            m = false
                        },
                        ua: M,
                        getFlashPlayerVersion: function() {
                            return {
                                major: M.pv[0],
                                minor: M.pv[1],
                                release: M.pv[2]
                            }
                        },
                        hasFlashPlayerVersion: F,
                        createSWF: function(Z, Y, X) {
                            if (M.w3) {
                                return u(Z, Y, X)
                            } else {
                                return undefined
                            }
                        },
                        showExpressInstall: function(Z, aa, X, Y) {
                            if (M.w3 && A()) {
                                P(Z, aa, X, Y)
                            }
                        },
                        removeSWF: function(X) {
                            if (M.w3) {
                                y(X)
                            }
                        },
                        createCSS: function(aa, Z, Y, X) {
                            if (M.w3) {
                                v(aa, Z, Y, X)
                            }
                        },
                        addDomLoadEvent: K,
                        addLoadEvent: s,
                        getQueryParamValue: function(aa) {
                            var Z = j.location.search || j.location.hash;
                            if (Z) {
                                if (/\?/.test(Z)) {
                                    Z = Z.split("?")[1]
                                }
                                if (aa == null) {
                                    return L(Z)
                                }
                                var Y = Z.split("&");
                                for (var X = 0; X < Y.length; X++) {
                                    if (Y[X].substring(0, Y[X].indexOf("=")) == aa) {
                                        return L(Y[X].substring((Y[X].indexOf("=") + 1)))
                                    }
                                }
                            }
                            return ""
                        },
                        expressInstallCallback: function() {
                            if (a) {
                                var X = c(R);
                                if (X && l) {
                                    X.parentNode.replaceChild(l, X);
                                    if (Q) {
                                        w(Q, true);
                                        if (M.ie && M.win) {
                                            l.style.display = "block"
                                        }
                                    }
                                    if (E) {
                                        E(B)
                                    }
                                }
                                a = false
                            }
                        }
                    }
                }();
            // override the initialization of swfobject
            FlashModule.getSWFObject = function() {
                return swfobject;
            }
            return swfobject;
        };
    };
}(window.MTVNPlayer.module("flash")));
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
                    onEndSlate = "onEndSlate",
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
                // fired when the end slate is shown, if the player's configuration is set to do so.
                map[id + onEndSlate] = function(data) {
                    core.processEvent(events[onEndSlate], {
                        data: data,
                        target: player,
                        type: onEndSlate
                    });
                };
                element.addEventListener("ON_ENDSLATE", mapString + onEndSlate);
            };
        MTVNPlayer.Player.flashEventMap = {};
        /**
         * create an embed element
         * Run in the context of {@link MTVNPlayer.Player}
         * @method message
         * @ignore
         */
        this.create = function(player, exists) {
            var targetID = player.id,
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
(function(MTVNPlayer) {
    "use strict";
    // HTML5 Player Module
    var html5 = MTVNPlayer.module("html5");
    if (html5.initialized) {
        return;
    }
    html5.initialized = true;
    html5.initialize = function() {
        html5.initialize = function() {}; //only call this once;
        // private vars
        var core = MTVNPlayer.module("core"),
            processEvent = core.processEvent,
            /**
             * return the iframe to it's original width and height.
             * @method exitFullScreen
             * @ignore
             * @param {MTVNPlayer.Player} player
             */
            exitFullScreen = function(player) {
                player.isFullScreen = false;
                var c = player.config,
                    i = player.element;
                i.style.cssText = "postion:static;z-index:auto;";
                i.width = c.width;
                i.height = c.height;
                processEvent(player.events.onFullScreenChange, {
                    target: player,
                    type: MTVNPlayer.Events.FULL_SCREEN_CHANGE
                });
            },
            /**
             * @method goFullScreen
             * @ignore
             * @param {IFrameElement} iframeElement
             */
            goFullScreen = function(player) {
                var iframeElement = player.element,
                    highestZIndex = player.config.highestZIndex,
                    cssText = player.config.fullScreenCssText;
                player.isFullScreen = true;
                iframeElement.style.cssText = cssText ? cssText : "position:fixed;left:0px;top:0px;z-index:" + (highestZIndex || 2147483645) + ";";
                iframeElement.width = window.innerWidth;
                iframeElement.height = window.innerHeight;
                window.scrollTo(0, 0);
                processEvent(player.events.onFullScreenChange, {
                    target: player,
                    type: MTVNPlayer.Events.FULL_SCREEN_CHANGE
                });
            },
            jsonParse = function(str) {
                // choose method.
                jsonParse = function() {
                    var $ = core.$;
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
            /**
             * @method getMessageData
             * @ignore
             */
            getMessageData = function(data) {
                return data.slice(data.indexOf(":") + 1);
            },
            /**
             * @method onMetadata
             * @ignore
             * @param {Object} data Event data
             * @param {MTVNPlayer.Player} player A player instance
             */
            onMetadata = function(data, player) {
                var obj = jsonParse(getMessageData(data)),
                    newIndex = obj.index,
                    oldIndex = player.playlistMetadata.index;
                player.currentMetadata = obj;
                if (newIndex !== -1) { // index is -1 for ads.
                    player.playlistMetadata.items[obj.index] = obj;
                    player.playlistMetadata.index = obj.index;
                    if (newIndex !== oldIndex) {
                        processEvent(player.events.onIndexChange, {
                            data: newIndex,
                            target: player,
                            type: MTVNPlayer.Events.INDEX_CHANGE
                        });
                    }
                }
                processEvent(player.events.onMetadata, {
                    data: obj,
                    target: player,
                    type: MTVNPlayer.Events.METADATA
                });
            },
            /**
             * @method handleMessage
             * @ignore
             */
            handleMessage = function(event) {
                var data = event.data,
                    player, playhead, events, eventTypes = MTVNPlayer.Events;
                if (data && data.indexOf && data.indexOf("logMessage:") === -1) {
                    player = core.getPlayerInstance(event.source);
                    if (player) {
                        events = player.events;
                        if (data.indexOf("playState:") === 0) {
                            player.state = getMessageData(data);
                            processEvent(events.onStateChange, {
                                data: player.state,
                                target: player,
                                type: eventTypes.STATE_CHANGE
                            });
                        } else if (data.indexOf("playlistComplete") === 0) {
                            processEvent(events.onPlaylistComplete, {
                                data: null,
                                target: player,
                                type: eventTypes.PLAYLIST_COMPLETE
                            });
                        } else if (data.indexOf("metadata:") === 0) {
                            onMetadata(data, player);
                        } else if (data.indexOf("mediaStart") === 0) {
                            processEvent(events.onMediaStart, {
                                data: null,
                                target: player,
                                type: eventTypes.MEDIA_START
                            });
                        } else if (data.indexOf("mediaEnd") === 0) {
                            processEvent(events.onMediaEnd, {
                                data: null,
                                target: player,
                                type: eventTypes.MEDIA_END
                            });
                        } else if (data.indexOf("playheadUpdate") === 0) {
                            playhead = parseInt(getMessageData(data), 10);
                            player.playhead = playhead;
                            processEvent(events.onPlayheadUpdate, {
                                data: playhead,
                                target: player,
                                type: eventTypes.PLAYHEAD_UPDATE
                            });
                        } else if (data.indexOf("playlistMetadata:") === 0) {
                            player.playlistMetadata = jsonParse(getMessageData(data));
                        } else if (data === "onReady") {
                            player.ready = true;
                            var fv = player.config.flashVars;
                            if (fv && fv.sid) {
                                player.message.call(player, "setSSID:" + fv.sid);
                            }
                            core.executeCallbacks(player);
                            processEvent(events.onReady, {
                                data: null,
                                target: player,
                                type: MTVNPlayer.Events.READY
                            });
                        } else if (data === "fullscreen") {
                            if (player.isFullScreen) {
                                exitFullScreen(player);
                            } else {
                                goFullScreen(player);
                            }
                        } else if (data.indexOf("overlayRectChange:") === 0) {
                            processEvent(events.onOverlayRectChange, {
                                data: jsonParse(getMessageData(data)),
                                target: player,
                                type: eventTypes.OVERLAY_RECT_CHANGE
                            });
                        } else if (data.indexOf("onUIStateChange:") === 0) {
                            processEvent(events.onUIStateChange, {
                                data: jsonParse(getMessageData(data)),
                                target: player,
                                type: eventTypes.UI_STATE_CHANGE
                            });
                        } else if (data.indexOf("airplay") === 0) {
                            processEvent(events.onAirplay, {
                                data: null,
                                target: player,
                                type: eventTypes.AIRPLAY
                            });
                        } else if (data.indexOf("onEndSlate:") === 0) {
                            processEvent(events.onEndSlate, {
                                data: jsonParse(getMessageData(data)),
                                target: player,
                                type: "onEndSlate"
                            });
                        }
                    }
                }
            },
            createElement = function(player) {
                var config = player.config,
                    element = document.createElement("iframe"),
                    targetDiv = document.getElementById(player.id);
                element.setAttribute("id", player.id);
                element.setAttribute("src", core.getPath(config));
                element.setAttribute("frameborder", "0");
                element.setAttribute("scrolling", "no");
                element.setAttribute("type", "text/html");
                element.height = config.height;
                element.width = config.width;
                targetDiv.parentNode.replaceChild(element, targetDiv);
                player.element = element;
            };
        /**
         * create the player iframe
         * @method create
         * @ignore
         */
        this.create = function(player, exists) {
            if (!exists) {
                createElement(player);
            }
            core.instances.push({
                source: player.element.contentWindow,
                player: player
            });
            if (typeof window.addEventListener !== 'undefined') {
                window.addEventListener('message', handleMessage, false);
            } else if (typeof window.attachEvent !== 'undefined') {
                window.attachEvent('onmessage', handleMessage);
            }
        };
        /**
         * Send messages to the iframe via post message.
         * Run in the context of {@link MTVNPlayer.Player}
         * @method message
         * @ignore
         */
        this.message = function(message) {
            if (!this.ready) {
                throw new Error("MTVNPlayer.Player." + message + "() called before player loaded.");
            }
            switch (message) {
            case "goFullScreen":
                goFullScreen.apply(this, [this]);
                break;
            case "exitFullScreen":
                exitFullScreen.apply(this, [this]);
                break;
            default:
                if (arguments[1] !== undefined) {
                    message += ":" + arguments[1] + (arguments[2] !== undefined ? "," + arguments[2] : "");
                }
                return this.element.contentWindow.postMessage(message, "*");
            }
        };
        // set up orientationchange handler for iPad
        var n = window.navigator.userAgent.toLowerCase();
        if (n.indexOf("ipad") !== -1) {
            document.addEventListener("orientationchange", function() {
                var i, player = null,
                    instances = core.instances,
                    numberOfInstances = instances.length;
                for (i = numberOfInstances; i--;) {
                    player = instances[i].player;
                    if (player.isFullScreen) {
                        goFullScreen(player);
                    }
                }
            }, false);
        }
    };
})(window.MTVNPlayer);
(function(MTVNPlayer, $) {
    "use strict";
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
         *                  var player = event.target;
         *                  var uri = event.target.config.uri;
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
             * Fired when the metadata changes. event.data is the metadata. Also see {@link MTVNPlayer.Player#currentMetadata}.
             *      player.bind("onMetadata",function(event) {
             *          // inspect the metadata object to learn more (documentation on metadata is in progress)
             *          console.log("metadata",event.data);
             *
             *          // at anytime after the MTVNPlayer.Events#READY,
             *          // you can access the metadata on the player directly at MTVNPlayer.Player#currentMetadata
             *          console.log(event.data === player.currentMetadata); // true
             *      });
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
             * Fired at the end of a playlist
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
             * Fired when the player has loaded and the metadata is available. 
             * You can bind/unbind to events before this fires.
             * You can also invoke most methods before the event, the only exception is
             * {@link MTVNPlayer.Player#getEmbedCode}, since it returns a value which
             * won't be ready until the metadata is ready. Other methods will be queued and 
             * then executed when the player is ready to invoke them.
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
            UI_STATE_CHANGE: "onUIStateChange",
            /**
             * @event onIndexChange
             * Fired when the index of the current playlist item changes, ignoring ads.
             *
             * event.data contains the index
             */
            INDEX_CHANGE: "onIndexChange",
            /**
             * @event onFullScreenChange
             * HTML5 only. Fired when the player.isFullScreen property has been changed. 
             * The player may or may not visually be in full screen, it depends on its context.
             * Check {@link MTVNPlayer.Player#isFullScreen} to see if the player is in full screen or not.
             */
            FULL_SCREEN_CHANGE: "onFullScreenChange",
            /**
             * @event onAirplay
             * @private
             * Fired when the airplay button is clicked
             */
            AIRPLAY: "onAirplay"
        };
        /**
         * When a {@link MTVNPlayer.Events#onStateChange} event is fired, the event's data property will be equal to one of these play states. 
         * At the moment, there may be incongruities between html5 and flash state sequences. 
         * Flash also has "initializing" and "connecting" states, which aren't available in the html5 player.
         */
        MTVNPlayer.PlayState = {
            /**
             * The video is playing.
             * @property
             */
            PLAYING: "playing",
            /**
             * The video is paused.
             * @property
             */
            PAUSED: "paused",
            /**
             * The video is seeking.
             * @property
             */
            SEEKING: "seeking",
            /**
             * The video is stopped.
             * @property
             */
            STOPPED: "stopped",
            /**
             * The video is buffering.
             * @property
             */
            BUFFERING: "buffering"
        };
        // swfobject callback
        MTVNPlayer.onSWFObjectLoaded = null;
        /**
         * @member MTVNPlayer 
         * When using MTVNPlayer.createPlayers this config (see MTVNPlayer.Player.config) object will be used for every player created.
         * If MTVNPlayer.createPlayers is passed a config object, it will override anything defined in MTVNPlayer.defaultConfig.
         */
        MTVNPlayer.defaultConfig = MTVNPlayer.defaultConfig;
        /**
         * @member MTVNPlayer
         * When using MTVNPlayer.createPlayers this events object will be used for every player created.
         * If MTVNPlayer.createPlayers is passed a events object, it will override anything defined in MTVNPlayer.defaultEvents.
         */
        MTVNPlayer.defaultEvents = MTVNPlayer.defaultEvents;
        /**
         * @class MTVNPlayer.Player
         * The player object: use it to hook into events ({@link MTVNPlayer.Events}), call methods, and read properties.
         *      var player = new MTVNPlayer.Player(element/id,config,events);
         *      player.bind("onMetadata",function(event){console.log("onMetadata",event.data);});
         *      player.pause();
         * @constructor
         * Create a new MTVNPlayer.Player
         * @param {String/HTMLElement} id-or-element Pass in a string id, or an actual HTMLElement
         * @param {Object} config config object, see: {@link MTVNPlayer.Player#config}
         * @param {Object} events Event callbacks, see: {@link MTVNPlayer.Events}
         * @returns MTVNPlayer.Player
         */
        MTVNPlayer.Player = (function(window) {
            // static methods variables
            var core = MTVNPlayer.module("core"),
                throwError = function(message) {
                    throw new Error("Embed API:" + message);
                },
                document = window.document,
                Player,
                /**
                 * @method checkEventName
                 * @private
                 * @param {String} eventName
                 * Check if the event exists in our list of events.
                 */
                checkEventName = function(eventName) {
                    var check = function(events) {
                            for (var event in events) {
                                if (events.hasOwnProperty(event) && events[event] === eventName) {
                                    return true; // has event
                                }
                            }
                            return false;
                        };
                    if (check(MTVNPlayer.Events) || check(MTVNPlayer.module("ModuleLoader").Events)) {
                        return;
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
                getEmbedCodeDimensions = function(config, el) {
                    // we don't need to know the exaxt dimensions, just enough to get the ratio
                    var width = config.width === "100%" ? el.clientWidth : config.width,
                        height = config.height === "100%" ? el.clientHeight : config.height,
                        Dimensions16x9 = {
                            width: 512,
                            height: 288
                        },
                        Dimensions4x3 = {
                            width: 360,
                            height: 293
                        },
                        aspect = width / height,
                        Diff4x3 = Math.abs(aspect - 4 / 3),
                        Diff16x9 = Math.abs(aspect - 16 / 9);
                    return Diff16x9 < Diff4x3 ? Dimensions16x9 : Dimensions4x3;
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
                        embedDimensions = getEmbedCodeDimensions(config, this.element),
                        embedCode = "<div style=\"background-color:#000000;width:{divWidth}px;\"><div style=\"padding:4px;\">" + "<iframe src=\"http://media.mtvnservices.com/embed/{uri}\" width=\"{width}\" height=\"{height}\" frameborder=\"0\"></iframe>" + "{displayMetadata}</div></div>";
                    embedCode = embedCode.replace(/\{uri\}/, config.uri);
                    embedCode = embedCode.replace(/\{width\}/, embedDimensions.width);
                    embedCode = embedCode.replace(/\{divWidth\}/, embedDimensions.width + 8);
                    embedCode = embedCode.replace(/\{height\}/, embedDimensions.height);
                    embedCode = embedCode.replace(/\{displayMetadata\}/, displayMetadata);
                    return embedCode;
                },
                createId = function(target) {
                    var newID = "mtvnPlayer" + Math.round(Math.random() * 10000000);
                    target.setAttribute("id", newID);
                    return newID;
                };
            // end private vars
            /**
             * @member MTVNPlayer
             * (Available in 2.2.4) Whether the player(s) that will be created will be html5 players,
             * otherwise they'll be flash players. This is determined by checking the user agent.
             */
            MTVNPlayer.isHTML5Player = core.isHTML5Player(window.navigator.userAgent);
            /**
             * @member MTVNPlayer
             * Whenever a player is created, the callback passed will fire with the player as the first
             * argument, providing an easy way to hook into player events in a decoupled way.
             * @param {Function} callback A callback fired when every player is created.
             *
             *     MTVNPlayer.onPlayer(function(player){
             *          // player is the player that was just created.
             *          // we can now hook into events.
             *          player.bind("onPlayheadUpdate",function(event) {
             *              // do something when "onPlayheadUpdate" fires.
             *          }
             *
             *          // or look for information about the player.
             *          var uri = player.config.uri;
             *     });
             */
            MTVNPlayer.onPlayer = function(callback) {
                core.onPlayerCallbacks.push(callback);
            };
            /**
             * @member MTVNPlayer
             * (Available in 1.6.0) Remove a callback registered width {@link MTVNPlayer#onPlayer}
             * @param {Function} callback A callback fired when every player is created.
             */
            MTVNPlayer.removeOnPlayer = function(callback) {
                var index = core.onPlayerCallbacks.indexOf(callback);
                if (index !== -1) {
                    core.onPlayerCallbacks.splice(index, 1);
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
                    instances = core.instances,
                    i = instances.length;
                for (i; i--;) {
                    result.push(instances[i].player);
                }
                return result;
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
                    selectorQuery = "div.MTVNPlayer";
                }
                var elements = MTVNPlayer.module("selector").find(selectorQuery),
                    configModule = MTVNPlayer.module("config");
                for (var i = 0, len = elements.length; i < len; i++) {
                    new MTVNPlayer.Player(elements[i], configModule.copyProperties(config || {}, MTVNPlayer.defaultConfig), configModule.copyEvents(events || {}, MTVNPlayer.defaultEvents));
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
                 * The swf embed or the iframe element. This may be null after invoking new MTVNPlayer.Player
                 * if swfobject needs to be loaded asynchronously. Once swfobject is loaded, the swf embed will be created and this.element will be set.
                 * If this is a problem, load swfobject before creating players.
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
                 * @property {HTMLElement} isFullScreen
                 * HTML5 only. See {@link MTVNPlayer.Events#onFullScreenChange}
                 */
                this.isFullScreen = false;
                // private vars
                var playerModule = null,
                    el = null,
                    containerElement = document.createElement("div");
                if (core.isElement(elementOrId)) {
                    el = elementOrId;
                    this.id = createId(el);
                    this.config = MTVNPlayer.module("config").buildConfig(el, this.config);
                } else {
                    this.id = elementOrId;
                    el = document.getElementById(this.id);
                }

                // wrap the player element in a container div
                el.parentNode.insertBefore(containerElement, el);
                containerElement.appendChild(el);

                this.events = events || {};
                this.isFlash = this.config.isFlash === undefined ? !core.isHTML5Player : this.config.isFlash;
                // make sure the events are valid
                checkEvents(events);
                // The module contains platform specific code
                playerModule = MTVNPlayer.module(this.isFlash ? "flash" : "html5");
                playerModule.initialize();
                // do more initializing that's across player modules.
                core.playerInit(this,playerModule);
                
                // check for element before creating
                if (!el) {
                    if (document.readyState === "complete") {
                        throwError("target div " + this.id + " not found");
                    } else {
                        if ($) {
                            // wait for document ready, then try again.
                            (function(ref) {
                                $(document).ready(function() {
                                    if (document.getElementById(ref.id)) {
                                        playerModule.create(ref);
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
                    playerModule.create(this);
                }
            };
            // public api
            Player.prototype = {
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
                    this.message("setVolume", volume);
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
                    return getEmbedCode.call(this);
                },
                /**
                 * Puts the player in full screen mode, does not work for the flash player do the flash restrictions.
                 */
                goFullScreen: function() {
                    this.message("goFullScreen");
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
                },
                /**
                 * Adds an event listener for an event that will only fire once and then be removed.
                 * @param {String} eventName an {@link MTVNPlayer.Events}.
                 * @param {Function} callback The function to invoke when the event is fired.
                 */
                once: function(eventName, callback) {
                    var ref = this,
                        newCB = function(event) {
                            ref.unbind(eventName, newCB);
                            callback(event);
                        };
                    this.bind(eventName, newCB);
                }
            };
            return Player;
        }(window));
        /**
         * @member MTVNPlayer
         * @property {Boolean}
         * Set to true after the API is loaded.
         */
        MTVNPlayer.isReady = true;
    }
})(window.MTVNPlayer, window.jQuery || window.Zepto);
// yepnope.js
// Version - 1.5.4pre
//
// by
// Alex Sexton - @SlexAxton - AlexSexton[at]gmail.com
// Ralph Holzmann - @ralphholzmann - ralphholzmann[at]gmail.com
//
// http://yepnopejs.com/
// https://github.com/SlexAxton/yepnope.js/
//
// Tri-license - WTFPL | MIT | BSD
//
// Please minify before use.
// Also available as Modernizr.load via the Modernizr Project
//
( function ( window, doc, undef ) {

var docElement            = doc.documentElement,
    sTimeout              = window.setTimeout,
    firstScript           = doc.getElementsByTagName( "script" )[ 0 ],
    toString              = {}.toString,
    execStack             = [],
    started               = 0,
    noop                  = function () {},
    // Before you get mad about browser sniffs, please read:
    // https://github.com/Modernizr/Modernizr/wiki/Undetectables
    // If you have a better solution, we are actively looking to solve the problem
    isGecko               = ( "MozAppearance" in docElement.style ),
    isGeckoLTE18          = isGecko && !! doc.createRange().compareNode,
    insBeforeObj          = isGeckoLTE18 ? docElement : firstScript.parentNode,
    // Thanks to @jdalton for showing us this opera detection (by way of @kangax) (and probably @miketaylr too, or whatever...)
    isOpera               = window.opera && toString.call( window.opera ) == "[object Opera]",
    isIE                  = !! doc.attachEvent && !isOpera,
    strJsElem             = isGecko ? "object" : isIE  ? "script" : "img",
    strCssElem            = isIE ? "script" : strJsElem,
    isArray               = Array.isArray || function ( obj ) {
      return toString.call( obj ) == "[object Array]";
    },
    isObject              = function ( obj ) {
      return Object(obj) === obj;
    },
    isString              = function ( s ) {
      return typeof s == "string";
    },
    isFunction            = function ( fn ) {
      return toString.call( fn ) == "[object Function]";
    },
    globalFilters         = [],
    scriptCache           = {},
    prefixes              = {
      // key value pair timeout options
      timeout : function( resourceObj, prefix_parts ) {
        if ( prefix_parts.length ) {
          resourceObj['timeout'] = prefix_parts[ 0 ];
        }
        return resourceObj;
      }
    },
    handler,
    yepnope;

  /* Loader helper functions */
  function isFileReady ( readyState ) {
    // Check to see if any of the ways a file can be ready are available as properties on the file's element
    return ( ! readyState || readyState == "loaded" || readyState == "complete" || readyState == "uninitialized" );
  }


  // Takes a preloaded js obj (changes in different browsers) and injects it into the head
  // in the appropriate order
  function injectJs ( src, cb, attrs, timeout, /* internal use */ err, internal ) {
    var script = doc.createElement( "script" ),
        done, i;

    timeout = timeout || yepnope['errorTimeout'];

    script.src = src;

    // Add our extra attributes to the script element
    for ( i in attrs ) {
        script.setAttribute( i, attrs[ i ] );
    }

    cb = internal ? executeStack : ( cb || noop );

    // Bind to load events
    script.onreadystatechange = script.onload = function () {

      if ( ! done && isFileReady( script.readyState ) ) {

        // Set done to prevent this function from being called twice.
        done = 1;
        cb();

        // Handle memory leak in IE
        script.onload = script.onreadystatechange = null;
      }
    };

    // 404 Fallback
    sTimeout(function () {
      if ( ! done ) {
        done = 1;
        // Might as well pass in an error-state if we fire the 404 fallback
        cb(1);
      }
    }, timeout );

    // Inject script into to document
    // or immediately callback if we know there
    // was previously a timeout error
    err ? script.onload() : firstScript.parentNode.insertBefore( script, firstScript );
  }

  // Takes a preloaded css obj (changes in different browsers) and injects it into the head
  function injectCss ( href, cb, attrs, timeout, /* Internal use */ err, internal ) {

    // Create stylesheet link
    var link = doc.createElement( "link" ),
        done, i;

    timeout = timeout || yepnope['errorTimeout'];

    cb = internal ? executeStack : ( cb || noop );

    // Add attributes
    link.href = href;
    link.rel  = "stylesheet";
    link.type = "text/css";

    // Add our extra attributes to the link element
    for ( i in attrs ) {
      link.setAttribute( i, attrs[ i ] );
    }

    if ( ! err ) {
      firstScript.parentNode.insertBefore( link, firstScript );
      sTimeout(cb, 0);
    }
  }

  function executeStack ( ) {
    // shift an element off of the stack
    var i   = execStack.shift();
    started = 1;

    // if a is truthy and the first item in the stack has an src
    if ( i ) {
      // if it's a script, inject it into the head with no type attribute
      if ( i['t'] ) {
        // Inject after a timeout so FF has time to be a jerk about it and
        // not double load (ignore the cache)
        sTimeout( function () {
          (i['t'] == "c" ?  yepnope['injectCss'] : yepnope['injectJs'])( i['s'], 0, i['a'], i['x'], i['e'], 1 );
        }, 0 );
      }
      // Otherwise, just call the function and potentially run the stack
      else {
        i();
        executeStack();
      }
    }
    else {
      // just reset out of recursive mode
      started = 0;
    }
  }

  function preloadFile ( elem, url, type, splicePoint, dontExec, attrObj, timeout ) {

    timeout = timeout || yepnope['errorTimeout'];

    // Create appropriate element for browser and type
    var preloadElem = doc.createElement( elem ),
        done        = 0,
        firstFlag   = 0,
        stackObject = {
          "t": type,     // type
          "s": url,      // src
        //r: 0,        // ready
          "e": dontExec,// set to true if we don't want to reinject
          "a": attrObj,
          "x": timeout
        };

    // The first time (common-case)
    if ( scriptCache[ url ] === 1 ) {
      firstFlag = 1;
      scriptCache[ url ] = [];
    }

    function onload ( first ) {
      // If the script/css file is loaded
      if ( ! done && isFileReady( preloadElem.readyState ) ) {

        // Set done to prevent this function from being called twice.
        stackObject['r'] = done = 1;

        ! started && executeStack();

        // Handle memory leak in IE
        preloadElem.onload = preloadElem.onreadystatechange = null;
        if ( first ) {
          if ( elem != "img" ) {
            sTimeout(function(){ insBeforeObj.removeChild( preloadElem ) }, 50);
          }

          for ( var i in scriptCache[ url ] ) {
            if ( scriptCache[ url ].hasOwnProperty( i ) ) {
              scriptCache[ url ][ i ].onload();
            }
          }
        }
      }
    }


    // Setting url to data for objects or src for img/scripts
    if ( elem == "object" ) {
      preloadElem.data = url;
    } else {
      preloadElem.src = url;

      // Setting bogus script type to allow the script to be cached
      preloadElem.type = elem;
    }

    // Don't let it show up visually
    preloadElem.width = preloadElem.height = "0";

    // Attach handlers for all browsers
    preloadElem.onerror = preloadElem.onload = preloadElem.onreadystatechange = function(){
      onload.call(this, firstFlag);
    };
    // inject the element into the stack depending on if it's
    // in the middle of other scripts or not
    execStack.splice( splicePoint, 0, stackObject );

    // The only place these can't go is in the <head> element, since objects won't load in there
    // so we have two options - insert before the head element (which is hard to assume) - or
    // insertBefore technically takes null/undefined as a second param and it will insert the element into
    // the parent last. We try the head, and it automatically falls back to undefined.
    if ( elem != "img" ) {
      // If it's the first time, or we've already loaded it all the way through
      if ( firstFlag || scriptCache[ url ] === 2 ) {
        insBeforeObj.insertBefore( preloadElem, isGeckoLTE18 ? null : firstScript );

        // If something fails, and onerror doesn't fire,
        // continue after a timeout.
        sTimeout( onload, timeout );
      }
      else {
        // instead of injecting, just hold on to it
        scriptCache[ url ].push( preloadElem );
      }
    }
  }

  function load ( resource, type, dontExec, attrObj, timeout ) {
    // If this method gets hit multiple times, we should flag
    // that the execution of other threads should halt.
    started = 0;

    // We'll do 'j' for js and 'c' for css, yay for unreadable minification tactics
    type = type || "j";
    if ( isString( resource ) ) {
      // if the resource passed in here is a string, preload the file
      preloadFile( type == "c" ? strCssElem : strJsElem, resource, type, this['i']++, dontExec, attrObj, timeout );
    } else {
      // Otherwise it's a callback function and we can splice it into the stack to run
      execStack.splice( this['i']++, 0, resource );
      execStack.length == 1 && executeStack();
    }

    // OMG is this jQueries? For chaining...
    return this;
  }

  // return the yepnope object with a fresh loader attached
  function getYepnope () {
    var y = yepnope;
    y['loader'] = {
      "load": load,
      "i" : 0
    };
    return y;
  }

  /* End loader helper functions */
  // Yepnope Function
  yepnope = function ( needs ) {

    var i,
        need,
        // start the chain as a plain instance
        chain = this['yepnope']['loader'];

    function satisfyPrefixes ( url ) {
      // split all prefixes out
      var parts   = url.split( "!" ),
      gLen    = globalFilters.length,
      origUrl = parts.pop(),
      pLen    = parts.length,
      res     = {
        "url"      : origUrl,
        // keep this one static for callback variable consistency
        "origUrl"  : origUrl,
        "prefixes" : parts
      },
      mFunc,
      j,
      prefix_parts;

      // loop through prefixes
      // if there are none, this automatically gets skipped
      for ( j = 0; j < pLen; j++ ) {
        prefix_parts = parts[ j ].split( '=' );
        mFunc = prefixes[ prefix_parts.shift() ];
        if ( mFunc ) {
          res = mFunc( res, prefix_parts );
        }
      }

      // Go through our global filters
      for ( j = 0; j < gLen; j++ ) {
        res = globalFilters[ j ]( res );
      }

      // return the final url
      return res;
    }

    function getExtension ( url ) {
        return url.split(".").pop().split("?").shift();
    }

    function loadScriptOrStyle ( input, callback, chain, index, testResult ) {
      // run through our set of prefixes
      var resource     = satisfyPrefixes( input ),
          autoCallback = resource['autoCallback'],
          extension    = getExtension( resource['url'] );

      // if no object is returned or the url is empty/0 just exit the load
      if ( resource['bypass'] ) {
        return;
      }

      // Determine callback, if any
      if ( callback ) {
        callback = isFunction( callback ) ?
          callback :
          callback[ input ] ||
          callback[ index ] ||
          callback[ ( input.split( "/" ).pop().split( "?" )[ 0 ] ) ];
      }

      // if someone is overriding all normal functionality
      if ( resource['instead'] ) {
        return resource['instead']( input, callback, chain, index, testResult );
      }
      else {
        // Handle if we've already had this url and it's completed loaded already
        if ( scriptCache[ resource['url'] ] ) {
          // don't let this execute again
          resource['noexec'] = true;
        }
        else {
          scriptCache[ resource['url'] ] = 1;
        }

        // Throw this into the queue
        chain.load( resource['url'], ( ( resource['forceCSS'] || ( ! resource['forceJS'] && "css" == getExtension( resource['url'] ) ) ) ) ? "c" : undef, resource['noexec'], resource['attrs'], resource['timeout'] );

        // If we have a callback, we'll start the chain over
        if ( isFunction( callback ) || isFunction( autoCallback ) ) {
          // Call getJS with our current stack of things
          chain['load']( function () {
            // Hijack yepnope and restart index counter
            getYepnope();
            // Call our callbacks with this set of data
            callback && callback( resource['origUrl'], testResult, index );
            autoCallback && autoCallback( resource['origUrl'], testResult, index );

            // Override this to just a boolean positive
            scriptCache[ resource['url'] ] = 2;
          } );
        }
      }
    }

    function loadFromTestObject ( testObject, chain ) {
        var testResult = !! testObject['test'],
            group      = testResult ? testObject['yep'] : testObject['nope'],
            always     = testObject['load'] || testObject['both'],
            callback   = testObject['callback'] || noop,
            cbRef      = callback,
            complete   = testObject['complete'] || noop,
            needGroupSize,
            callbackKey;

        // Reusable function for dealing with the different input types
        // NOTE:: relies on closures to keep 'chain' up to date, a bit confusing, but
        // much smaller than the functional equivalent in this case.
        function handleGroup ( needGroup, moreToCome ) {
          if ( ! needGroup ) {
            // Call the complete callback when there's nothing to load.
            ! moreToCome && complete();
          }
          // If it's a string
          else if ( isString( needGroup ) ) {
            // if it's a string, it's the last
            if ( !moreToCome ) {
              // Add in the complete callback to go at the end
              callback = function () {
                var args = [].slice.call( arguments );
                cbRef.apply( this, args );
                complete();
              };
            }
            // Just load the script of style
            loadScriptOrStyle( needGroup, callback, chain, 0, testResult );
          }
          // See if we have an object. Doesn't matter if it's an array or a key/val hash
          // Note:: order cannot be guaranteed on an key value object with multiple elements
          // since the for-in does not preserve order. Arrays _should_ go in order though.
          else if ( isObject( needGroup ) ) {
            // I hate this, but idk another way for objects.
            needGroupSize = (function(){
              var count = 0, i
              for (i in needGroup ) {
                if ( needGroup.hasOwnProperty( i ) ) {
                  count++;
                }
              }
              return count;
            })();

            for ( callbackKey in needGroup ) {
              // Safari 2 does not have hasOwnProperty, but not worth the bytes for a shim
              // patch if needed. Kangax has a nice shim for it. Or just remove the check
              // and promise not to extend the object prototype.
              if ( needGroup.hasOwnProperty( callbackKey ) ) {
                // Find the last added resource, and append to it's callback.
                if ( ! moreToCome && ! ( --needGroupSize ) ) {
                  // If this is an object full of callbacks
                  if ( ! isFunction( callback ) ) {
                    // Add in the complete callback to go at the end
                    callback[ callbackKey ] = (function( innerCb ) {
                      return function () {
                        var args = [].slice.call( arguments );
                        innerCb && innerCb.apply( this, args );
                        complete();
                      };
                    })( cbRef[ callbackKey ] );
                  }
                  // If this is just a single callback
                  else {
                    callback = function () {
                      var args = [].slice.call( arguments );
                      cbRef.apply( this, args );
                      complete();
                    };
                  }
                }
                loadScriptOrStyle( needGroup[ callbackKey ], callback, chain, callbackKey, testResult );
              }
            }
          }
        }

        // figure out what this group should do
        handleGroup( group, !!always );

        // Run our loader on the load/both group too
        // the always stuff always loads second.
        always && handleGroup( always );
    }

    // Someone just decides to load a single script or css file as a string
    if ( isString( needs ) ) {
      loadScriptOrStyle( needs, 0, chain, 0 );
    }
    // Normal case is likely an array of different types of loading options
    else if ( isArray( needs ) ) {
      // go through the list of needs
      for( i = 0; i < needs.length; i++ ) {
        need = needs[ i ];

        // if it's a string, just load it
        if ( isString( need ) ) {
          loadScriptOrStyle( need, 0, chain, 0 );
        }
        // if it's an array, call our function recursively
        else if ( isArray( need ) ) {
          yepnope( need );
        }
        // if it's an object, use our modernizr logic to win
        else if ( isObject( need ) ) {
          loadFromTestObject( need, chain );
        }
      }
    }
    // Allow a single object to be passed in
    else if ( isObject( needs ) ) {
      loadFromTestObject( needs, chain );
    }
  };

  // This publicly exposed function is for allowing
  // you to add functionality based on prefixes on the
  // string files you add. 'css!' is a builtin prefix
  //
  // The arguments are the prefix (not including the !) as a string
  // and
  // A callback function. This function is passed a resource object
  // that can be manipulated and then returned. (like middleware. har.)
  //
  // Examples of this can be seen in the officially supported ie prefix
  yepnope['addPrefix'] = function ( prefix, callback ) {
    prefixes[ prefix ] = callback;
  };

  // A filter is a global function that every resource
  // object that passes through yepnope will see. You can
  // of course conditionally choose to modify the resource objects
  // or just pass them along. The filter function takes the resource
  // object and is expected to return one.
  //
  // The best example of a filter is the 'autoprotocol' officially
  // supported filter
  yepnope['addFilter'] = function ( filter ) {
    globalFilters.push( filter );
  };

  // Default error timeout to 10sec - modify to alter
  yepnope['errorTimeout'] = 1e4;

  // Webreflection readystate hack
  // safe for jQuery 1.4+ ( i.e. don't use yepnope with jQuery 1.3.2 )
  // if the readyState is null and we have a listener
  if ( doc.readyState == null && doc.addEventListener ) {
    // set the ready state to loading
    doc.readyState = "loading";
    // call the listener
    doc.addEventListener( "DOMContentLoaded", handler = function () {
      // Remove the listener
      doc.removeEventListener( "DOMContentLoaded", handler, 0 );
      // Set it to ready
      doc.readyState = "complete";
    }, 0 );
  }

  // Attach loader &
  // Leak it
  window['yepnope'] = getYepnope();

  // Exposing executeStack to better facilitate plugins
  window['yepnope']['executeStack'] = executeStack;
  window['yepnope']['injectJs'] = injectJs;
  window['yepnope']['injectCss'] = injectCss;

})( this, document );

/**
* Trying something new here. A way to keep the API clean for utility methods specific to things like reporting.
* These modules are on a player, as opposed to the modules on MTVNPlayer.
*/
(function(MTVNPlayer) {
    "use strict";
    MTVNPlayer.onPlayer(function(player) {
        player.module("reporting").logGUIEvent = function(eventName, eventData) {
            player.message("logGUIEvent", eventName, eventData);
        };
    });
})(window.MTVNPlayer);
(function(MTVNPlayer, yepnope) {
    var ModuleLoader = MTVNPlayer.module("ModuleLoader"),
        baseUrl = "http://media.mtvnservices.com/player/api/module",
        getPath = function(module) {
            return module.baseUrl + module.path + (module.version ? "/" : "") + module.version;
        },
        executeCallbacks = function(module) {
            var callbacks = module.callbacks;
            while (callbacks.length > 0) {
                callbacks.shift()();
            }
        },
        EndSlateModule = {
            callbacks: [],
            baseUrl: baseUrl,
            path: "/end-slate",
            version: "0.0.3",
            eventName: "onEndSlate",
            onModuleRequested: function(event) {
                EndSlateModule.callbacks.push(function() {
                    new(window.MTVNPlayer.EndSlate)(event.data, event.target);
                });
                // we remove yepnope from the window, 
                // and yepnope tries to reference window.yepnope in its own function (unfortunately)
                // so we make a dummy object providing that reference.
                yepnope.call({
                    yepnope: yepnope
                }, {
                    test: window.MTVNPlayer.EndSlate,
                    nope: {
                        js: getPath(EndSlateModule) + "/end-slate.js",
                        css: getPath(EndSlateModule) + "/style.css"
                    },
                    callback: {
                        css: function() {},
                        js: function() {
                            executeCallbacks(EndSlateModule);
                        }
                    }
                });
            }
        };
    // Exports
    ModuleLoader.Events = {
        END_SLATE: EndSlateModule.eventName
    };
    // Export module configs so they can be adjusted for testing.
    ModuleLoader.EndSlateModule = EndSlateModule;
    /**
     * When any player is created, listen for an end slate event
     */
    MTVNPlayer.onPlayer(function(player) {
        player.bind(EndSlateModule.eventName, EndSlateModule.onModuleRequested);
    });
})(window.MTVNPlayer, window.yepnope);
(function(MTVNPlayer) {
    "use strict";
    // return any dependencies the Embed API may have leaked into global.
    MTVNPlayer.noConflict();
    // remove the noConflict function from the api 
    delete MTVNPlayer.noConflict;
    // execute any on API callbacks.
    if (typeof MTVNPlayer.onAPIReady === "function") {
        MTVNPlayer.onAPIReady();
    }
})(window.MTVNPlayer);
MTVNPlayer.version="2.5.0";MTVNPlayer.build="11/10/2012 12:11:09";