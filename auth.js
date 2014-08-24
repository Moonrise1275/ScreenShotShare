var uuid = require("node-uuid");
var moment = require("moment-timezone");
var querystring = require("querystring");

var writer = require("./JSONWriter");

var google = require("googleapis");
var goauth2 = google.auth.OAuth2;
var plus = google.plus('v1');

var params = {
    'google' : {
        'key' : '487794086365-b7c974kegl3orplklrg8aq0072mnp60e.apps.googleusercontent.com',
        'secret' : 'W4ngmunotOKfK0oLBLeaxBJP',
        'callback' : 'http://moonrise.crudelis.kr/callback/google'
    }
}

function register_google(res, query, dbhandler) {
    var oauth2Client = new goauth2(params.google.key, params.google.secret, params.google.callback);
    var state_token = uuid.v4();
    var reqUrl = oauth2Client.generateAuthUrl({
        'access_type' : 'offline',
        'scope' : 'https://www.googleapis.com/auth/plus.me',
        'state' : state_token
    });
    dbhandler.insert('state_tokens', {'ind':0,'token':state_token,'date':moment.utc().format('YYYY-MM-DD HH:mm:ss')});
    res.writeHead(303, {'location' : reqUrl});
    res.end();
}

function callback_google(res, query, dbhandler) {
    var oauth2Client = new goauth2(params.google.key, params.google.secret, params.google.callback);
    dbhandler.selectWith('state_tokens', 'WHERE token = "' + query.state + '"', function(array) {
        if (typeof array === 'undefined' || array.length < 1) {
            res.writeHead(401, {'Content-Type':'text/html'});
            res.end('Invalid callback! Try again.');
        } else {
            dbhandler.remove('state_tokens', 'token = "' + query.state + '"');
            oauth2Client.getToken(query.code, function(err, tokens) {
               dbhandler.insert('accounts', {'ind':0,'access_token':tokens['access_token'],'refresh_token':tokens['refresh_token']});
               var querys = {'token':tokens['access_token']};
               res.writeHead(303, {'location':'/account?' + querystring.stringify(querys)});
               res.end();
            });
        }
    });
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
                oauth2Client.setCredentials({'access_token':array['access_token'],'refresh_token':array['refresh_token']});
                plus.people.get({'userId':'me','auth':oauth2Client}, function(err, profile) {
                    res.writeHead(200, {'Content-Type':'text/html'});
                    res.end(writer.write(profile));
                })
            }
        })
    }
}

exports.register_google = register_google;
exports.callback_google = callback_google;
exports.account = account;