var fs = require("fs");

function write(file, object, callback) {
	var text = work(object, 0);
	fs.writeFile(file, text, 'utf8', callback);
}

function work(object, dep) {
	var text = '';
	if (typeof object[0] === 'undefined') {
		text += line(dep, '{');
		for (var key in object) {
			if (typeof object[key] === 'object') {
				text += line(dep + 1, '"' + key + '" :');
				text += work(object[key], dep + 1);
			} else if (typeof object[key] === 'string') {
				text += line(dep + 1, '"' + key + '" : "' + object[key] + '",');
			} else {
				text += line(dep + 1, '"' + key + '" : ' + object[key] + ',');
			}
		}
		text = text.substring(0, text.length -2);
		text += '\n';
		text += line(dep, '},');
		if (dep == 0) {
			text = text.substring(0, text.length -2);
			text += '\n';
		}
	} else {
		text += line(dep, '[');
		for (var key in object) {
			if (typeof object[key] === 'object') {
				text += work(object[key], dep + 1);
			} else if (typeof object[key] === 'string') {
				text += line(dep + 1, '"' + object[key] + '",');
			} else {
				text += line(dep + 1, object[key] + ',');
			}
		}
		text = text.substring(0, text.length -2);
		text += '\n';
		text += line(dep, '],');
		if (dep == 0) {
			text = text.substring(0, text.length -2);
			text += '\n';
		}
	}
	return text;
}

function line(dep, append) {
	var text = '';
	var bl = '     ';
	for(var i=0;i<dep;i++) {
		text += bl;
	}
	text += append + '\n';
	return text;
}

exports.write = write;