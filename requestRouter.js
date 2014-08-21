var https = require("https");
var moment = require("moment-timezone");
var fs = require("fs");
var querystring = require("querystring");
var uuid = require("node-uuid");

var naver_consumer_key = 'MN720U_cgu6vQZ2femii';
var naver_consumer_secret = 'ukENjpQmOu';

var handle = {};
handle['/'] = home;
handle['/home'] = home;
handle['/favicon.ico'] = favicon;
handle['/screenshots'] = screenshots;
handle['/screenshots/v0.9'] = screenshotsv09;
handle['/register/naver'] = register_naver;
handle['/callback/naver'] = callback_naver;
handle['/account'] = account;

function route(res, path, query, dbhandler) {
    if (typeof handle[path] === 'function') {
        handle[path](res, query, dbhandler);
    } else {
        home(res, query, dbhandler);
    }
}

function home(res, query, dbhandler) {
    fs.readFile('home.html', 'utf8', function(err, data) {
        if(err) {
            console.error('Web server error while request "/home"');
            console.error(err);
        }
        res.writeHead(200, {'Content-Type':'text/html; charset=utf-8'});
        res.end(data);
    });
}

function favicon(res, query, dbhandler) {
	
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
            res.writeHead(200, {'Content-type': 'text/html; charset=utf-8'});
            res.write('<html><body><form action = "/screenshots" name = "select" method = "get">Channel : <input type = "text" name = "channel" value = "');
            res.write(query.channel || '');
            res.write('"><br>Select nearest city<br>');
            res.write(' Seoul<input type = "radio" name = "lang" value = "Asia/Seoul">')
            res.write(' Los Angeles<input type = "radio" name = "lang" value = "America/Los_Angeles">')
            res.write(' New York<input type = "radio" name = "lang" value = "America/New_York">')
            res.write(' London<input type = "radio" name = "lang" value = "Europe/London">')
            res.write(' Kairo<input type = "radio" name = "lang" value = "Africa/Cairo">')
            res.write(' Kabul<input type = "radio" name = "lang" value = "Asia/Kabul">')
            res.write(' Shanghai<input type = "radio" name = "lang" value = "Asia/Shanghai">')
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

function register_naver(res, query, dbhandler) {
    console.info('registering new user');
    var state_token = uuid.v4().split('-')[0];
    console.info('state_token = ' + state_token);
    var naver_register_query = {
        'client_id' : naver_consumer_key,
        'response_type' : 'code',
        'redirect_url' : 'http://moonrise.crudelis.kr/callback/naver',
        'state' : state_token
    };
    var querystr = 'https://nid.naver.com/oauth2.0/authorize?' + querystring.stringify(naver_register_query);
    console.info(querystr);
    res.writeHead(200, {'location' : querystr});
    res.end();
    dbhandler.insert('state_tokens', {'ind' : 0, 'token' : state_token, 'date' : moment.utc().format('YYYY-MM-DD HH:mm:ss')});
}

function callback_naver(res, query, dbhandler) {
    dbhandler.selectWith('state_tokens', 'WHERE token = ' + query.state, function(array) {
        if(typeof array === 'undefined' || array.length < 1) {
            res.writeHead(401, {'Content-Type':'text/html'});
            res.end('Login failed. Try again!');
        } else {
            dbhandler.remove('state_tokens', 'token = ' + query.state);
            
            var naver_access_token_query = {
                'client_id' : naver_consumer_key,
                'client_secret' : naver_consumer_secret,
                'grant_type' : 'authorization_code',
                'state' : query.state,
                'code' : query.code
            };
            var querystr = 'https://nid.naver.com/oauth2.0/token?' + querystring.stringify(naver_access_token_query);
            https.get(querystr, function(response) {
                var data = '';
                response.on('data', function(chunk) {
                    data += chunk;
                });
                response.on('end', function() {
                    console.info('Registered new user!');
                    console.info('ACCESS_TOKEN = ' + data);
                    dbhandler.insert('accounts', {'ind':0,'auth_host':'NAVER','access_token':data});
                    var account_query = {'token':data};
                    res.writeHead(200, {'location':'/account?'+querystring.stringify(account_query)});
                    res.end();
                });
            });
        }
    });
}

function account(res, query, dbhandler) {
    if((typeof query === 'undefined') || (typeof query.token === 'undefined') || (query.token === '')) {
        res.writeHead(401, {'location':'/'});
        res.end();
    } else {
        res.writeHead(200, {'Content-Type':'text/html'});
        fs.readFile('./account.html', 'utf8', function(err, data) {
            if(err) {
                console.error('error while showing account page');
                console.error('token = ' + query.token);
                console.error(err);
            } else {
                res.end(data);
            }
        });
    }
}

exports.route = route;