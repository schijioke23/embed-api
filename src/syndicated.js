(function(MTVNPlayer) {
    "use strict";
    if (MTVNPlayer.isHTML5Player) {
        var WindowPlayer = function() {
                var playerModule = MTVNPlayer.module("html5");
                playerModule.initialize();
                this.id = "WindowPlayer";
                this.message = playerModule.message;
                this.config = {
                    width: "100%",
                    height: "100%"
                };
                this.events = {};
                // this will be overriden by the real element once onReady fires.
                this.element = {
                    contentWindow: window
                };
                this.once("onReady", function(event) {
                    // TODO "playerView" is specified in the HTML5 Player
                    event.target.element = document.getElementById("playerView");
                    // since in this case, the element is a div and not an iframe
                    // we set its contentWindow property.
                    event.target.element.contentWindow = window;
                });
                playerModule.create(this, true);
                MTVNPlayer.module("core").playerInit(this, playerModule);
            };
        WindowPlayer.prototype = MTVNPlayer.Player.prototype;
        new WindowPlayer();
    }
})(window.MTVNPlayer);
