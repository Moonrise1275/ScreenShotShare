var http = require("http");
var url = require("url");
var querystring = require("querystring");
var moment = require("moment");

var router = require("./requestRouter");

function start(config, dbhandler) {
    function onRequest(req, res) {
        var urlstring = req.url;
        var path = url.parse(urlstring).pathname;
        var query = querystring.parse(url.parse(urlstring).query);
		if (path != '/favicon.ico') {
			var ins = {};
			ins['ind'] = 0;
			ins['path'] = path || '';
			ins['query'] = query || '';
			ins['ip'] = req.headers['x-forwarded-for'] || '0.0.0.0';
			ins['date'] = moment.utc().format('YYYY-MM-DD HH:mm:ss');
			dbhandler.insert('webrequests', ins);
		}
        
        router.route(res, path, query, dbhandler);
    }
    var server = http.createServer(onRequest);
    var ip = process.env.OPENSHIFT_NODEJS_IP || config.webserver.ip;
    var port = process.env.OPENSHIFT_NODEJS_PORT || config.webserver.port;
    server.listen(port, ip);
}

exports.start = start;