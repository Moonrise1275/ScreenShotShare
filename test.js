var fs = require('fs');

var configfile = fs.readFileSync('config.json', 'utf8');
var config = JSON.parse(configfile);
start(config);

function start(config) {
	console.info(config.irc.commands.site);
}
