/* global _ */
/* exported getModuleManager */
/**
 * A module manager manages modules for a player instance. 
 * As opposed to MTVNPlayer.require/provide, which is static.
 */
var getModuleManager = function() {
	// a hash map of modules.
	var module = {};
	/**
	 * @ignore
	 * framework-y stuff.
	 * You can call module(UserManager) and register an instance of UserManager.
	 * If you want to retrieve the instance just call module(UserManager) again.
	 * Or you can call module("some-user-manager", UserManager), to register a new UserManager,
	 * and then retrieve it via the id module("some-user-manager"). Or if
	 * UserManager.NAME is available, you can also retrieve it with module(UserModule.NAME).
	 */
	return function(name, object) {
		if (name === "all") {
			return module;
		}
		// you can pass just an object
		if (_.isObject(name)) {
			object = name;
			// the object could have a NAME property
			if (!object.NAME) {
				// otherwise generate one and set the NAME property for next time.
				object.NAME = _.uniqueId("PrivateModule");
			}
			name = object.NAME;
		}
		// the module exists already, return it.
		if (module[name]) {
			return module[name];
		}
		// the object wasn't passed in either argument, and wasn't found.
		if (!object) {
			throw "" + name + " module isn't registered yet.";
		}
		// instantiate a function, or set an object.
		module[name] = (_.isFunction(object) ? new object({
			player: this,
			moduleId: name
		}) : object);
		// return the newly created module.
		return module[name];
	};
};