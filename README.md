# The Embed API is Deprecated

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

# Legacy Documentation

The embed API provides a unified way to embed and use different video players. On iOS devices, an HTML5 player will be created, in all other scenarios a flash player will be created.

- [Builds](#a0)
- [Docs][docs]
- [Version History](http://github.com/mtvn-player/embed-api/wiki/Version-History)
- [Loading](#a1)
- [Usage](#a2)
    - [config](#b1)
    - [events](#b2)
    - [placeholders](#b3)
- [Building and testing](#a3)
- [Advanced usage](#a4)
    - [Defining defaults](#a4-1)
    - [MTVNPlayer.addCallback](#a4-2)
    - [MTVNPlayer.onPlayer](#a4-3)
    - [jQuery/Zepto Support](#a4-4)

<a name="a0"/>
## Builds
Builds are deployed to http://media.mtvnservices.com/player/api/{version}. For example, the minified version of 2.4.3 is here http://media.mtvnservices.com/player/api/2.4.3/api.min.js. The unminifed would be [api.js](http://media.mtvnservices.com/player/api/2.4.3/api.js). There's no directory browsing on live, so if you want to explore you should check out [here](http://media.mtvnservices-d.mtvi.com/player/api/).

<a name="a1"/>
## Loading
The Embed API is loaded just like any other javascript file. If you include it in the head, it is considered "blocking" and will be loaded before your page. You can put it in the footer to avoid this. 

If you know the Embed API is loaded, you can use it right away. However, if you want to decouple your logic, you can use some boilerplate code to listen for an `onAPIReady` event. 
See more [here](#a4-2).


<a name="a2"/>
## Usage

The [MTVNPlayer.Player][constructor] constructor takes 3 arguments

1. either an id or an element.
2. a [config][config] object. 
3. an [events][events] object.

#### Creating a single player with the MTVNPlayer.Player constructor
```javascript
var player = new MTVNPlayer.Player("elementId",config,events);
```

or
```javascript
var player = new MTVNPlayer.Player(element,config,events);
```
    
For a full example see [here][example1].

#### Creating multiple players with MTVNPlayer.createPlayers.
If you want to define a series of identical players, you can list them in html
```html
<div class="MTVNPlayer" data-contenturi="mgid:cms:video:nick.com:920786"></div>
<div class="MTVNPlayer" data-contenturi="mgid:cms:video:nick.com:646789"></div>
```

Then invoke the [MTVNPlayer.createPlayers][createPlayers] method.  

```javascript
MTVNPlayer.createPlayers("div.MTVNPlayer",config,events);
```

All this method does is find an array of elements that match the selector, and then it takes each element and passes it to the [MTVNPlayer.Player][constructor] constructor.
<a name="a2-1"/>
#### Element attributes
When passing an element to the [MTVNPlayer.Player][constructor] constructor, or using [MTVNPlayer.createPlayers][createPlayers], the element can have properties that act as its config. These properites match the config properties but are preceded with `data-`.

```html
<div data-contenturi="mgid:cms:video:nick.com:920786" data-flashVars="autoPlay=true&sid=12345"></div>
```

As you can see, a property that is an object such as flashVars, is represented like querystring parameters.

See [here][config] for a list of all config properties.

The only exception to this is width and height. They are defined like so:

```html
<div data-contenturi="mgid:cms:video:nick.com:920786" style="width:640px;height:320px"></div>
```

<a name="b1"/>
#### Config object
The most common properties that you'll use are width, height and uri. See [here][config] for more.

<a name="b2"/>
#### Events
The events object is an object with method names that map to callback functions. See [here][events] for more.
_In 2.5.x, the on prefix for events is no longer needd. e.g. `onStateChange` is now `stateChange`._
```javascript
var events = {
    mediaStart:function(event){
      // event.target equals the player that dispatched the event.
    },
    metadata:function(event){
        // event.data is the metadata or other data depending on the event.
    }
};
```
Each function has one argument with two properties:
- target: The player that dispatched the event
- data: An optional property that contains data about the event.

Events can be added to a player object as well with `on`, and removed with `off` (`bind` and `unbind` are also supported).

```javascript
player.on("stateChange",function(event){
    // event.data is the state
});
player.on("stateChange:playing",function(event){
    // some events support filtering. (v2.5.0)
});
player.on("playheadUpdate:20",function(event){
    // this works like a cue point, firing at 20 seconds. (v2.5.0)
});
player.one("playheadUpdate:20",function(event){
    // the one method only fires once. (v2.5.0)
});
```
See the [docs][events] for more.

<a name="b3"/>
#### Placeholders
A placeholder is markup defined by you that will take the place of the player until the placeholder is clicked. This allows you to create a lighter version of the poster screen, and delay a video player download to improve the load time of the page.

###### Placeholder markup
A play button image will be layered over the img below by the embed api. 
When the placeholder is clicked, an `MTVNPlayer.Player` will be created.

```html
<div class="MTVNPlayer" data-contentUri="mgid:uma:video:mtv.com:661024">
    <img src="http://mtv.mtvnimages.com/uri/mgid:uma:video:mtv.com:661024?width=640&height=360"
    width="640" height="360">
</div>
```
###### Placeholder configuration
The configuration for the `MTVNPlayer.Player` will come from [MTVNPlayer.defaultConfig](#a4-1), and from the [data attributes](#a2-1) defined on the placeholder itself. The data attributes will override the config values.

###### Placeholder invokation
The placeholder code is invoked by calling player() on a collection of jQuery elements. Using the markup defined above, the call would look like this:
```javascript
    $(".MTVNPlayer").player();
```
###### Empty Placeholder
If `$(".MTVNPlayer").player();` is invoked, and the placeholder has no children, a player will be created immediately.
```html
<div class="MTVNPlayer" data-contentUri="mgid:uma:video:mtv.com:661024">
</div>
```

See [jQuery/Zepto support](#a4-4) for more on this.

<a name="a3"/>
## Building and testing.
After cloning, from the project root run:
```bash
$ npm install
```

This will install all the dependencies.

To build the project run: 
```bash
$ grunt
```
To have the project build when ever you change the code 
```javascript
$ grunt watch
```
(More on [grunt](https://github.com/cowboy/grunt))

To run the Embed API test page open `test/index.html` in the browser.

<a name="a4"/>
## Advanced Usage

<a name="a4-1"/>
### Defining defaults

> Use with caution. Defaults are global and will apply to all players. They also could be overriden mistakenly.

*The defaults can be defined before the API is loaded.*

##### MTVNPlayer.defaultConfig
You can define a [MTVNPlayer.defaultConfig][defaultConfig] object. This will be applied to all players.
```javascript
var MTVNPlayer = MTVNPlayer || {};
MTVNPlayer.defaultConfig = {width:640,height:320};
```

##### MTVNPlayer.defaultEvents
Likewise, and events object may be defined. See more here [MTVNPlayer.defaultEvents][defaultEvents] and a full example [here][example2].
```javascript
var MTVNPlayer = MTVNPlayer || {};
MTVNPlayer.defaultEvents = {onMediaStart:function(event){}};
```
### Callbacks (v2.10.x, for older api versions contact the player team.)

*These callbacks are great way to write decoupled code, you don't need to know when or how the API is loaded, 
or how a player is created, but you can define logic based on these events.*

<a name="a4-2"/>
##### _mtvnPlayerAPIReady
```javascript
var _mtvnPlayerAPIReady = _mtvnPlayerAPIReady || [];
// it's best to add functions with "push", the api overrides it once it loads,
// so you don't have to check MTVNPlayer.isReady.
_mtvnPlayerAPIReady.push(function(){
    // fires when the api has loaded.
    // or if the api is already loaded.
    // now I can create players.
    var player = new MTVNPlayer.Player(element);
});
```

<a name="a4-3"/>
##### _mtvnPlayerReady
```javascript
var _mtvnPlayerReady = _mtvnPlayerReady || [];
_mtvnPlayerReady.push(function(player){
    // fired every time a player is created. 
    // I can now add listeners and invoke methods.
    player.mute();
    player.on("stateChange:playing",function(){
        // playing.
    });
});
```

<a name="a4-4"/>
#### jQuery/Zepto support

Main benefits:
- Tie into [placeholder](#b3) mark up and create the player when the placeholder is clicked.
- Use jQuery style event handlers and method invokations.

_Requires jQuery 1.4.4_

##### Events
Events work similar to hooking into a `MTVNPlayer.Player` instance. Except you bind like so:
```javascript
// you bind off the jQuery-wrapped placeholder element.
$().bind("MTVNPlayer:ready", callback);
```
Also, your callback will be different. It will be a jQuery callback: the first arguement will be the jQuery event, and the second will be the `MTVNPlayer.Player` [events object](#b2).

##### Methods
Methods can be triggered by calling `trigger` on a jQuery collection.
```javascript
// you trigger off the jQuery-wrapped placeholder element.
$().trigger("MTVNPlayer:pause");
$().trigger("MTVNPlayer:playIndex",[1,10]); // Pass arguments as an array.
```

[docs]: http://mtvn-player.github.com/embed-api/docs/
[config]: http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer.Player-cfg-config
[events]: http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer.Events
[defaultEvents]: http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer-property-defaultEvents
[createPlayers]: http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer-method-createPlayers
[defaultConfig]: http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer-property-defaultConfig
[constructor]: http://mtvn-player.github.com/embed-api/docs/#!/api/MTVNPlayer.Player
[example1]: /mtvn-player/embed-api/blob/master/test/public/examples/with-constructor.html
[example2]: /mtvn-player/embed-api/blob/master/test/public/examples/default-events.html
