var uuid = require("node-uuid");
var moment = require("moment-timezone");

var writer = require("./JSONWriter");

var google = require("googleapis");
var goauth2 = google.auth.OAuth2;
var plus = google.plus('v1');

var params = {
    'google' : {
        'key' : '487794086365-74m62rib658iutgmo49aqvmnrn8e3ch8.apps.googleusercontent.com',
        'secret' : 'JF00nYI5lHLCUmllBJFoQGwT',
        'callback' : 'http://moonrise.crudels.kr/callback/google'
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
            dbhandler.remove('state_tokens', 'WHERE token = "' + query.state + '"');
            oauth2Client.getToken(query.code, function(err, tokens) {
               console.info('tokens : ' + writer.write(tokens));
            });
        }
    });
}

function account(res, query, dbhandler) {
    
}

exports.register_google = register_google;
exports.callback_google = callback_google;
exports.account = account;