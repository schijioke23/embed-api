var MTVNPlayer = MTVNPlayer || {};
MTVNPlayer.addCallback = function(n){
	this.onAPIReady = function(e){
		return e ? function(){e();n();} : n;
	}(this.onAPIReady);
};
describe("Player", function() {
	var player,isPlayerReady;
	MTVNPlayer.addCallback(function(){
		MTVNPlayer.onPlayer(function(p){
			player = p;
			player.bind("onReady",function(){isPlayerReady = true;});
		});
	});

	it('a player should load', function () {
		waitsFor(function() {
			return function(){
				return typeof(player) === "object";
			}();
		}, "player never loaded", 10000);

	});

	it('metadata should validaate', function () {
		waitsFor(function() {
			return function(){
				return player.currentMetadata && player.currentMetadata.rss;
			}();
		}, "current metadata never set", 10000);

		runs(function () {
			expect(player.currentMetadata.rss.guid).toEqual("mgid:cms:video:nick.com:920786");
		});
	});
	
	it('player should be ready', function () {
		waitsFor(function() {
			return function(){
				return isPlayerReady;
			}();
		}, "player never ready", 10000);

		runs(function () {
			player.play();
		});
	});
	
	it('player should be playing', function () {
		waitsFor(function() {
			return function(){
				return player.state === "playing";
			}();
		}, "player never played", 10000);

		runs(function () {
			player.pause();
		});
	});
});