var express = require('express'),
    routes = require('./routes'),
    cloud9Port = process.env.C9_PORT,
    port = process.argv[2],
    port = port ? port : (cloud9Port ? cloud9Port : "3131");
var app = module.exports = express.createServer();
app.configure(function() {
    app.set('view options', {
        layout: false
    });
    app.set('basepath', "/test/");
    app.use(express.logger());
    app.use(express.bodyParser());
    app.use(express.cookieParser());
    app.use(express.methodOverride());
    app.use(app.router);
    app.use(express.static(__dirname + "/public"));
    app.use(express.errorHandler({
        dumpExceptions: true,
        showStack: true
    }));
});

app.get("/", routes.index);
app.get("/player/api/", routes.api);
console.log("listening on port:" + port);
app.listen(port);