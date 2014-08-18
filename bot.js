var irc = require("irc");
var dateformat = require("dateformat");

function start(config, dbhandler) {
    try {
        var bot = new irc.Client(config.bot.server, config.bot.nick, config.bot);
    } catch(err) {
        console.error('error while connecting irc');
        console.error(err);
    }
    bot.addListener('message', function(from, to, text) {
		if (text.toLowerCase().indexOf('&site') > -1 ) {
			bot.say(to, 'Site : ' + config.server.address)
		}
        
        if ((text.indexOf('http:') > -1) && ((text.indexOf('.jpg') > -1) || (text.indexOf('.png') > -1))) {
            var end = (text.indexOf('.jpg') != -1) ? text.indexOf('.jpg') : text.indexOf('.png');
            var link = text.substring(text.indexOf('http://'), end + 4);
            var day = new Date();
            var time = dateformat(day, 'yyyy-mm-dd hh:MM:ss');
            dbhandler.insert('screenshots', {ind: 0, address: link, username: from, message: text, date: time});
            bot.say(to, 'Link saved! - ' + link);
            bot.say(to, 'Site : ' + config.server.address)
        }
    });
    bot.addListener('error', function(err) {
        console.error('error while irc');
        console.error(err);
    })
}

exports.start = start;