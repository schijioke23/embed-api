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