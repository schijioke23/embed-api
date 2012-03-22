var buster = buster,
    assert = buster.assert,
    MTVNPlayer = window.MTVNPlayer;
buster.testCase("player created", {
    setUp:function() {
        this.timeout = 10000;
        this.width = 640;
        this.height = 320;
        this.uri = "mgid:cms:video:nick.com:920786";
        var el = this.el = document.createElement("div");
        el.setAttribute("class", "MTVNPlayer");
        el.setAttribute("data-contenturi", this.uri);
        document.body.appendChild(this.el);
    },
    "auto create player":function(done) {
        this.el.setAttribute("style", "width:640;height:320;");
        this.el.setAttribute("data-flashVars", "fv1=value1");
            console.log("el",this.el);
        var testRef = this;
        var callback = function(player) {
            assert.isObject(player,"no player");
            var config = player.config;
            assert.equals(config.uri,testRef.uri,"URIs don't match");
            assert.equals(config.width,testRef.width,"width doesn't match");
            assert.equals(config.height,testRef.height,"height doesn't match");
            var fv1 = config.flashVars.fv1;
            assert.equals(fv1,"value1","flash var 1 fails, value"+fv1);
            done();
        };
        MTVNPlayer.onPlayer(callback);
        MTVNPlayer.createPlayers();
    }
});