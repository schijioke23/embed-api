(function(buster,MTVNPlayer) {
    "use strict";
    var assert = buster.assert;
    buster.testCase("player created", {
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
        "player onReady event": function(done) {
            var test = this;
            this.player.bind("onReady", function(event) {
                assert.isObject(event, "no event");
                assert.isObject(event.target, "no player");
                assert.equals(event.target.id, test.targetId);
                done();
            });
        },
        "player onMetadata event": function(done) {
            this.player.bind("onMetadata", function(event) {
                assert.isObject(event, "no event");
                assert.isObject(event.target, "no player");
                assert.isObject(event.data, "no data");
                done();
            });
        }
    });
})(window.buster, window.MTVNPlayer);