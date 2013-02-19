
2.6.3 / 2013-02-19 
==================

  * Structural change. Setting the width and height on the container element, and always setting player height and width to 100%. This is so other components can go inside the container element and use the height and width. 
  * Fix for isHTML5Player and jQuery plugin, remove the placeholder. 
  * Using underscore's isArray method instead of checking instanceof.

2.6.2 / 2013-02-12 
==================

  * Refactoring for endslate. 

2.6.1 / 2013-02-11 
==================

  * Discarded Zepto on non-IE browsers for consistency. Could be added back as an optimization.
  

2.6.0 / 2013-02-10 
==================

  * [BRBPL-3223](http://jira.mtvi.com/browse/BRBPL-3223) Support for loading endslate module.
  * [BRBPL-3461](http://jira.mtvi.com/browse/BRBPL-3461) jQuery Plugin only used for flash players. 
  * Package management with `MTVNPlayer.provide` and `MTVNPlayer.require`

 
2.5.1 / 2013-1-14 
==================

  * [BRBPL-3426](http://jira.mtvi.com/browse/BRBPL-3426) handle performance event from the flash and html5 player. handle config event from html5 player. 


2.5.0 / 2013-1-3 
==================

  * [BRBPL-3345](http://jira.mtvi.com/browse/BRBPL-3345) Support for placeholders and jQuery style event binding and method invokation.
  * `on`, `off`, and `one` deprecate `bind`, `unbind`, and `once`, respectively. 
  * Event name change - 'on' is no longer needed to prefix events. e.g. `player.on("ready",..` instead of `player.on("onReady",..`.
  * Support for filtered events such as `playStateChange:playing`. 
  * Support for cue points `playheadUpdate:20`, fires at 20 seconds.
  * Fixed a bug where events fired in the reverse order they were added. They now fire in order.
  * `MTVNPlayer.getPlayer(uri)`, gets a player that was created with a specific uri.
  * `MTVNPlayer.gc()`, remove any players that aren't in the document from the MTVNPlayer's internal hash map.
  * Fixed issue with `MTVNPlayer.defaultConfig` overriding configs passed to players.
  * Now using `MTVNPlayer.defaultConfig` when invoking new `MTVNPlayer.Player`. It was only used with `MTVNPlayer.createPlayers()` previously.
  * Converted buster unit tests to QUnit tests. Increased coverage.


2.4.4 / 2012-12-14 
==================

  * [BRBPL-3353](http://jira.mtvi.com/browse/BRBPL-3353) Load HTML5 for Android 4 and up.


2.4.3 / 2012-11-29 
==================

  * [BRBPL-3350](http://jira.mtvi.com/browse/BRBPL-3350) Fix Prime 2 play state inconsistencies. 


2.4.2 / 2012-11-10 
==================

  * [BRBPL-3232](http://jira.mtvi.com/browse/BRBPL-3232) Kindle Fire support. 
  
  
2.4.1 / 2012-11-10 (broken, bug fix in 2.4.2)
==================

  * Fix for [once](http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer.Player-method-once) method: unbind the event before calling the callback, in case the callback triggers the event again.
 

2.4.0 / 2012-8-30 
==================
  * New event: [onFullScreenChange](http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer.Events-event-onFullScreenChange).
  * Fix for Prime 2 and [currentMetadata.index](http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer.Player-property-currentMetadata).
  * [BRBPL-2890](http://jira.mtvi.com/browse/BRBPL-2890) Show user clip share from API. 
  * Share reporting for endslate or other future gui elements.
  * syndicated.js - the syndicated.js build goes in an iframe and wraps exactly one player that's in that iframe.


2.3.1 / 2012-7-18
==================
  * 2.3.0 had a build error.
 

2.3.0 / 2012-7-18
==================
  * bug fix for BRBPL-2356, was passing id instead of contentWindow.
  * fix issue with sid introduced in module refactoring.
  * write the version to MTVNPlayer.version.
  * fix [setVolume](http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer.Player-method-setVolume), was invoking wrong flash method.
  * including swfobject in the build.
  * New event: [onIndexChange](http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer.Events-event-onIndexChange).
  * Self-invoking Constructor - In case `MTVNPlayer.Player` is called without the `new` keyword.
  * New property: [isHTML5Player](http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer-property-isHTML5Player).
  * Fixed cascading configuration issue with width and height being set to empty strin when parsed from the style attribute.
  * [BRBPL-2572](http://jira.mtvi.com/browse/BRBPL-2572) Allow events to be queued before player is ready.
  * Maintaining correct aspect ratio and dimensions for embed API method [getEmbedCode](http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer.Player-method-getEmbedCode).
