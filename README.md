## The Embed API is Deprecated

The embed api has migrated to [p-js/player](https://github.com/p-js/player).

`PJS.Player` is backwards compatible with `MTVNPlayer.Player`. Besides deprecated methods in `MTVNPlayer.Player`.

The key differences are:

##### New URL

Load pjs from http://media.mtvnservices.com/pjs/?v=0.10.0 instead of http://media.mtvnservices.com/player/api/2.11.0/

##### User agent detection on server

The /pjs/ url above returns either flash or html5 embed logic, whereas the embed api did user agent detection in the client. 

##### EdgePlayer

The next gen player may also be returned from that request. 
See this [wiki](https://github.com/p-js/player/wiki/Enabling-EdgePlayer) for more information. 

EdgePlayer doesn't wrap Player Prime (the flash player) or an iframe (the legacy html5 player), 
but instead creates all the player components in the page with javascript/html/css.
On browsers where HLS is not supported natively by the video element, a flash shim may be
used to provide that support. More details in [p-js/player](https://github.com/p-js/player).


