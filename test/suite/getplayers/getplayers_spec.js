describe("Test Get Player", function() {
    it("test player count",function(){
        waitsFor(function() {
            return function(){
				return doneCreatingPlayers === true;
			}();
		}, "doneCreatingPlayers", 10000);

        runs(function(){
            expect(numberOfPlayers).toEqual(MTVNPlayer.getPlayers().length);
        });
    });

    it("test player is a player",function(){
        runs(function(){
            var player = MTVNPlayer.getPlayers()[0];
            expect(player.config.uri).toEqual("mgid:cms:video:nick.com:920786");
        });
    });
});
