(function(MTVNPlayer, yepnope) {
    var ModuleLoader = MTVNPlayer.module("ModuleLoader"),
        baseUrl = MTVNPlayer.moduleBaseUrl || "http://media.mtvnservices.com/player/embed/api/module/",
        EndSlateModule = {
            eventName: "onEndSlate",
            yepnope: {
                test: window.MTVNPlayer.EndSlate,
                nope: {
                    js: baseUrl + "/end-slate.js",
                    css: baseUrl + "/style.css"
                },
                callback: {
                    css: function() {},
                    js: function() {
                        var queue = EndSlateModule.queue,
                            i = 0,
                            len = queue.length;
                        for (i; i < len; i++) {
                            queue[i]();
                        }
                        queue = [];
                    }
                }
            },
            queue: []
        },
        onModuleRequested = function(event) {
            if (event.type === EndSlateModule.eventName) {
                EndSlateModule.queue.push(function() {
                    new(window.MTVNPlayer.EndSlate)(event.data, event.target);
                });
                yepnope(EndSlateModule.yepnope);
            }
        };
    ModuleLoader.Events = {END_SLATE:EndSlateModule.eventName};
    /**
     * When any player is created, listen for an end slate event
     */
    MTVNPlayer.onPlayer(function(player) {
        player.bind(EndSlateModule.eventName, onModuleRequested);
    });
})(window.MTVNPlayer, window.yepnope);