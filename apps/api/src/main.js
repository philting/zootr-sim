require('dotenv').config();
/**
 * Module dependencies.
 */

var path = require('path');
var fs = require('fs');
var app = require('./app');
var debug = require('debug')('scatter-live:server');
var http = require('http');
var https = require('https');
var sass = require('node-sass');

var credentials;

if (process.env.NODE_ENV == 'production') {
	const privateKey = fs.readFileSync('/etc/letsencrypt/live/scatter.live/privkey.pem', 'utf8');
	const certificate = fs.readFileSync('/etc/letsencrypt/live/scatter.live/cert.pem', 'utf8');
	const ca = fs.readFileSync('/etc/letsencrypt/live/scatter.live/chain.pem', 'utf8');

	credentials = {
		key: privateKey,
		cert: certificate,
		ca: ca
	};
}

try {
	fs.mkdirSync("public/stylesheets");
}
catch (error) {
	if (!error.code == "EEXIST") {
		throw error;
	}
}

/**
 * Get port from environment and store in Express.
 */

var port = normalizePort(process.env.PORT || '3000');
app.set('port', port);

/**
 * Create HTTP server.
 */

var server;

if (process.env.NODE_ENV == 'production')
{
	server = http.createServer(function(req, res) {
		res.writeHead(301, { "Location": "https://" + req.headers['host'] + req.url });
		res.end();
	});
	var httpsServer = https.createServer(credentials, app);
	httpsServer.listen(443);
	console.log("listening on port 443");
}

else {
	server = http.createServer(app);
}

/**
 * Listen on provided port, on all network interfaces.
 */

server.listen(port);
console.log(`listening on port ${port}`);
//server.on('error', onError);
//server.on('listening', onListening);

/**
 * Normalize a port into a number, string, or false.
 */

function normalizePort(val) {
	var port = parseInt(val, 10);

	if (isNaN(port)) {
		// named pipe
		return val;
	}

	if (port >= 0) {
		// port number
		return port;
	}

	return false;
}

/**
 * Event listener for HTTP server "error" event.
 */

function onError(error) {
	if (error.syscall !== 'listen') {
		throw error;
	}

	var bind = typeof port === 'string'
		? 'Pipe ' + port
		: 'Port ' + port;

	// handle specific listen errors with friendly messages
	switch (error.code) {
		case 'EACCES':
			console.error(bind + ' requires elevated privileges');
			process.exit(1);
			break;
		case 'EADDRINUSE':
			console.error(bind + ' is already in use');
			process.exit(1);
			break;
		default:
			throw error;
	}
}

/**
 * Event listener for HTTP server "listening" event.
 */

function onListening() {
	var addr = server.address();
	var bind = typeof addr === 'string'
		? 'pipe ' + addr
		: 'port ' + addr.port;
	debug('Listening on ' + bind);
}
