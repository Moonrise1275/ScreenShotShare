var urlparse = require('url');
var querystring = require('querystring');
var fs = require('fs');

function route(res, dbhandler, url) {
	var path = urlparse.parse(url).pathname;
	var query = querystring.parse(urlparse.parse(url).query);
	
	var handle = {};
	handle['/'] = home;
	handle['/screenshots'] = screenshots;
	
	if (typeof handle[path] === 'function') {
		handle[path](res, dbhandler, path);
	} else {
		home(res, dbhandler, path);
	}
}

function home(res, dbhandler, path) {
	var homepage = fs.readFileSync('./home.html', 'utf-8');
	res.end(homepage);
}

function screenshots(res, dbhandler, path) {
	function showImage(res, obj) {
        var describe = obj.username + ' : ' + obj.message + ' - ' + obj.date + ' <br>';
        res.write(describe);
        var image = '<image src = "' + obj.address + '" style = "max-width: 100%; height: auto;"/> <p>';
        res.write(image);
    }
	
	function onResult(array) {
		var query = query;
		if (typeof query !== 'undefined') {
			query = {};
			query['username'] = '';
			query['page'] = '1';
		}
		
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
	
	if (typeof query !== 'undefined' && typeof query.username !== 'undefined') {
		console.info('username exist');
		dbhandler.selectWith('screenshots', 'WHERE username LIKE "%' + query.username + '%" OR message LIKE "%' + query.username + '%" ORDER BY ind DESC', onResult);
	} else {
		console.info('empty username');
		dbhandler.selectWith('screenshots', 'ORDER BY ind DESC', onResult);
	}
}

exports.route = route;