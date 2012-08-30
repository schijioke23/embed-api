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