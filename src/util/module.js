var MTVNPlayer = window.MTVNPlayer || {};
(function(MTVNPlayer) {
    "use strict";
	if (!MTVNPlayer.module) {
		MTVNPlayer.module = function() {
			var modules = {};
			return function(name) {
				if (modules[name]) {
					return modules[name];
				}
				modules[name] = {};
				return modules[name];
			};
		}();
	}
})(MTVNPlayer);