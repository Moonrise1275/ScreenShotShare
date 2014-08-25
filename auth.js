var uuid = require("node-uuid");
var moment = require("moment-timezone");
var querystring = require("querystring");
var https = require("https");

var writer = require("./JSONWriter");

var params = {
    'google' : {
        'key' : '487794086365-b7c974kegl3orplklrg8aq0072mnp60e.apps.googleusercontent.com',
        'secret' : 'W4ngmunotOKfK0oLBLeaxBJP',
        'callback' : 'http://moonrise.crudelis.kr/callback/google'
    }
}

function register_google(res, query, dbhandler) {
    var state_token = uuid.v4();
    var getparams = {
        'client_id' : params.google.key,
        'response_type' : 'code',
        'scope' : 'https://www.googleapis.com/auth/plus.me',
        'redirect_uri' : params.google.callback,
        'state' : state_token
    }
    var loginuri = 'https://accounts.google.com/o/oauth2/auth?' + querystring.stringify(getparams);
    console.info('Saving state token - ' + state_token);
    dbhandler.insert('state_tokens', {'ind':0,'token':state_token}, function() {
        res.writeHead(200, {'Content-Type':'text/html'});
        res.end('<html><body><br><a href="' + loginuri + '">Click me!</a></body></html>');
    });
}

function force_register_google(res, query, dbhandler) {
    var state_token = uuid.v4();
    var getparams = {
        'client_id' : params.google.key,
        'response_type' : 'code',
        'scope' : 'https://www.googleapis.com/auth/plus.me',
        'redirect_uri' : params.google.callback,
        'state' : state_token,
        'access_type' : 'offline',
        'approval_prompt' : 'force'
    };
    var loginuri = 'https://accounts.google.com/o/oauth2/auth?' + querystring.stringify(getparams);
    console.info('Saving state token(force) - ' + state_token);
    dbhandler.insert('state_tokens', {'ind':0,'token':state_token});
    res.writeHead(200, {'Content-Type':'text/html'});
    res.end('<html><body><br><a href="' + loginuri + '">Click me!</a></body></html>');
}

function callback_google(res, query, dbhandler) {
    dbhandler.selectWith('state_tokens', 'WHERE token = "' + query.state + '";', function(array) {
        if (typeof array === 'undefined' || array.length < 1) {
            res.writeHead(401, {'Content-Type':'text/html'});
            res.write('Invalid callback! Try again.');
            res.end('<html><body><br><a href="/register/google">Click me!</a></body></html>');
        } else {
            var postoptions = {
                'host' : 'accounts.google.com',
                'path' : '/o/oauth2/token',
                'method' : 'POST',
                'headers' : {
                    'Content-Type' : 'application/x-www-form-urlencoded'
                }
            };
            var postreq = https.request(postoptions, function(response) {
                response.setEncoding('utf8');
                var data = '';
                response.on('data', function(chunk) {
                    data += chunk;
                });
                response.on('end', function() {
                    var tokens = JSON.parse(data);
                    get_properties_google(tokens.access_token, function(profile) {
                       dbhandler.selectWith('accounts', 'WHERE login_id = "' + profile.id + '"', function(array) {
                           if (typeof array === 'undefined' || array.length < 1) {
                               if (typeof tokens['refresh_token'] === 'undefined') {
                                   res.writeHead(401, {'Content-Type':'text/html'});
                                   res.write('Invalid login! Try again.');
                                   res.end('<html><body><br><a href="/register/google/force">Click me!</a></body></html>');
                               } else {
                                   var userid = uuid.v4();
                                   dbhandler.insert('accounts', {'ind':0,'userid':userid,'login_id':profile.id,'refresh_token':tokens.refresh_token});
                                   var queryparams = {'userid':userid};
                                   res.writeHead(301, {'location':'/account?' + querystring.stringify(queryparams)});
                                   res.end();
                               }
                           } else {
                               var s_tokens = array[0];
                               var querypars = {'userid':s_tokens.userid};
                               res.writeHead(301, {'location':'/account?' + querystring.stringify(querypars)});
                               res.end();
                           }
                       });
                    });
                });
            });
            postreq.on('error', function(err) {
                console.error('error while requesting access token to google');
                console.error(err);
            });
            postreq.write(querystring.stringify({
                'code' : query.code,
                'client_id' : params.google.key,
                'client_secret' : params.google.secret,
                'redirect_uri' : params.google.callback,
                'grant_type' : 'authorization_code'
            }));
            postreq.end();
        }
    });
}

function refresh_google(refresh_token, callback) {
    var options = {
        'host' : 'accounts.google.com',
        'path' : '/o/oauth2/token',
        'method' : 'POST',
        'encoding' : 'utf8',
        'headers' : {
            'Content-Type' : 'application/x-www-form-urlencoded'
        }
    };
    var request = {
        'client_id' : params.google.key,
        'client_secret' : params.google.secret,
        'refresh_token' : refresh_token,
        'grant_type' : 'refresh_token'
    };
    var req = https.request(options, function(response) {
        var data = '';
        response.on('data', function(chunk) {
            data += chunk;
        });
        response.on('end', function() {
           callback(JSON.parse(data).access_token);
        });
    });
    req.write(querystring.stringify(request));
    req.on('error', function(err) {
        console.error('error while requesting new access token to google');
        console.error(err);
    });
    req.end();
}

function get_properties_google(access_token, callback) {
    var getoptions = {
   'method' : 'GET',
   'encoding' : 'utf8',
   'host' : 'www.googleapis.com',
   'path' : '/plus/v1/people/me?' + querystring.stringify({
            'access_token' : access_token
        })
    };
    https.request(getoptions, function(response) {
    var data = '';
   response.on('data', function(chunk) {
       data += chunk;
   });
   response.on('end', function() {
       var profile = JSON.parse(data);
       callback(profile);
   });
   }).end();
}

function account(res, query, dbhandler) {
    if (typeof query === 'undefined' || typeof query.userid === 'undefined' || query.userid === '') {
        res.writeHead(301, {'location':'/'});
        res.end();
    } else {
       var acnt = {};
       dbhandler.selectWith('accounts', 'WHERE userid = "' + query.userid + '";', function(array) {
           if (typeof array === 'undefined' || array.length < 1) {
                res.writeHead(401, {'Content-Type':'text/html'});
                res.end('You\'re not a member of this site!');
           } else {
                acnt = array[0];
                refresh_google(acnt.refresh_token, function(actoken) {
                    get_properties_google(actoken, function(profile) {
                       res.writeHead(200, {'Content-Type':'text/html'});
                       res.write('<html><body>');
                       res.write('Real name : ' + profile.displayName + '<br>');
                       res.write('Nickname : ' + profile.nickname + '<br><pre>');
                       res.write(writer.write(profile));
                       res.write('</pre></body></html>');
                       res.end();
                   });
                });
           }
       });
    }
}

exports.register_google = register_google;
exports.force_register_google = force_register_google;
exports.callback_google = callback_google;
exports.account = account;