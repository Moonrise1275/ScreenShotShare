var writer = require('./JSONWriter');
var fs = require('fs');

writer.write(JSON.parse(fs.readFileSync('request.json')));