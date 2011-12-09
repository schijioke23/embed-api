var path = require("path"),
    fs = require("fs"),
    testDir = "." + __dirname.replace(process.cwd(),"");
    apiPath = function(dir){
    	if(testDir === "."){
    		return "../src/index.js";
    	}
    	dir = dir.replace("test","src");
    	return "." + dir.replace(process.cwd(),"")+"/index.js";
    }(__dirname),
    cloud9Port = process.env.C9_PORT,
    port = process.argv[2],
    port = port ? port : (cloud9Port ? cloud9Port : "3131"),
    getContentType = function (file) {
        var extname = path.extname(file);
        switch (extname) {
        case '.js':
            return 'text/javascript';
        case '.css':
            return 'text/css';
        default:
            return "text/html";
        }
    },
    getFile = function(file){
        file = path.normalize(file);

        if (file === "/player/api/") {
            file = apiPath;
        } else if(file.indexOf("favicon.ico") !== -1){
            return;
        } else {
            file = testDir + file;
        }

        if (file === testDir + '/') {
            file = testDir + '/index.html';
        }

        return path.normalize(file);
    };
   
console.log("listening on port:"+port);

require("http").createServer(

function (req, res) {

    var file = getFile(req.url);
    if(file){
        path.exists(file, function (exists) {
            if (exists) {
                fs.stat(file, function (err, stat) {
                    var readStrem;
                    if (err) {
                        throw err;
                    }
                    if (stat.isDirectory()) {
                        res.writeHead(403);
                        res.end('Forbidden: ' + file);
                    } else {
                        console.log("READ file:" + file);
                        readStrem = fs.createReadStream(file);
                        res.writeHead(200, {
                            "Content-Type": getContentType(file),
                            "Content-Encoding": "utf-8"
                        });
                        readStrem.pipe(res);
                    }
                });
            } else {
                res.writeHead(404);
                console.log("Not found:"+file);
                res.end("Not Found:" + file);
            }
        });
    }
}).listen(port);