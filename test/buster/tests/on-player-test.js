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
            this.playerConfig = {
                width: 640,
                height: 320,
                uri: "mgid:cms:video:nick.com:920786"
            };
            document.body.appendChild(this.el);
            this.player = new MTVNPlayer.Player(this.targetId, this.playerConfig);
        },
        "test onPlayer, removeOnPlayer, and order of execution": function(done) {
            var spy = sinon.spy(),
                spy2 = sinon.spy(),
                testRef = this,
                callback = function(player) {
                    assert(player, "no player");
                    assert.calledOnce(spy, "spy not called once");
                    assert.callOrder(spy, spy2);
                    MTVNPlayer.removeOnPlayer(spy);
                    MTVNPlayer.removeOnPlayer(callback);
                    MTVNPlayer.onPlayer(function() {
                        assert.calledOnce(spy, "spy not called once");
                        assert.calledTwice(spy2, "spy not called twice");
                        MTVNPlayer.removeOnPlayer(spy2);
                        done();
                    });
                    new MTVNPlayer.Player(testRef.targetId, testRef.playerConfig);
                };
            MTVNPlayer.onPlayer(spy);
            MTVNPlayer.onPlayer(spy2);
            MTVNPlayer.onPlayer(callback);
        }
    });
})(window.buster, window.MTVNPlayer);