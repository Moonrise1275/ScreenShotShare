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
	query('CREATE TABLE state_tokens ( ind INT AUTO_INCREMENT PRIMARY KEY, token CHAR(36) );');
	query('CREATE TABLE accounts ( ind INT AUTO_INCREMENT PRIMARY KEY, userid CHAR(36) NOT NULL, login_id TINYTEXT NOT NULL, refresh_token TINYTEXT NOT NULL, login_provider VARCHAR(20) NOT NULL );');
	query('CREATE TABLE nicknames ( ind INT AUTO_INCREMENT PRIMARY KEY, userid CHAR(36) NOT NULL, nick TINYTEXT NOT NULL );');
	query('CREATE TABLE ircnames ( ind INT AUTO_INCREMENT PRIMARY KEY, userid CHAR(36) NOT NULL, ircname TINYTEXT NOT NULL );');
	query('CREATE TABLE communities ( ind INT AUTO_INCREMENT PRIMARY KEY, commid CHAR(36) NOT NULL, name TINYTEXT, master CHAR(36) NOT NULL, ircserver TINYTEXT, channel TINYTEXT, gwatch TINYINT, gsay TINYINT, gmember TINYINT, gcomm TINYINT );');
	query('CREATE TABLE members ( ind INT AUTO_INCREMENT PRIMARY KEY, commid CHAR(36) NOT NULL, userid CHAR(36) NOT NULL, grade TINYINT NOT NULL );');
	query('CREATE TABLE ircchannels ( ind INT AUTO_INCREMENT PRIMARY KEY, server TINYTEXT NOT NULL, channel TINYTEXT NOT NULL );');
}

function query(msg) {
	//console.info('mysql sending query');
    connection.query(msg, function(err, result) {
		if (err) {
			if (err.errno == 1050);
			else {
				console.error('mysql error while sending query');
			console.error(err);
			}
		}
	});
}

function insert(table, object, callback) {
	//console.info('mysql sending insert query');
    connection.query('INSERT INTO ' + table + ' SET ?', object, function(err, result) {
		if (err) {
			console.error('mysql error while sending insert query');
			console.error(err);
		} else {
			if (typeof callback === 'function')
				callback(result);
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
    selectWith(table, ';', callback);
}

function remove(table, condition) {
	connection.query('DELETE FROM ' + table + ' WHERE ' + condition, function(err, result) {
	    if(err) {
	    	console.error('mysql error while sending delete query');
	    	console.error(err);
	    }
	});
}

function update(table, key, value, condition) {
	connection.query('UPDATE ' + table + ' SET ' + key + ' = ' + value + ' WHERE ' + condition, function(err, result) {
	    if(err) {
	    	console.error('mysql error while sending update query');
	    }
	});
}

exports.start = start;
exports.query = query;
exports.insert = insert;
exports.select = select;
exports.selectWith = selectWith;
exports.remove = remove;