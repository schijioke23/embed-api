/**
 * Events dispatched by {@link MTVNPlayer.Player}.
 *
 * All events have a target property (event.target) which is the player that dispatched the event.
 * Some events have a data property (event.data) which contains data specific to the event.
 *
 * # How to listen to events
 * Attached to player instance via {@link MTVNPlayer.Player#on}:
 *      player.on("metadata",function(event) {
 *             var metadata = event.data;
 *          }
 *      });
 * Passed in as an Object to the constructor {@link MTVNPlayer.Player}:
 *      var player = new MTVNPlayer.Player("video-player",config,{
 *              metadata:function(event) {
 *                  var metadata = event.data;
 *              }
 *      });
 * Passed as an Object into {@link MTVNPlayer#createPlayers}
 *      MTVNPlayer.createPlayers("div.MTVNPlayer",config,{
 *              metadata:function(event) {
 *                  var metadata = event.data;
 *                  // player that dispatched the event
 *                  var player = event.target;
 *                  var uri = event.target.config.uri;
 *              }
 *      });
 * Attached to player from {@link MTVNPlayer#onPlayer}
 *      MTVNPlayer.onPlayer(function(player){
 *              player.on("metadata",function(event) {
 *                  var metadata = event.data;
 *              }
 *      });
 *
 */
var Events = MTVNPlayer.Events = {
    /**
     * @event metadata
     * Fired when the metadata changes. event.data is the metadata. Also see {@link MTVNPlayer.Player#currentMetadata}.
     *      player.on("metadata",function(event) {
     *          // inspect the metadata object to learn more (documentation on metadata is in progress)
     *          console.log("metadata",event.data);
     *
     *          // at anytime after the MTVNPlayer.Events#READY,
     *          // you can access the metadata on the player directly at MTVNPlayer.Player#currentMetadata
     *          console.log(event.data === player.currentMetadata); // true
     *      });
     */
    METADATA: "metadata",
    /**
     * @event stateChange
     * Fired when the play state changes. event.data is the state.
     *
     * You can also listen for a specific state only (v2.5.0).
     * ```
     * player.on("stateChange:paused",function(event){
     *  // callback fires when state equals paused.
     * });
     * ```
     */
    STATE_CHANGE: "stateChange",
    /**
     * @event mediaStart
     * Fired once per playlist item (content + ads/bumpers).
     */
    MEDIA_START: "mediaStart",
    /**
     * @event mediaEnd
     * Fired when a playlist item ends, this includes its prerolls and postrolls
     */
    MEDIA_END: "mediaEnd",
    /**
     * @event playheadUpdate
     * Fired as the playhead moves. event.data is the playhead time.
     *
     * Support for cue points (v2.5.0).
     * The below snippet fires once when the playhead crosses the 15 second mark.
     * The playhead time itself may be 15 plus a fraction.
     * ```
     * player.one("playheadUpdate:15",function(event){
     *  // callback
     * });
     * ```
     */
    PLAYHEAD_UPDATE: "playheadUpdate",
    /**
     * @event playlistComplete
     * Fired at the end of a playlist
     */
    PLAYLIST_COMPLETE: "playlistComplete",
    /**
     * @deprecated 1.5.0 Use {@link MTVNPlayer.Events#uiStateChange} instead
     * @event onOverlayRectChange
     * Fired when the GUI appears, event.data contains an {Object} {x:0,y:0,width:640,height:320}
     */
    OVERLAY_RECT_CHANGE: "overlayRectChange",
    /**
     * @event ready
     * Fired when the player has loaded and the metadata is available.
     * You can bind/unbind to events before this fires.
     * You can also invoke most methods before the event, the only exception is
     * {@link MTVNPlayer.Player#getEmbedCode}, since it returns a value which
     * won't be ready until the metadata is ready. Other methods will be queued and
     * then executed when the player is ready to invoke them.
     */
    READY: "ready",
    /**
     * @event uiStateChange
     * Fired when the UI changes its state, ususally due to user interaction, or lack of.
     *
     * event.data will contain information about the state.
     * - data.active <code>Boolean</code>: If true, user has activated the UI by clicking or touching.
     * If false, the user has remained idle with out interaction for a predetermined amount of time.
     * - data.overlayRect <code>Object</code>: the area that is not obscured by the GUI, a rectangle such as <code>{x:0,y:0,width:640,height:320}</code>
     */
    UI_STATE_CHANGE: "uiStateChange",
    /**
     * @event indexChange
     * Fired when the index of the current playlist item changes, ignoring ads.
     *
     * event.data contains the index
     */
    INDEX_CHANGE: "indexChange",
    /**
     * @event fullScreenChange
     * HTML5 only. Fired when the player.isFullScreen property has been changed.
     * The player may or may not visually be in full screen, it depends on its context.
     * Check {@link MTVNPlayer.Player#isFullScreen} to see if the player is in full screen or not.
     */
    FULL_SCREEN_CHANGE: "fullScreenChange",
    /**
     * @event volumeChange
     * HTML5 only. Fired when the player.element.volume property has been changed.
     */
    VOLUME_CHANGE: "volumeChange",
    /**
     * @event airplay
     * @private
     * Fired when the airplay button is clicked
     */
    AIRPLAY: "airplay",
    /**
     * @event performance
     * @private
     * Fired when performance data has been collected.
     */
    PERFORMANCE: "performance",
    /**
     * @event durationChange
     * Fired when the duration is updated. An alternative to the metadata event.
     */
    DURATION_CHANGE:"durationChange"
};