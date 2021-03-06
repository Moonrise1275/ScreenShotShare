var http = require("http");
var url = require("url");
var querystring = require("querystring");
var moment = require("moment");

var botFactory = require("./botFactory");
var rrouter = require("./requestRouter");
//var erouter = require("./eventRouter");

function start(config, dbhandler) {
    function onRequest(req, res) {
        var urlstring = req.url;
        var path = url.parse(urlstring).pathname;
        var query = querystring.parse(url.parse(urlstring).query);
		if (path != '/favicon.ico') {
			var ins = {};
			ins['ind'] = 0;
			ins['path'] = path || '';
			ins['query'] = url.parse(urlstring).query || '';
			ins['ip'] = req.headers['x-forwarded-for'] || '0.0.0.0';
			ins['date'] = moment.utc().format('YYYY-MM-DD HH:mm:ss');
			dbhandler.insert('webrequests', ins);
		}
        
        rrouter.route(res, path, query, dbhandler);
    }
    
    function onError(err) {
        console.error('error while running web server');
        console.error(err);
    }
    
    var server = http.createServer(onRequest);
    server.addListener('error', onError);
    var ip = process.env.OPENSHIFT_NODEJS_IP || config.webserver.ip;
    var port = process.env.OPENSHIFT_NODEJS_PORT || config.webserver.port;
    
    botFactory.start(config, dbhandler, server);
    
    server.listen(port, ip);
}

exports.start = start;