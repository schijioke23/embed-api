/*global _, Module*/
var UserManager = Module.extend({
	name: "UserManager",
	isOk: function() {
		return true;
	},
	preferredVolume: function() {
		return 1;
	},
	isCCOn: function(ccOn) {
		if(!_.isUndefined(ccOn)){
			this.ccOn = ccOn;
		}
		return this.ccOn;
	},
	ccOn:true
});