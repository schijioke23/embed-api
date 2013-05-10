/*global _, Logger*/
var Module = function() {
	var Module = function(options) {
		this.options = options || {};
		this.player = options.player;
		var loggerName = this.name || options.moduleId;
		this.logger = new Logger("MTVNPlayer" + (loggerName ? "." + loggerName : ""));
		this.initialize.apply(this, arguments);
	};
	Module.prototype = {
		initialize: function() {},
		destroy: function() {
			this.logger.warn("doesn't implement destroy");
		}
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