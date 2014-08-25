//var dateformat = require("dateformat");
var moment = require("moment");
var community = require("community");

var handle = [];
handle['images'] = images;
handle['join'] = join;
handle['part'] = part;
handle['register'] = register;

function route(bot, message, from, to, dbhandler, config, server, webserver, isPM) {
    screenshotshare(bot, message, from, to, dbhandler, config);
    
    var flag = message.indexOf('&');
    if (flag > -1) {
        message = message.substring(flag);
        var array = message.split(' ');
        var name = array[0].substring(1).toLowerCase();
        if (typeof handle[name] === 'function') {
            handle[name](bot, array, from, to, dbhandler, config, server, webserver, isPM);
        }
    }
}

function screenshotshare(bot, text, from, to, dbhandler, config) {
    if ((text.indexOf('http') > -1) && ((text.indexOf('.jpg') > -1) || (text.indexOf('.png') > -1))) {
        var end = (text.indexOf('.jpg') != -1) ? text.indexOf('.jpg') : text.indexOf('.png');
        var link = text.substring(text.indexOf('http'), end + 4);
        var day = moment.utc();
        //var time = dateformat(day, 'yyyy-mm-dd hh:MM:ss');
        var time = day.format('YYYY-MM-DD HH:mm:ss');
        dbhandler.insert('screenshots', {'ind': 0, 'address': link, 'channel': to, 'username': from, 'message': text, 'date': time});
        bot.say(to, 'Link saved! Try type "&images"');
    }
}

function images(bot, array, from, to, dbhandler, config) {
    if(array.length > 1) return;
    bot.say(to, 'Images address : ' + config.irc.commands.site + '/screenshots?channel=' + to.substring(1, to.length) + '&lang=&username=&page=1');
}

function join(bot, array, from, to, dbhandler, config, server, webserver, isPM) {
    if (isPM) {
        if (array.length < 1) {
            bot.say(from.nick, 'Insert channel!');
        } else {
            var channel = array[0];
            if (channel.indexOf('#') !== 0) channel = '#' + channel;
            for (var chan in bot.chans) {
    			if (chan == channel) return;
    		}
    		dbhandler.insert('ircchannels', {'ind':0,'server':server,'channel':channel});
            bot.join(channel);
        }
    }
}

function part(bot, array, from, to, dbhandler, config, server, webserver, isPM) {
    if (isPM) {
        if (array.length < 1) {
            bot.say(from.nick, 'Insert channel!');
        } else {
            var channel = array[0];
            if (channel.indexOf('#') !== 0) channel = '#' + channel;
            dbhandler.remove('ircchannels', 'server = "' + server + '" AND channel = "' + channel + '";');
            bot.part(channel, 'BOOOOOOM');
        }
    }
}

function register(bot, array, from, to, dbhandler, config, server, webserver, isPM) {
    if (isPM) {
        if (array.length >= 1) {
            var userid = array[0];
            var useridelems = userid.split('-');
            if (userid.length != 36 || useridelems.length != 5 || useridelems[0].length != 8 || useridelems[1].length != 4 || useridelems[2].length != 4 || useridelems[3].length != 4 || useridelems[4].length != 12) {
                bot.say(from.nick, 'Invalid uuid! Go moonrise.crudelis.kr and login it. You can see your uuid in there');
            } else {
                dbhandler.insert('ircnames', {'ind':0,'userid':userid,'ircname':from.name});
                bot.say(from.nick, 'Successfully registered your irc name to uuid ' + userid);
            }
        } else {
            bot.say(from.nick, 'Insert uuid! Go moonrise.crudelis.kr and login it. You can see your uuid in there')
        }
    } else {
        bot.say(from.nick, 'Do not type your uuid in the public place! Try use private message to me');
    }
}

exports.route = route;