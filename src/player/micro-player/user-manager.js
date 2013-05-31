/* global _, Module*/
/* exported UserManager */
var UserManager = Module.extend({
	name: "UserManager",
	ccOn: true,
	isOk: function() {
		return true;
	},
	preferredVolume: function() {
		return 1;
	},
	isCCOn: function(ccOn) {
		if (!_.isUndefined(ccOn)) {
			this.ccOn = ccOn;
		}
		return this.ccOn;
	},
	destroy: function() {
		// nothing to clean up.
	}
}, {
	NAME: "UserManager"
});