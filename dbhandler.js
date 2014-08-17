var mysql = require('mysql');
var connection;

function init(config) {
	console.info('mysql initializing');
    connection = mysql.createConnection(config);
	connection.connect(function(err) {
		if (err) {
			console.error('mysql connection error');
			console.error(err);
		}
	});
}

function query(msg) {
	console.info('mysql sending query');
    connection.query(msg, function(err, result) {
		if (err) {
			console.error('mysql error while sending query');
			console.error(err);
		}
	});
}

function insert(table, object) {
	console.info('mysql sending insert query');
    connection.query('INSERT INTO ' + table + ' SET ?', object, function(err, result) {
		if (err) {
			console.error('mysql error while sending insert query');
			console.error(err);
		}
	});
}

function selectWith(table, postfix, callback) {
	console.info('mysql sending select query');
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

exports.init = init;
exports.query = query;
exports.insert = insert;
exports.select = select;
exports.selectWith = selectWith;
