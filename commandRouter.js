//var dateformat = require("dateformat");
var moment = require("moment");

var handle = [];
handle['images'] = images;

function route(bot, message, from, to, dbhandler, config) {
    screenshotshare(bot, message, from, to, dbhandler, config);
    
    var flag = message.indexOf('&');
    if (flag > -1) {
        message = message.substring(flag);
        var array = message.split(' ');
        var name = array[0].substring(1).toLowerCase();
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
        dbhandler.insert('screenshots', {'ind': 0, 'address': link, 'channel': to, 'username': from, 'message': text, 'date': time});
        bot.say(to, 'Link saved! Try type "&images"');
    }
}

function images(bot, name, array, from, to, dbhandler, config) {
    if(array.length > 1) return;
    bot.say(to, 'Images address : ' + config.irc.commands.site + '/screenshots?channel=' + to.substring(1, to.length) + '&lang=&username=&page=1');
}

exports.route = route;