var writer = require('./JSONWriter');
var fs = require('fs');

writer.write('ircbots.json', JSON.parse(fs.readFileSync('ircbots.json')));