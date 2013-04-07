/*global Util, _ */
/**
 * @return {Object} Converts the string into a hash of form factor id and an {Array}. e.g. {0:[1],21:[0,1,2]}
 */
Util.getFormFactorMap = function(formFactorID) {
    var ffMap = {};
    // split into individual form factors.
    if (formFactorID) {
        _((formFactorID).split(".")).each(function(item) {
            item = item.split(":");
            if (item.length === 2) {
                ffMap[item[0]] = item[1].split(",");
            }
        });
    }
    return ffMap;
};
/**
 * @return {Array} The array value for the form factor id e.g. [0,1,2] or [0]
 */
Util.getFormFactorValuesForId = function(formFactorID, id) {
    var ffMap = Util.getFormFactorMap(formFactorID);
    return _.isArray(ffMap[id]) ? ffMap[id] : [];
};
Util.formFactorIgnoreOutOfRange = false;
/**
 * Get the value from the item.
 * If defined, item.value is an array, the index is the item in the array we want.
 * If the index is undefined, we look for a defaultValue.
 * If it's undefined we just return the index.
 */
Util.getFormFactorValue = function(item, index) {
    if (_.isUndefined(index) && !_.isUndefined(item.defaultValue)) {
        return item.defaultValue;
    }
    // if the value is an array, pull the index.
    if (_.isArray(item.value)) {
        // set index to 0 if not defined.
        index = index || 0;
        if(!Util.formFactorIgnoreOutOfRange && index > item.value.length - 1){
            throw "form factor index out of range for " + item.name;
        }
        return item.value[index];
    }
    // return the index if value isn't defined
    return index;
};
/**
 * Take a hash map of input, and return a map of the form factor values mapped to those values.
 * ```javascript
 * var myMap = mapFormFactorID("6:1,2",{"6":name:"share",value:["facebook","twitter","embed"]});
 * \\ myMap.share = ["twitter","embed"];
 *
 * var myMap = mapFormFactorID("10:1",{"10":name:"fullEpisode",value:[false,true]});
 * \\ myMap.fullEpisode = true;
 *
 * var myMap = mapFormFactorID("",{"10":name:"fullEpisode",value:[false,true],defaultValue:false});
 * \\ myMap.fullEpisode = false;
 * ```
 */
Util.mapFormFactorID = function(formFactorID, inputMap, copyTo) {
    var mapFromString = Util.getFormFactorMap(formFactorID);
    // create an object if we're not augmenting one.
    copyTo = copyTo || {};
    // take the input map and for each item reference the form factor object
    _(inputMap).each(function(item, id) {
        // if the string passed has the id in it
        if (_(mapFromString).has(id)) {
            // take the string array of values and map them.
            var result = _(mapFromString[id]).map(function(value) {
                return Util.getFormFactorValue(item, value);
            });
            // sometimes we want a single result to be an array, 
            // and sometimes we want it to be an object.
            item.format = _.isString(item.format) ? item.format : "";
            if(result.length === 1 && item.format.toLowerCase() !== "array"){
                result = result[0];
            }
            copyTo[item.name] = result;
        } else {
            // otherwise use the default, which is the 0 value, unless defaultValue is defined.
            copyTo[item.name] = Util.getFormFactorValue(item);
        }
    });
    return copyTo;
};