/* global MTVNPlayer, Core, $ */
/**
 * @member MTVNPlayer
 * Whenever a player is created, the callback passed will fire with the player as the first
 * argument, providing an easy way to hook into player events in a decoupled way.
 * @param {Function} callback A callback fired when every player is created.
 *
 *     MTVNPlayer.onPlayer(function(player){
 *          // player is the player that was just created.
 *          // we can now hook into events.
 *          player.on("playheadUpdate",function(event) {
 *              // do something when "playheadUpdate" fires.
 *          }
 *
 *          // or look for information about the player.
 *          var uri = player.config.uri;
 *     });
 */
MTVNPlayer.onPlayer = function(callback) {
  Core.onPlayerCallbacks.push(callback);
};
/**
 * @member MTVNPlayer
 * (Available in 1.6.0) Remove a callback registered width {@link MTVNPlayer#onPlayer}
 * @param {Function} callback A callback fired when every player is created.
 */
MTVNPlayer.removeOnPlayer = function(callback) {
  var index = Core.onPlayerCallbacks.indexOf(callback);
  if (index !== -1) {
    Core.onPlayerCallbacks.splice(index, 1);
  }
};
/**
 * @member MTVNPlayer
 * Returns an array containing each {@link MTVNPlayer.Player} created.
 * @returns {Array} An array containing each {@link MTVNPlayer.Player} created.
 *      var players = MTVNPlayer.getPlayers();
 *      for(var i = 0, len = players.length; i < len; i++){
 *          var player = players[i];
 *          if(player.config.uri === "mgid:cms:video:thedailyshow.com:12345"){
 *              // do something
 *          }
 *      }
 */
MTVNPlayer.getPlayers = function() {
  var result = [],
    instances = Core.instances,
    i = instances.length;
  for (i; i--;) {
    result.push(instances[i].player);
  }
  return result;
};
/**
 * @member MTVNPlayer
 * Returns a player that matches a specific uri
 * @returns MTVNPlayer.Player
 */
MTVNPlayer.getPlayer = function(uri) {
  var instances = Core.instances,
    i = instances.length;
  for (i; i--;) {
    if (instances[i].player.config.uri === uri) {
      return instances[i].player;
    }
  }
  return null;
};
/**
 * @member MTVNPlayer
 * Garbage collection, looks for all {@link MTVNPlayer.Player} that are no longer in the document,
 * and removes them from the hash map.
 */
MTVNPlayer.gc = function() {
  var elementInDocument = function(element) {
    while (element.parentNode) {
      element = element.parentNode;
      if (element == document) {
        return true;
      }
    }
    return false;
  };
  var instances = Core.instances,
    i = instances.length;
  for (i; i--;) {
    var player = instances[i].player,
      el = player.containerElement;
    if (!el || !elementInDocument(el)) {
      instances.splice(i, 1);
      player.destroy();
    }
  }
};
/**
 * @member MTVNPlayer
 * Create players from elements in the page.
 * This should be used if you need to create multiple players that are the same.
 * @param {String} selector default is "div.MTVNPlayer"
 * @param {Object} config {@link MTVNPlayer.Player#config}
 * @param {Object} events {@link MTVNPlayer.Events}
 *
 * Example:
 *      <div class="MTVNPlayer" data-contenturi="mgid:cms:video:nick.com:920786"/>
 *      <script type="text/javascript">
 *              MTVNPlayer.createPlayers("div.MTVNPlayer",{width:640,height:320})
 *      </script>
 *  With events:
 *      <div class="MTVNPlayer" data-contenturi="mgid:cms:video:nick.com:920786"/>
 *      <script type="text/javascript">
 *              MTVNPlayer.createPlayers("div.MTVNPlayer",{width:640,height:320},{
 *                  onPlayheadUpdate:function(event) {
 *                      // do something custom
 *                      var player = event.target; // the player that dispatched the event
 *                      var playheadTime = event.data // some events have a data property with event-specific data
 *                      if(player.config.uri === "mgid:cms:video:thedailyshow.com:12345"){
 *                              // here we're checking if the player that dispatched the event has a specific URI.
 *                              // however, we also could have called MTVNPlayer#createPlayers with a different selector to distingush.
 *                      }
 *                  }
 *              });
 *      </script>
 */
MTVNPlayer.createPlayers = function(selectorQuery, config, events) {
  var $ = window.$ || $;
  $(selectorQuery || ".MTVNPlayer").player({
    config: config || {},
    events: events || {}
  });
};