(function(context) {
	var MTVNPlayer = context.MTVNPlayer = context.MTVNPlayer || {};
	if (!MTVNPlayer.require) {
		(function() {
			//= third-party/yepnope.js
		}).apply(window);
		var yepnope = window.yepnope,
			isLoadingPackages = false,
			packages = {
				"yepnope": yepnope
			},
			globals = {},
			queue = [],
			shim = function(url, result, key) {
				if (!context[key]) {
					throw "mtvn-package-manager: Can't shim \"" + key + "\", not found in global scope.";
				}
				MTVNPlayer.provide(key, context[key]);
				context[key] = globals[key];
			};
		yepnope.errorTimeout = 180000; //very long timeout
		/**
		 * use a module, throws an error if the module isn't found.
		 * @param name The Module name.
		 * @param optional don't throw an error if not found
		 */
		MTVNPlayer.require = function(name, optional) {
			if (!packages[name] && !optional) {
				throw new Error("MTNVPlayer: package " + name + " not found.");
			}
			return packages[name];
		};
		/**
		 * provide a module with the name
		 */
		MTVNPlayer.provide = function(name, module) {
			packages[name] = module;
		};
		/**
		 * Checks if a module exists.
		 */
		MTVNPlayer.has = function(name) {
			return packages[name] !== undefined;
		};
		/**
		 * Checks if a module exists.
		 */
		MTVNPlayer.list = function() {
			var r = [];
			for (var p in packages) {
				var details = p;
				if (packages[p].version) {
					details += " " + packages[p].version;
				}
				if (packages[p].build) {
					details += " built:" + packages[p].build;
				}
				r.push(details);
			}
			return r;
		};
		/**
		 * Load a bunch of js or css and fire a callback when they're all ready.
		 * The code won't be executed until all the packages are downloaded,
		 * and then it will be executed in the order declared.
		 */
		MTVNPlayer.loadPackages = function(packages, callback) {
			// keeping this simple, only load one set of packages at a time. 
			// if need be I could check the packages that are loading for overlaps, instead of just the boolean.
			if (isLoadingPackages) {
				queue.push(function() {
					MTVNPlayer.loadPackages(packages, callback);
				});
				return;
			}
			isLoadingPackages = true;
			var targetLoad = {
				load: {},
				callback: {},
				complete: function() {
					isLoadingPackages = false;
					if (callback) {
						callback();
					}
					if (queue.length > 0) {
						queue.shift()();
					}
				}
			},
			hasLoad = false;
			for (var key in packages) {
				var dep = packages[key];
				if (!MTVNPlayer.has(key)) {
					if (dep.shim) {
						globals[key] = context[key];
						targetLoad.callback[key] = shim;
					}
					targetLoad.load[key] = dep.url || dep.src || dep;
					hasLoad = true;
				}
			}
			if (hasLoad) {
				yepnope.call({
					yepnope: yepnope
				}, targetLoad);
			} else {
				targetLoad.complete();
			}
		};
	}
})(window);