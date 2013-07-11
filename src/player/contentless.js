var Contentless = {
    /**
     * @ignore
     * Configure the player without playing a video
     * @param {String} uri for the desired configuration.
     */
    configure: function(uri) {
        this.message("configure", uri);
    },
    /**
     * @ignore
     * Disable Ads
     * @param {Boolean} disables ads when true.
     */
    disableAds: function(value) {
        this.message("disableAds", value);
    },
    /**
     * @ignore
     * SpoofAdURI
     * @param {uri} When ads are requested use the given uri.
     */
    spoofAdURI: function(uri) {
        this.message("spoofAdURI", uri);
    },
    /**
     * @ignore
     * Load a video from a uri
     * @param {String} uri for video to be loaded.
     */
    loadVideo: function(uri) {
        this.message("loadVideo", uri);
    },
    /**
     * @ignore
     * Load a playlist from a uri
     * @param {String} uri for playlist to load
     * @param {Number} index of desired playlist item.
     */
    loadPlaylist: function(uri, index) {
        this.message("loadPlaylist", uri, index);
    }
};