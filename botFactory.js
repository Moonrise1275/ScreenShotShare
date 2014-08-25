var fs = require("fs");
var irc = require("irc");
var router = require("./commandRouter");
var writer = require("./JSONWriter");

var bots = [];
var ircbotconfig = JSON.parse(fs.readFileSync('ircbots.json'));

function onMessage(bot, dbhandler, config, server, webserver) {
    return function(from, to, text, message) {
        router.route(bot, text, message, to, dbhandler, config, server, webserver, false);
    };
}

function onPM(bot, dbhandler, config, server, webserver) {
	return function(nick, text, message) {
		router.route(bot, text, message, 'thisbot', dbhandler, config, server, webserver, true);
	};
}

function onInvite(bot, server, dbhandler) {
    return function(channel, from, message) {
		for (var chan in bot.chans) {
			if (chan == channel) return;
		}
		dbhandler.insert('ircchannels', {'ind':0,'server':server,'channel':channel});
        bot.join(channel);
    };
}

function onKick(bot, server, botnick, dbhandler) {
	return function(channel, nick, by, reason, message) {
		if (nick != botnick) return;
		dbhandler.remove('ircchannels', 'server = "' + server + '" AND channel = "' + channel + '";');
	}
}

function onQuit(bot) {
	return function(nick, reason, channels, message) {
		console.info('IRC bot is reconnecting to server - ' + message.server);
		bot.connect();
	}
}

function onError(err) {
    console.error('error on IRC bot');
    console.error(err);
}

function joinChannels(bot) {
	return function(array) {
		for (var i in array) {
			bot.join(array[i].channel);
		}
	}
}

function start(config, dbhandler, webserver) {
    for (var server in ircbotconfig) {
		var ircconfig = ircbotconfig[server];
        bots[server] = new irc.Client(server, ircconfig.nick, ircconfig);
        bots[server].addListener('message', onMessage(bots[server], dbhandler, config, server, webserver));
        bots[server].addListener('pm', onPM(bots[server], dbhandler, config, server, webserver));
        bots[server].addListener('invite', onInvite(bots[server], server, dbhandler));
		bots[server].addListener('kick', onKick(bots[server], server, ircconfig.nick, dbhandler));
		//bots[server].addListener('quit', onQuit(bots[server]));
        bots[server].addListener('error', onError);
        
        dbhandler.selectWith('ircchannels', 'server = "' + server + '";', joinChannels(bots[server]));
    }
    
    for (var ev in events) {
    	if (typeof events[ev] === 'function') {
    		webserver.addListener(ev, events[ev]);
    	}
    }
}

var events = [];



exports.start = start;