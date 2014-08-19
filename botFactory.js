var irc = require("irc");
var router = require("./commandRouter");

var bots = [];

function createDatabases(dbhandler) {
	dbhandler.query('CREATE TABLE screenshots ( ind INT AUTO_INCREMENT PRIMARY KEY, channel TINYTEXT, username TINYTEXT, address TINYTEXT, message TEXT, date DATETIME );');
}

function onMessage(bot, dbhandler, config) {
    return function(from, to, text) {
        router.route(bot, text, from, to, dbhandler, config);
    };
}

function onInvite(bot) {
    return function(channel, from, message) {
        bot.join(channel);
    };
}

function onError(err) {
    console.error('error on IRC bot');
    console.error(err);
}

function start(config, dbhandler) {
	createDatabases(dbhandler);
    for (var num in config.irc.servers) {
		var server = config.irc.servers[num];
		var ircconfig = config.irc[server];
        bots[server] = new irc.Client(server, ircconfig.nick, ircconfig);
        bots[server].addListener('message', onMessage(bots[server], dbhandler, config));
        bots[server].addListener('invite', onInvite(bots[server]));
        bots[server].addListener('error', onError);
    }
}

exports.start = start;