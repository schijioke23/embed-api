The goal of this project is to share code and third-party libraries while maintaining a _scope_. A very specific scope, used by the embed-api and other modules, the `MTVNPlayer` object.

###Usage
####Require/Provide
The require and provide methods allow you to share and access packages in the MTVNPlayer namespace.
```javascript
MTVNPlayer.provide("package-name",Package);
var package = MTVNPlayer.require("package-name");
if(MTVNPlayer.has("package-name")){
	
}
```
####Loading packages
A hash of keys and urls are passed to `MTVNPlayer.loadPackages`, when they're all loaded, the callback is fired. 
Packages usually provide themselves, mtvn-util for example, will `MTVNPlayer.provide("mtvn-util",util)`. Any source though can be "shimmed", and in this case the key is the global variable, and when the source is loaded, the global variable will be grabbeed out of the global namespace and moved into MTVNPlayer. The global variable will be either the name of the package like "$" below, or you can specifiy an exports property like "_".
```javascript
var packages = {
    "$": {
        shim: true, // here we're shimming, so we specify a url separately.
        url: "http://ajax.googleapis.com/ajax/libs/jquery/1.9.1/jquery.min.js",
        global: true // put the $ on the window, or don't revert it. The opposite of noConflict().
    },
    "underscore": {
        shim: true, // here we're shimming, so we specify a url separately.
        url: "http://cdnjs.cloudflare.com/ajax/libs/underscore.js/1.4.4/underscore-min.js",
        exports: "_" // This is similar to requirejs
    },
    "mtvn-util": "http://media.mtvnservices.com/player/api/module/mtvn-util/0.1.0/mtvn-util.js",
    "mtvn-playlist": "http://media.mtvnservices.com/player/api/module/mtvn-playlist/latest/mtvn-playlist.js",
    "mtvn-playback": "http://media.mtvnservices.com/player/api/module/mtvn-playback/archive/0.0.2-8/mtvn-playback.js"
}
MTVNPlayer.loadPackages(packages,function(){
	// packages ready.
	var util = MTVNPlayer.require("mtvn-util"),
		// $ is shimmed into MTVNPlayer, and kept out of the global namespace.
		$ = MTVNPlayer.require("$");
});
```

####Decoupled Events
If you're expecting another piece of code to load your module, you can listen for an onPackage event.
Will fire immediately if the package is already loaded.
```javascript
MTVNPlayer.onPackage("mtvn-util", function(pkg) {
    var util = pkg;
});
```