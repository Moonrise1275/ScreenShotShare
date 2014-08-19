//var dateformat = require("dateformat");
var moment = require("moment");

var handle = [];
handle['site'] = site;

function route(bot, message, from, to, dbhandler, config) {
    screenshotshare(bot, message, from, to, dbhandler, config);
    
    var flag = message.indexOf('&');
    if (flag > -1) {
        message = message.substring(flag);
        var array = message.split(' ');
        var name = array[0].substring(1);
        if (typeof handle[name] === 'function') {
            handle[name](bot, name, array, from, to, dbhandler, config);
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
        dbhandler.insert('screenshots', {ind: 0, address: link, channel: to, username: from, message: text, date: time});
        bot.say(to, 'Link saved!');
    }
}

function site(bot, name, array, from, to, dbhandler, config) {
    bot.say(to, 'Site address : ' + config.irc.commands.site + '/screenshots?channel=' + to + '&username=&page=1');
}

exports.route = route;