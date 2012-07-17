(function(buster, MTVNPlayer) {
    "use strict";
    var assert = buster.assert,
        sinon = window.sinon;
    buster.testCase("event data", {
        setUp: function() {
            this.timeout = 12000;
            this.targetId = "targetId";
            this.el = document.createElement("div");
            this.el.setAttribute("id", this.targetId);
            this.playerConfig = {
                width: 640,
                height: 320,
                uri: "mgid:cms:episode:nick.com:1168000"
            };
            document.body.appendChild(this.el);
            this.player = new MTVNPlayer.Player(this.targetId, this.playerConfig);
        },
        "playlist checks": function(done) {
            var player = this.player,
                items = [],
                clipCount = 0,
                playlistSpy = sinon.spy(),
                timer = null,
                onReady = function(event) {
                    items = player.playlistMetadata.items;
                    player.play();
                },
                onMediaStart = function(event) {
                    var clip = player.currentMetadata;
                    assert.equals(clip, items[clip.index], "currentMetadata doesn't match playlist item Metadata");
                    if ( clip.index < items.length - 1 ) {
                        player.playIndex(clip.index + 1);
                    }
                    clipCount++;
                },
                onPlaylistComplete = function(event) {
                    assert.equals(clipCount, items.length, "onMediaStart not called for every item");
                    clearTimeout(timer);
                    done();
                };

                setTimeout(function() {
                    assert.called(playlistSpy, "onPlaylistComplete not fired");
                    done();
                }, 10000);

            player.bind("onReady", onReady);
            player.bind("onMediaStart", onMediaStart);
            player.bind("onPlaylistComplete", onPlaylistComplete);
            player.bind("onPlaylistComplete", playlistSpy);
        }
    });
})(window.buster, window.MTVNPlayer);