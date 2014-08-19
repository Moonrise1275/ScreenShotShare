var http = require("http");
var url = require("url");
var querystring = require("querystring");

var router = require("./requestRouter");

function start(config, dbhandler) {
    function onRequest(req, res) {
		console.info(req.headers.host);
		
        var urlstring = req.url;
        var path = url.parse(urlstring).pathname;
        var query = querystring.parse(url.parse(urlstring).query);
        
        router.route(res, path, query, dbhandler);
    }
    console.info('starting web server');
    var server = http.createServer(onRequest);
    var ip = process.env.OPENSHIFT_NODEJS_IP || config.webserver.ip;
    var port = process.env.OPENSHIFT_NODEJS_PORT | config.webserver.port;
    server.listen(port, ip);
	console.info('web server launched');
}

exports.start = start;