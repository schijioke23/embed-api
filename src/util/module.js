/*global _, Logger, require*/
var Module = function() {
	var Module = function(options) {
		this.options = options || {};
		this.player = options.player;
		this.logger = new Logger("MTVNPlayer" + (this.name ? "." + this.name : ""));
		this.initialize.apply(this, arguments);
	};
	Module.prototype = {
		initialize: function() {}
	};
	Module.extend = function(protoProps, staticProps) {
		var parent = this;
		var child;
		if (protoProps && _.has(protoProps, 'constructor')) {
			child = protoProps.constructor;
		} else {
			child = function() {
				return parent.apply(this, arguments);
			};
		}
		_.extend(child, parent, staticProps);
		var Surrogate = function() {
			this.constructor = child;
		};
		Surrogate.prototype = parent.prototype;
		child.prototype = new Surrogate();
		if (protoProps) {
			_.extend(child.prototype, protoProps);
		}
		child.__super__ = parent.prototype;
		return child;
	};
	return Module;
}();