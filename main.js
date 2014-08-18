var fs = require("fs");

var dbhandler = require("./dbhandler");
var server = require("./server");
var bot = require("./bot");

var config = {};

function start(config) {
    dbhandler.init(config.mysql);
	dbhandler.query('CREATE TABLE screenshotsv09 ( ind INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(20), address TEXT, message TEXT, date DATETIME );');
    server.start(config, dbhandler);
    bot.start(config, dbhandler);
}

fs.readFile('./config.json', 'utf8', function(err, data) {
    if (err) {
        console.error('error while reading config file');
        console.error(err);
        return;
    }
    config = JSON.parse(data);
    start(config);
});