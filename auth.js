var uuid = require("node-uuid");
var moment = require("moment-timezone");
var querystring = require("querystring");
var https = require("https");

var writer = require("./JSONWriter");

//var google = require("googleapis");
//var goauth2 = google.auth.OAuth2;
//var plus = google.plus('v1');

var params = {
    'google' : {
        'key' : '487794086365-b7c974kegl3orplklrg8aq0072mnp60e.apps.googleusercontent.com',
        'secret' : 'W4ngmunotOKfK0oLBLeaxBJP',
        'callback' : 'http://moonrise.crudelis.kr/callback/google'
    }
}

function register_google(res, query, dbhandler) {
    /*
    var oauth2Client = new goauth2(params.google.key, params.google.secret, params.google.callback);
    var state_token = uuid.v4();
    var reqUrl = oauth2Client.generateAuthUrl({
        'access_type' : 'offline',
        'scope' : 'https://www.googleapis.com/auth/plus.me',
        'state' : state_token
    });
    */
    var state_token = uuid.v4();
    var queryobj = {
        'client_id' : params.google.key,
        'response_type' : 'code',
        'redirect_uri' : params.google.callback,
        'scope' : 'https://www.googleapis.com/auth/plus.me',
        'state' : state_token,
        'access_type' : 'offline'
    };
    var reqUrl = 'https://accounts.google.com/o/oauth2/auth?' + querystring.stringify(queryobj);
    console.info('reqUrl: ' + reqUrl);
    dbhandler.insert('state_tokens', {'ind':0,'token':state_token,'date':moment.utc().format('YYYY-MM-DD HH:mm:ss')});
    res.writeHead(303, {'location' : reqUrl});
    res.end();
}

function callback_google(res, query, dbhandler) {
    console.info('callback_google: ' + writer.write(query));
    dbhandler.selectWith('state_tokens', 'WHERE token = "' + query.state + '"', function(array) {
        if (typeof array === 'undefined' || array.length < 1) {
            res.writeHead(401, {'Content-Type':'text/html'});
            res.end('Invalid callback! Try again.');
        } else {
            dbhandler.remove('state_tokens', 'token = "' + query.state + '"');
            var postoption = {
                'hostname' : 'accounts.google.com',
                'path' : '/o/oauth2/token',
                'method' : 'POST',
                'headers' : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            };
            var post = https.request(postoption, function(response) {
               var data = '';
               response.on('data', function(chunk) {
                   data += chunk;
               });
               response.on('end', function() {
                   console.info('access_token and more : ' + writer.write(JSON.parse(data)));
                   
               });
            });
            post.on('error', function(err) {
                console.error('error on post access token getter to google');
                console.error(err);
            });
            post.write(querystring.stringify({
                'code' : query.code,
                'client_id' : params.google.key,
                'client_secret' : params.google.secret,
                'redirect_uri' : params.google.callback,
                'grant_type' : 'authorization_code'
            }));
            post.end();
        }
    });
    /*
    var oauth2Client = new goauth2(params.google.key, params.google.secret, params.google.callback);
    dbhandler.selectWith('state_tokens', 'WHERE token = "' + query.state + '"', function(array) {
        if (typeof array === 'undefined' || array.length < 1) {
            res.writeHead(401, {'Content-Type':'text/html'});
            res.end('Invalid callback! Try again.');
        } else {
            dbhandler.remove('state_tokens', 'token = "' + query.state + '"');
            oauth2Client.getToken(query.code, function(err, tokens) {
                console.info('tokens: ' + writer.write(tokens));
                dbhandler.insert('accounts', {'ind':0,'access_token':tokens['access_token'],'refresh_token':tokens['refresh_token']});
                var querys = {'token':tokens['access_token']};
                res.writeHead(303, {'location':'/account?' + querystring.stringify(querys)});
                res.end();
            });
        }
    });
    */
}

function account(res, query, dbhandler) {
    if ((typeof query === 'undefined') || (typeof query.token === 'undefined') || (query.token === '')) {
        res.writeHead(301, {'location':'/'});
        res.end();
    } else {
        dbhandler.selectWith('accounts', 'WHERE access_token = "' + query.token + '"', function(array) {
            if (typeof array === 'undefined' || array.length < 1) {
                res.writeHead(401, {'Content-Type':'text/html'});
                res.end('Invalid login! Try again');
            } else {
                var oauth2Client = new goauth2(params.google.key, params.google.secret, params.google.callback);
                oauth2Client.setCredentials({'access_token':array[0].access_token,'refresh_token':array[0].refresh_token});
                plus.people.get({'userId':'me','auth':oauth2Client}, function(err, profile) {
                    if (err) {
                        console.error('error while getting google account informations');
                        console.error(err);
                    } else {
                        res.writeHead(200, {'Content-Type':'text/html'});
                        res.end(writer.write(profile));
                    }
                })
            }
        })
    }
}

exports.register_google = register_google;
exports.callback_google = callback_google;
exports.account = account;