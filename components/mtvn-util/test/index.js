/**
 * Module dependencies.
 */

var express = require('express'),
    routes = require('./routes'),
    http = require('http');

var app = express(),
    version = require("../package.json").version;

app.configure(function() {
    app.set('port', process.env.PORT || process.env.npm_package_config_port || 3003);
    app.set('views', __dirname + '/views');
    app.set('view engine', 'jade');
    app.use(express.favicon());
    app.use(express.logger('dev'));
    app.use(express.bodyParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + '/../build/' + version));
});

app.configure('development', function() {
    app.use(express.errorHandler());
});

app.get('/', routes.index);
app.get('/test-config/:id', routes.config);
app.get('/test-js/:file', routes.testJs);

http.createServer(app).listen(app.get('port'), function() {
    console.log("Express server listening on port " + app.get('port'));
});