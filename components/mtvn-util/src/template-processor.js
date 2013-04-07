/*global Util, _ */
var templatePreprocess = function(text) {
    // first, support legacy template format of {data}
    return text.replace(/\{{1,}/g, "{{").replace(/\}{1,}/g, "}}")
    // we need to both support {uri} and {uri.id}, there is an obvious conflict there.
    .replace(/\{uri\./, "{uriParts.")
    // last, scope the data, this lets us have undefined vars.
    .replace(/\{{2,}/g, "{{data.");
};

/**
 * text can be a single string, an object with string properites, or an array of strings.
 */
Util.template = function(text, data, keys) {
    // parse strings like {uri}
    if (_.isString(text)) {
        return _.template(templatePreprocess(text), {
            data: data
        }, {
            interpolate: /\{\{(.+?)\}\}/g
        });
    } else {
        _(text).each(function(prop, key) {
            if (!keys || _.contains(keys, key)) {
                // do an extra check to make sure there is a template, perhaps enhancing performance.
                if (_.isString(prop) && prop.indexOf("{") !== -1) {
                    text[key] = _.template(templatePreprocess(prop), {
                        data: data
                    }, {
                        interpolate: /\{\{(.+?)\}\}/g
                    });
                }
            }
        });
        return text;
    }
};
/**
 * This is equivalent to the TemplateProxy in flash.
 */
Util.buildTemplateData = function(player, extraData) {
    var data = _.extend({}, player.config, extraData),
        splitUri = data.uri.split(":");
    // build uri
    data.uriParts = {
        namespace: splitUri[3],
        id: splitUri[4]
    };
    // metadata for legacy
    data.metadata = player.currentMetadata;
    data.playlistMetadata = player.playlistMetadata;
    // future tempales can just access properties on the embed api.
    data.player = player;
    // legacy this is in flash player, not sure if used.
    data.app = {
        width: data.width,
        height: data.height
    };
    return data;
};