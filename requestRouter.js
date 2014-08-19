var moment = require("moment-timezone");

var handle = {};
handle['/'] = home;
handle['/home'] = home;
handle['/screenshots'] = screenshots;
handle['/screenshots/v0.9'] = screenshotsv09;

function route(res, path, query, dbhandler) {
	console.info(path);
    if (typeof handle[path] === 'function') {
        handle[path](res, query, dbhandler);
    } else {
        home(res, query, dbhandler);
    }
}

function home(res, query, dbhandler) {
    
}

function screenshots(res, query, dbhandler) {
    function showImage(res, obj) {
        //var months = ['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'];
        var describe = '[' + obj.channel + '] ' + obj.username + ' : ' + obj.message + ' - ';
        //describe += obj.date.getFullYear() + '.' + months[obj.date.getMonth()] + '.' + obj.date.getDate() + ' ';
        //describe += obj.date.getHours() + ':' + obj.date.getMinutes() + ':' + obj.date.getSeconds() + '<br>';
        describe += moment.utc(obj.date).tz(query.lang || 'Asia/Seoul').format('YYYY.MM.DD HH:mm:ss z') + '<br>';
        res.write(describe);
        var image = '<image src = "' + obj.address + '" style = "max-width: 100%; height: auto;"/> <p>';
        res.write(image);
    }
    
    function showImages(res, dbhandler, query) {
		function onResult(array) {
            res.writeHead(200, {'Content-type': 'text/html'});
            res.write('<html><body><form action = "/screenshots" name = "select" method = "get">Channel : <input type = "text" name = "channel" value = "');
            res.write(query.channel || '');
            res.write('"><br>Select nearest city<br>');
            res.write('Seoul<input type = "radio" name = "lang" value = "Asis/Seoul">')
            res.write('Los Angeles<input type = "radio" name = "lang" value = "America/Los_Angeles">')
            res.write('New York<input type = "radio" name = "lang" value = "America/New_York">')
            res.write('London<input type = "radio" name = "lang" value = "Europe/London">')
            res.write('Cairo<input type = "radio" name = "lang" value = "Africa/Cairo">')
            res.write('Kabul<input type = "radio" name = "lang" value = "Asis/Kabul">')
            res.write('Shanghai<input type = "radio" name = "lang" value = "Asis/Shanghai">')
            res.write('<br>Username : <input type = "text" name = "username" value = "');
            res.write(query.username || '');
            res.write('"><br>Page : <input type = "text" name = "page" value = "');
            res.write(query.page || '1');
            res.write('"><br><input type = "submit", name = "submit"></form><p><hr><p>');
            
            var page = parseInt(query.page);
			if (page === undefined || page == 'NaN' || page < 1) page = 1;
			
            for (var i=Math.min((page * 20) - 20, array.length); i<Math.min((page * 20), array.length); i++) {
                showImage(res, array[i]);
            }
            
            res.end('</body></html>');
        }
		
		if (typeof query.username !== 'undefined') {
			console.info('username exist');
			dbhandler.selectWith('screenshots', 'WHERE channel LIKE "%' + query.channel + '%" AND (username LIKE "%' + query.username + '%" OR message LIKE "%' + query.username + '%") ORDER BY ind DESC', onResult);
		} else {
			console.info('empty username');
			dbhandler.selectWith('screenshots', 'ORDER BY ind DESC', onResult);
		}
    }
	showImages(res, dbhandler, query);
}

function screenshotsv09(res, query, dbhandler) {
    function showImage(res, obj) {
        var describe = obj.username + ' : ' + obj.message + ' - ' + obj.date + ' <br>';
        res.write(describe);
        var image = '<image src = "' + obj.address + '" style = "max-width: 100%; height: auto;"/> <p>';
        res.write(image);
    }
    
    function showImages(res, dbhandler, query) {
		function onResult(array) {
            res.writeHead(200, {'Content-type': 'text/html'});
            res.write('<html><body><form action = "/screenshots/v0.9" name = "select" method = "get">Username : <input type = "text" name = "username" value = "');
            res.write(query.username || '');
            res.write('"><br>Page     : <input type = "text" name = "page" value = "');
            res.write(query.page || '1');
            res.write('"><br><input type = "submit", name = "submit"></form>');
            
            var page = parseInt(query.page);
			if (page === undefined || page == 'NaN' || page < 1) page = 1;
			
            for (var i=Math.min((page * 20) - 20, array.length); i<Math.min((page * 20), array.length); i++) {
                showImage(res, array[i]);
            }
            
            res.end('</body></html>');
        }
		
		if (typeof query.username !== 'undefined') {
			console.info('username exist');
			dbhandler.selectWith('screenshotsv09', 'WHERE username LIKE "%' + query.username + '%" OR message LIKE "%' + query.username + '%" ORDER BY ind DESC', onResult);
		} else {
			console.info('empty username');
			dbhandler.selectWith('screenshotsv09', 'ORDER BY ind DESC', onResult);
		}
    }
    showImages(res, dbhandler, query);
}

exports.route = route;