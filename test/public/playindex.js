var MTVNPlayer = MTVNPlayer || {};
MTVNPlayer.addCallback = function(n){
    this.onAPIReady = function(e){
		return e ? function(){e();n();} : n;
	}(this.onAPIReady);
};
MTVNPlayer.addCallback(function(){
	MTVNPlayer.onPlayer(function(player){
		player.bind(MTVNPlayer.Events.READY,function(){
			var items = player.playlistMetadata.items, i = 0,
				len = items.length,
				button = null,
				container = document.createDocumentFragment(),
				targetDiv = null,
				labelPrefix = "play ";
			if(len > 1){
				targetDiv = document.getElementById("playIndex");
				targetDiv.addEventListener("click",function(event){
					var t = event.target.innerText;
					if(t && t.indexOf(labelPrefix) === 0){
						player.playIndex(parseInt(t.slice(labelPrefix.length),10));
					}
				},false);
				if(targetDiv){
					for(i;i < len;i++){
						button = document.createElement("button");
						button.innerText = labelPrefix + i;
						container.appendChild(button);
					}
					targetDiv.appendChild(container);
				}
			}
		});
	});
});
