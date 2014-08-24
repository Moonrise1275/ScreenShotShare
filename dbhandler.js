var mysql = require("mysql");
var connection;

function start(config) {
    //console.info('mysql initializing');
    connection = mysql.createConnection(config.mysql);
	connection.connect(function(err) {
		if (err) {
			console.error('mysql connection error');
			console.error(err);
		}
	});
	createDatabases();
}

function createDatabases() {
	query('DROP TABLE state_tokens');
	query('CREATE TABLE screenshots ( ind INT AUTO_INCREMENT PRIMARY KEY, channel TINYTEXT, username TINYTEXT, address TINYTEXT, message TEXT, date DATETIME );');
	query('CREATE TABLE screenshotsv09 ( ind INT AUTO_INCREMENT PRIMARY KEY, username VARCHAR(20), address TEXT, message TEXT, date DATETIME );');
	query('CREATE TABLE webrequests ( ind INT AUTO_INCREMENT PRIMARY KEY, path TINYTEXT, query TINYTEXT, ip TINYTEXT, date DATETIME );');
	query('CREATE TABLE state_tokens ( ind INT AUTO_INCREMENT PRIMARY KEY, token CHAR(36), date DATETIME );');
	query('CREATE TABLE accounts ( ind INT AUTO_INCREMENT PRIMARY KEY, access_token TINYTEXT NOT NULL, refresh_token TINYTEXT );');
	query('CREATE TABLE nicknames ( ind INT AUTO_INCREMENT PRIMARY KEY, access_token TINYTEXT NOT NULL, nick TINYTEXT NOT NULL );');
}

function query(msg) {
	//console.info('mysql sending query');
    connection.query(msg, function(err, result) {
		if (err) {
			if (err.errno == 1050) console.error(err['Error']);
			else {
				console.error('mysql error while sending query');
			console.error(err);
			}
		}
	});
}

function insert(table, object) {
	//console.info('mysql sending insert query');
    connection.query('INSERT INTO ' + table + ' SET ?', object, function(err, result) {
		if (err) {
			console.error('mysql error while sending insert query');
			console.error(err);
		}
	});
}

function selectWith(table, postfix, callback) {
	//console.info('mysql sending select query');
    connection.query('SELECT * FROM ' + table + ' ' + postfix, function(err, result) {
		if (err) {
			console.error('mysql error while sending select query');
			console.error(err);
		}
		callback(result);
	});
}

function select(table, callback) {
    selectWith(table, '', callback);
}

function remove(table, condition) {
	connection.query('DELETE FROM ' + table + ' WHERE ' + condition, function(err, result) {
	    if(err) {
	    	console.error('mysql error while sending delete query');
	    	console.error(err);
	    }
	});
}

exports.start = start;
exports.query = query;
exports.insert = insert;
exports.select = select;
exports.selectWith = selectWith;
exports.remove = remove;