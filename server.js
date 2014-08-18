var http = require("http");
var router = require("./router");

function start(config, dbhandler) {
	function printImages(res, dbhandler, url) {
		function showImage(res, obj) {
        var describe = obj.username + ' : ' + obj.message + ' - ' + obj.date + ' <br>';
        res.write(describe);
        var image = '<image src = "' + obj.address + '" style = "max-width: 100%; height: auto;"/> <p>';
        res.write(image);
		}
	
		function onResult(array) {
		
			res.writeHead(200, {'Content-type': 'text/html'});
			res.write('<html><body><form action = "/screenshots" name = "select" method = "get">Username : <input type = "text" name = "username" value = "');
			res.write(query.username || '');
			res.write('"><br>Page     : <input type = "text" name = "page" value = "');
			res.write(query.page || '1');
			res.write('"><br><input type = "submit", name = "submit"></form>')
			
			var page = parseInt(query.page);
			if (typeof page === 'undefined' || page == 'NaN' || page < 1) page = 1;
			
			for (var i=Math.min((page * 20) - 20, array.length); i<Math.min((page * 20), array.length); i++) {
				showImage(res, array[i]);
			}
            
			res.end('</body></html>');
		}
	
		dbhandler.selectWith('screenshots', 'WHERE username LIKE "%' + query.username + '%" OR message LIKE "%' + query.username + '%" ORDER BY ind DESC', onResult);
	}
		
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