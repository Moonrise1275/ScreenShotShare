var fs = require("fs");
var irc = require("irc");
var router = require("./commandRouter");
var writer = require("./JSONWriter");

var bots = [];
var ircbotconfig = JSON.parse(fs.readFileSync('ircbots.json'));

function onMessage(bot, dbhandler, config) {
    return function(from, to, text, message) {
        router.route(bot, text, from, to, dbhandler, config);
    };
}

function onInvite(bot, server) {
    return function(channel, from, message) {
		ircbotconfig[server].channels.push(channel);
		writer.write('ircbots.json', ircbotconfig);
        bot.join(channel);
    };
}

function onKick(bot, server, botnick) {
	return function(channel, nick, by, reason, message) {
		if (nick != botnick) return;
		for(var i in ircbotconfig[server].channels) {
			if (ircbotconfig[server].channels[i] == channel) {
				delete ircbotconfig[server].channels[i];
				writer.write('ircbots.json', ircbotconfig);
				break;
			}
		}
	}
}

function onQuit(bot) {
	return function(nick, reason, channels, message) {
		console.info('IRC bot is reconnecting to server ' + message.server);
		bot.connect();
	}
}

function onError(err) {
    console.error('error on IRC bot');
    console.error(err);
}

function start(config, dbhandler) {
    for (var server in ircbotconfig) {
		var ircconfig = ircbotconfig[server];
        bots[server] = new irc.Client(server, ircconfig.nick, ircconfig);
        bots[server].addListener('message', onMessage(bots[server], dbhandler, config));
        bots[server].addListener('invite', onInvite(bots[server], server));
		bots[server].addListener('kick', onKick(bots[server], server, ircconfig.nick));
		//bots[server].addListener('quit', onQuit(bots[server]));
        bots[server].addListener('error', onError);
    }
}

exports.start = start;