var http = require("http");
var router = require("./router");

function start(config, dbhandler) {
    
    function onRequest(req, res) {
        console.info('request detected');
        res.writeHead(200, {'Content-Type': 'text/html'});
		router.route(res, dbhandler, req.url);
    }
    
    var server = http.createServer(onRequest);
    server.listen(process.env.OPENSHIFT_NODEJS_PORT || config.server.port, process.env.OPENSHIFT_NODEJS_IP || config.server.address);
    
    server.addListener('error', function(err) {
        console.error('error on web server');
        console.error(err);
    });
    
    console.info('server started');
}

exports.start = start;