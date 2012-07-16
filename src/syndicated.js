(function(window) {
    "use strict";
    var MTVNPlayer = window.MTVNPlayer,
        selector = MTVNPlayer.module("selector"),
        isHTML5Player = MTVNPlayer.isHTML5Player,
        // TODO Perhaps the syndicated page can instantiate a MTVNPlayer.Player
        // when we are going to use flash, instead of wrapping.
        // it would set the templateURL itself
        WindowPlayer = function() {
            var playerModule = MTVNPlayer.module(isHTML5Player ? "html5" : "flash");
            playerModule.initialize();
            this.id = "WindowPlayer";
            this.message = playerModule.message;
            this.config = {
                width: "100%",
                height: "100%"
            };
            this.events = {};
            if (isHTML5Player) {
                this.element = {};
                this.element.contentWindow = window;
                this.bind("onReady", function(event) {
                    // TODO "playerView" is specified in the HTML5 Player
                    event.target.element = selector.find("#playerView");
                });
            } else {
                this.element = selector.find("object")[0];
            }
            playerModule.create(this, true);
            MTVNPlayer.module("core").playerInit(this,playerModule);
        };
    WindowPlayer.prototype = MTVNPlayer.Player.prototype;
    new WindowPlayer();
})(window);