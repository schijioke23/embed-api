(function(buster, MTVNPlayer) {
    "use strict";
    var assert = buster.assert,
        refute = buster.refute,
        sinon = window.sinon;
    buster.testCase("api method response", {
        setUp: function() {
            this.timeout = 10000;
            this.targetId = "targetId";
            this.el = document.createElement("div");
            this.el.setAttribute("id", this.targetId);
            this.playerConfig = {
                width: 640,
                height: 320,
                uri: "mgid:cms:video:nick.com:920786"
            };
            document.body.appendChild(this.el);
            this.player = new MTVNPlayer.Player(this.targetId, this.playerConfig);
        },
        "getEmbedCode": function() {
            this.el.innerHTML = this.player.getEmbedCode();
            var uri = this.el.getElementsByTagName("iframe")[0].getAttribute("src").split("/").pop();
            assert.equals(this.playerConfig.uri, uri, "embed uri did not match player uri");
        }
    });
})(window.buster, window.MTVNPlayer);