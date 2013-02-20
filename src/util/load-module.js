/*global MTVNPlayer Config yepnope _ */
var ModuleLoader = MTVNPlayer.module("ModuleLoader"),
    versionIsMinimum = Config.versionIsMinimum,
    provideJQuery = function() {
        // provide $ if it's on the window
        if(!MTVNPlayer.has("$")) {
            var $ = window.jQuery;
            // TODO we can lower this version if we want to test first.
            if($ && versionIsMinimum("1.9.0", $.fn.jquery)) {
                MTVNPlayer.provide("$", $);
            }
        }
    },
    executeCallbacks = function(callbacks) {
        while(callbacks.length > 0) {
            callbacks.shift()();
        }
    },
    EndslateModule = {
        callbacks: [],
        eventName: "endslate",
        loadModule: _.once(function(module) {
            // store the current $.
            var $ = window.$;
            // build the paths
            // we want to be able to override this for testing w/o updating the confi
            var js = this.js || module.url,
                css = this.css || module.css;
            provideJQuery();
            // we removed yepnope from the window,
            // and yepnope tries to reference window.yepnope in its own function (unfortunately)
            // so we make a dummy object providing that reference.
            yepnope.call({
                yepnope: yepnope
            }, {
                load: ModuleLoader.getDependencyList(module.dependencies).concat([js, css]),
                callback: function() {
                    provideJQuery();
                },
                complete: function() {
                    // reset the window $ to what it was before loading.
                    window.$ = $;
                    executeCallbacks(EndslateModule.callbacks);
                }
            });
        }),
        onModuleRequested: function(event) {
            var player = event.target;
            // add callback
            this.callbacks.push(function() {
                new(MTVNPlayer.require("endslate"))({
                    config: event.data,
                    player: player
                });
            });
            if(MTVNPlayer.has("endslate")) {
                executeCallbacks(this.callbacks);
            } else {
                this.loadModule(player.config.module.endslate);
            }
        }
    };
// bind
_.bindAll(EndslateModule);
/**
 * @ignore
 * builds an array of urls for dependencies that aren't loaded.
 */
ModuleLoader.getDependencyList = function(dependencies) {
    var load = [];
    _(dependencies).each(function(value, id) {
        // check if the dependency is loaded.
        if(!MTVNPlayer.has(id)) {
            load.push(value.url);
        }
    });
    return load;
};
// Exports
ModuleLoader.Events = {
    ENDSLATE: EndslateModule.eventName
};
// Export module configs so they can be adjusted for testing.
ModuleLoader.EndslateModule = EndslateModule;
/**
 * @ignore
 * When any player is created, listen for an end slate event
 */
MTVNPlayer.onPlayer(function(player) {
    player.bind(EndslateModule.eventName, EndslateModule.onModuleRequested);
});