(function(buster, MTVNPlayer) {
    "use strict";
    var assert = buster.assert,
        refute = buster.refute,
        sinon = window.sinon;
    buster.testCase("cascading", {
        setUp: function() {
            this.timeout = 10000;
            this.targetId = "targetId";
            this.el = document.createElement("div");
            this.el.setAttribute("id", this.targetId);
            this.playerConfig = {
                width: 640,
                height: 320,
                uri: "mgid:cms:video:nick.com:920786",
                flashVars: { autoPlay: true }
            };
            document.body.appendChild(this.el);    
        },
        "config. construct > element": function() {
            this.el.setAttribute("data-width", 650);
            var player = new MTVNPlayer.Player(this.targetId, this.playerConfig);
            assert.equals(this.playerConfig.width, player.config.width);
        },
        "config. element > defaults": function(done) {
            var elementWidth = 650;
            var defaultWidth = 660;

            var onPlayer = function(player) {
                MTVNPlayer.removeOnPlayer(onPlayer);
                assert.equals(elementWidth, player.config.width);
                done();
            };

            delete this.playerConfig.width;
            this.el.style.width = elementWidth + "px";

            MTVNPlayer.defaultConfig = { width: defaultWidth };
            MTVNPlayer.onPlayer(onPlayer);
            MTVNPlayer.createPlayers("div#" + this.targetId, this.playerConfig);
        },
        "events": function(done) {
            var cascadeEventSpy = sinon.spy();
            var defaultEventSpy = sinon.spy();
            var onMetadata = function(event) {
                refute.called.message = "default event called when cascaded";
                refute.called(defaultEventSpy);
                assert.called(cascadeEventSpy, "custom onReady event not called");
                MTVNPlayer.defaultEvents = {};
                done();
            };
            var onPlayer = function(player) {
                MTVNPlayer.removeOnPlayer(onPlayer);
                player.once("onReady", cascadeEventSpy); // This should cascade the MTVNPlayer default onReady event
                player.once("onMetadata", onMetadata);
            };
            MTVNPlayer.defaultEvents = { "onReady": defaultEventSpy };
            MTVNPlayer.onPlayer(onPlayer);
            MTVNPlayer.createPlayers("div#" + this.targetId, this.playerConfig);
        }
    });
})(window.buster, window.MTVNPlayer);