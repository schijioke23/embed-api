(function(MTVNPlayer, yepnope) {
    var ModuleLoader = MTVNPlayer.module("ModuleLoader");
    var baseUrl = MTVNPlayer.moduleBaseUrl || "http://media.mtvnservices.com/player/embed/api/module/";
    var EndSlateModule = {
        eventName: "onEndSlate",
        yepnope: {
            test: window.jQuery || window.Zepto,
            yep: {
                js: baseUrl + "end/end-slate.js"
            },
            nope: {
                js: baseUrl + (navigator.appName.match(/Explorer/) ? "/end-slate.jquery.js" : "/end-slate.zepto.js")
            },
            both: {
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
    };
    ModuleLoader.events = [EndSlateModule.eventName];
    var onModuleRequested = function(event) {
            if (event.type === EndSlateModule.eventName) {
                var player = event.target;
                EndSlateModule.queue.push(function() {
                    new(window.MTVNPlayer.EndSlate)(event.data, player);
                });
                yepnope(EndSlateModule.yepnope);
            }
        };
    MTVNPlayer.onPlayer(function(player) {
        player.bind(EndSlateModule.eventName, onModuleRequested);
    });
})(window.MTVNPlayer, window.yepnope);