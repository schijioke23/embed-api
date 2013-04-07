/*global Handlebars */
(function(context) {
    var MTVNPlayer = context.MTVNPlayer = context.MTVNPlayer || {},
        // no noConflict method for these guys.
        previousHandlebars = context.Handlebars,
        Util = {},
        Backbone,
        _ = MTVNPlayer.require("_");
    // BEGIN THIRD PARTY CODE
    //= ../components/handlebars/handlebars.runtime.js
    // Handlebars has some weird scoping issues in 1.0.rc.1,
    // and I had to modify the source.
    MTVNPlayer.provide("Handlebars", Handlebars);
    // change "this" to a custom scope that has _ and $.
    (function() {
        //= ../components/backbone/backbone.js
        MTVNPlayer.provide("Backbone", this.Backbone);
        Backbone = this.Backbone;
        Backbone.$ = this.$;
    }).apply({
        _: _,
        $: MTVNPlayer.has("$") ? MTVNPlayer.require("$") : null
    });
    // END THIRD PARTY CODE
    // mtvn specific util code below...
    //= form-factor.js
    //= template-processor.js
    //= fullscreen.js
    //= class.js
    //= events.js
    MTVNPlayer.provide("mtvn-util", Util);
    context.Handlebars = previousHandlebars;
    Backbone.noConflict();
})(this);