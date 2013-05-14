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
			/**
			 * existingGlobals are to reset exisitng global vars after the shim.
			 */
			existingGlobals = {},
			queue = [],
			packageCallbacks = {},
			loadedUrls = {},
			slice = [].slice,
			partial = function(func) {
				var args = slice.call(arguments, 1);
				return function() {
					return func.apply(this, args.concat(slice.call(arguments)));
				};
			},
			hasLoadedCSS = function(url) {
				if (url.indexOf(".css") !== -1) {
					return loadedUrls[url];
				}
				return false;
			},
			firePackageCallbacks = function(key) {
				var callbacksForPackage = packageCallbacks[key];
				if (callbacksForPackage) {
					while(callbacksForPackage.length > 0){
						var func = callbacksForPackage.pop();
						func(MTVNPlayer.require(key));
					}
				}
			},
			/**
			 * @param exports Will pull this out of the global context instead of the key, if specified.
			 */
			shim = function(exports, global, url, result, key) {
				exports = exports || key;
				if (!context[exports]) {
					throw "mtvn-package-manager: Can't shim \"" + exports + "\", not found in global scope.";
				}
				MTVNPlayer.provide(key, context[exports]);
				if (global) {
					// push into global
					context[key] = context[exports];
				} else {
					// don't touch global, reset it to what it was before load.
					context[key] = existingGlobals[key];
				}
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
			if (module) {
				packages[name] = module;
				firePackageCallbacks(name);
			} else {
				delete packages[name];
			}
		};
		/**
		 * Checks if a module exists.
		 */
		MTVNPlayer.has = function(name) {
			return packages[name] !== void 0 && packages[name] !== null;
		};
		/**
		 * Get a detailed array of all packages.
		 */
		MTVNPlayer.listPackages = function(keysOnly) {
			var r = [];
			for (var p in packages) {
				var details = p;
				if (!keysOnly) {
					if (packages[p].version) {
						details += " " + packages[p].version;
					}
					if (packages[p].build) {
						details += " built:" + packages[p].build;
					}
				}
				r.push(details);
			}
			return r;
		};
		/**
		 * Perhaps another part of your application is loadingPackages,
		 * you can wait for that callback with onPackage.
		 */
		MTVNPlayer.onPackage = function(name, callback) {
			if (MTVNPlayer.has(name)) {
				callback(MTVNPlayer.require(name));
			} else {
				if (packageCallbacks[name]) {
					packageCallbacks[name].push(callback);
				} else {
					packageCallbacks[name] = [callback];
				}
			}
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
					for (var key in packages) {
						firePackageCallbacks(key);
					}
				}
			},
			hasLoad = false;
			for (var key in packages) {
				var dep = packages[key],
					url = dep.url || dep.src || dep;
				if (!MTVNPlayer.has(key) && !hasLoadedCSS(url)) {
					if (dep.shim) {
						existingGlobals[key] = context[key];
						targetLoad.callback[key] = partial(shim, dep.exports, dep.global);
					}
					targetLoad.load[key] = url;
					loadedUrls[url] = true;
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