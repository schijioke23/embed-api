(function(context) {
	var MTVNPlayer = context.MTVNPlayer = context.MTVNPlayer || {};
	if (!MTVNPlayer.require) {
		var packages = {};
		/**
		 * use a module, throws an error if the module isn't found.
		 */
		MTVNPlayer.require = function(name) {
			if (!packages[name]) {
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
			for(var p in packages){
				var details = p;
				if(packages[p].version){
					details+= " " + packages[p].version;
				}
				if(packages[p].build){
					details+= " built:" + packages[p].build;
				}
				r.push(details);
			}
			return r;
		};
	}
})(window);