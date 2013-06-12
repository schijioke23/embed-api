/* global MTVNPlayer, require*/
/* exported Logger */
var Logger = require("mtvn-util").Logger;
(new Logger("MTVNPlayer")).log("v" + MTVNPlayer.version + " built:" + MTVNPlayer.build);