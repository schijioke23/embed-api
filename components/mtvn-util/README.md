This package takes some third party code and some common utility functions and `provides` them on the `MTVNPlayer` object.

Once loaded:
```javascript
var Backbone = MTVNPlayer.require("Backbone");
var Handlebars = MTVNPlayer.require("Handlebars");
var mtvnUtil = MTVNPlayer.require("mtvn-util");
mtvnUtil.someUtilMethod();
```

Handlebars source had to be modified for this release. See [here](https://github.com/wycats/handlebars.js/issues/423).

### mtvn-util

#### Form Factor Parsing

`mapFormFactorID` - take a hash map of input, and return a map of the form factor values mapped to those values.
```javascript
var myMap = mapFormFactorID("6:1,2",{"6":name:"share",value:["facebook","twitter","embed"]});
\\ myMap.share = ["twitter","embed"];

var myMap = mapFormFactorID("10:1",{"10":name:"fullEpisode",value:[false,true]});
\\ myMap.fullEpisode = true;

var myMap = mapFormFactorID("",{"10":name:"fullEpisode",value:[false,true],defaultValue:false});
\\ myMap.fullEpisode = false;
```
