var fs = require("fs");

var webServer = require("./webServer");
var botFactory = require("./botFactory");
var dbhandler = require("./dbhandler");

function start(config) {
    dbhandler.start(config);
    webServer.start(config, dbhandler);
    botFactory.start(config, dbhandler);
}

var configfile = fs.readFileSync('config.json', 'utf8');
var config = JSON.parse(configfile);
start(config);