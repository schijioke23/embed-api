/**
 * When a {@link MTVNPlayer.Events#stateChange} event is fired, the event's data property will be equal to one of these play states.
 * At the moment, there may be incongruities between html5 and flash state sequences.
 * Flash also has "initializing" and "connecting" states, which aren't available in the html5 player.
 */
var PlayState = MTVNPlayer.PlayState = {
    /**
     * The video is playing.
     * @property
     */
    PLAYING: "playing",
    /**
     * The video is paused.
     * @property
     */
    PAUSED: "paused",
    /**
     * The video is seeking.
     * @property
     */
    SEEKING: "seeking",
    /**
     * The video is stopped.
     * @property
     */
    STOPPED: "stopped",
    /**
     * The video is buffering.
     * @property
     */
    BUFFERING: "buffering"
};