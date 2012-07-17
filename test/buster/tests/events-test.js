(function(buster, MTVNPlayer) {
    "use strict";
    var assert = buster.assert,
        refute = buster.refute,
        sinon = window.sinon;
    buster.testCase("bind and unbind", {
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
        "event queue": function(done) {
            var player = this.player;
            var onStateChange = function(event) {
                assert(event.data, "state is not defined");
                done();
            };
            player.once("onStateChange", onStateChange);
            player.play();
        },
        "check playhead": function(done) {
            var player = this.player;
            var onReady = function() {
                    var spy = sinon.spy();
                    player.bind("onPlayheadUpdate", spy);
                    player.unbind("onPlayheadUpdate", spy);
                    player.bind("onPlayheadUpdate", function(event) {
                        refute(isNaN(event.data), "event.data is NaN.");
                        assert.equals(event.data, player.playhead, "event data does not match player.playhead");
                        refute.called(spy, "unbind didn't work on spy");
                        done();
                    });
                    player.play();
                };
            player.bind("onReady", onReady);
        },
        "check onMetadata": function(done) {
            var player = this.player;
            var onReady = function() {
                    var onMetadata = function(event) {
                            assert.isObject(event.data, "metadata is not an object");
                            assert.equals(event.data, player.currentMetadata);
                            player.unbind("onMetadata", onMetadata);
                            done();
                        };
                    player.bind("onMetadata", onMetadata);
                    player.play();
                };
            player.bind("onReady", onReady);
        },
        "check onStateChange": function(done) {
            var player = this.player;
            var onReady = function() {
                    var onStateChange = function(event) {
                        assert(event.data, "state is not defined");
                        player.unbind("onStateChange", onStateChange);
                        done();
                    };
                    player.bind("onStateChange", onStateChange);
                    player.play();
                };
            player.bind("onReady", onReady);
        },
        "check sequence": function(done) {
            var player = this.player,
                onReadySpy = sinon.spy(),
                onStateChangeSpy = sinon.spy(),
                onMetadataSpy = sinon.spy();
            player.bind("onReady", onReadySpy);
            player.bind("onMetadata", onMetadataSpy);
            player.bind("onStateChange", onStateChangeSpy);
            player.bind("onReady", function() {
                player.play();
            });
            setTimeout(function() {
                assert.calledOnce(onReadySpy, "ready never called");
                assert.called(onMetadataSpy, "onMetadata never called");
                assert.called(onStateChangeSpy, "onStateChange never called");
                assert.callOrder(onReadySpy, onMetadataSpy, onStateChangeSpy);
                assert.callOrder(onReadySpy, onStateChangeSpy, onMetadataSpy); // why do these both work?
                done();
            }, 10000);
        }
    });
})(window.buster, window.MTVNPlayer);