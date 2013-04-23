/*global _ */
var Module = function() {
	function Logger(name) {
		this.prefix = name || "Logger";
		_.bindAll(this); // so loggers can be event handlers.
	}

	function doLog(level, name, args) {
		args = _.toArray(args);
		args.unshift("[" + name + "]");
		console[level].apply(console, args);
	}
	_.extend(Logger.prototype, {
		debug: function() {
			doLog("debug", this.prefix, arguments);
		},
		info: function() {
			doLog("info", this.prefix, arguments);
		},
		log: function() {
			doLog("log", this.prefix, arguments);
		},
		warn: function() {
			doLog("warn", this.prefix, arguments);
		},
		error: function() {
			doLog("error", this.prefix, arguments);
		}
	});
	var Module = function(options) {
		this.options = options || {};
		this.player = options.player;
		this.logger = new Logger("PluginPlayer" + (this.name ? "." + this.name : ""));
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