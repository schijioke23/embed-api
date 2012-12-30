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
     * @ignore
     * When any player is created, listen for an end slate event
     */
    MTVNPlayer.onPlayer(function(player) {
        player.bind(EndSlateModule.eventName, EndSlateModule.onModuleRequested);
    });
})(window.MTVNPlayer, window.yepnope);