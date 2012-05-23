(function(buster, MTVNPlayer) {
    "use strict";
    var assert = buster.assert,
        sinon = window.sinon;
    buster.testCase("MTVNPlayer.onPlayer", {
        setUp: function() {
            this.timeout = 10000;
            this.targetId = "targetId";
            this.el = document.createElement("div");
            this.el.setAttribute("id", this.targetId);
            document.body.appendChild(this.el);
        },
        "test config width and height": function() {
            var config = {
                width: 640,
                height: 320,
                uri: "mgid:cms:video:nick.com:920786"
            },
                player = new MTVNPlayer.Player(this.targetId, config);
            assert.equals(config.uri, player.config.uri, "URI doesn't match");
            assert.equals(config.width, player.config.width, "width doesn't match");
            assert.equals(config.height, player.config.height, "height doesn't match");

            config = {
                width: "640",
                height: "320",
                uri: "mgid:cms:video:nick.com:920786"
            }; 
            player = new MTVNPlayer.Player(this.targetId, config);
            assert.equals(config.width, parseInt(player.config.width, 10), "width isn't a number");
            assert.equals(config.height, parseInt(player.config.height, 10), "height isn't a number");
        }
    });
})(window.buster, window.MTVNPlayer);