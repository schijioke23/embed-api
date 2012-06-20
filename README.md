# Embed API

The embed API provides a unified way to embed and use different video players. On iOS devices, an HTML5 player will be created, in all other scenarios a flash player will be created.

- [API Docs][docs]
- [Loading](#a1)
- [Usage](#a2)
    - [config](#b1)
	- [events](#b2)
- [Contributing and testing](#a3)
- [Advanced usage](#a4)

<a name="a1"/>
## Loading
The Embed API is loaded just like any other javascript file. If you include it in the head, it is considered "blocking" and will be loaded before your page. You can put it in the footer to avoid this. 

If you know the Embed API is loaded, you can use it right away. However, if you want to decouple your logic, you can use some boilerplate code to listen for an `onAPIReady` event. 
See more [here](#a4).


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
#### Events object
The events object is an object with method names that map to callback functions. See [here][events] for more.
```javascript
var events = {
    onMediaStart:function(event){
      // event.target equals the player that dispatched the event.
    },
    onMetadata:function(event){
        // event.data is the metadata or other data depending on the event.
    }
};
```
Each function has one argument with two properties:
- target: The player that dispatched the event
- data: An optional property that contains data about the event.


<a name="a3"/>
## Contributing and testing.
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

To run the Embed API test page:
```bash
$ node test
```

Then visit http://localhost:3131

To run from a different port: 
```bash
$ node test 4141
```

There are also buster unit tests:
```bash
$ buster-server
```
Go to http://localhost:1111/ to capture browsers
```bash
$ buster-test -c test/buster/buster.js
```

<a name="a4"/>
## Advanced Usage

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
### Callbacks

*These callbacks are great way to write decoupled code, you don't need to know when or how the API is loaded, 
or how a player is created, but you can define logic based on these events.*

##### MTVNPlayer.addCallback
This code snippit gives you a decoupled way to know when the Embed API is loaded. Once it is, you can create players, or you can listen for player creation with [MTVNPlayer.onPlayer](#a4-1).

```javascript
var MTVNPlayer = MTVNPlayer || {};
    MTVNPlayer.addCallback = function(n){
        this.onAPIReady = function(e){
            return e ? function(){e();n();} : n;
        }(this.onAPIReady);
	};
    MTVNPlayer.addCallback(function(){
        // The API is ready. Create as many players as you like.
        var player = new MTVNPlayer.Player("player", {uri:"mgid:cms:video:nick.com:920786"});
        //Or perhaps listen for player creation.
        MTVNPlayer.onPlayer(function(player){
            // I didn't create this player, but I can still tie into events.
            player.bind("onStateChange",function(event){});
        });
    });
```
<a name="a4-1"/>
##### MTVNPlayer.onPlayer

This function, only available when the API is loaded, will let you know every time there is a new player created. 

```javascript
MTVNPlayer.onPlayer(function(player){
    // I didn't create this player, but I can still tie into events.
    player.bind("onStateChange",function(event){});
    });
});
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
