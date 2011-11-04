/**
 * Module dependencies.
 */
var express = require('express')
	, sio = require('socket.io')
	, backbone = require('backbone')
	, mf = require('./modelfactory.js');


/**
 * User Models.
 */
var userModel = require('./models/user.js');

//--These are the user models being sent to the client
var users = [new userModel.User({"email":"jessefulton@github.com"})
			, new userModel.User({"email":"somebodyelse@github.com"})
			, new userModel.User({"email":"invalid_email_address"})];


/**
 * Create global objects.
 */
var app = express.createServer();
var models = ClientModelFactory.makeAll();

	
/**
 * App config & routes.
 */
app.configure(function () {
	app.use(express.static(__dirname + '/public'));
	app.set('views', __dirname);
	app.set('view engine', 'jade');
});


app.get('/', function (req, res) {
	res.render('index', { layout: false });
});
app.get('/model/:model', function (req, res) {
	res.writeHead(200, {'Content-Type': 'text/plain'});
	res.end(ClientModelFactory.models[req.params.model]);
});


/**
 * Start it.
 */
app.listen(3000, function () {
	var addr = app.address();
	console.log('	 app listening on http://' + addr.address + ':' + addr.port);
});


/**
 * Socket.IO
 */
var io = sio.listen(app);

io.sockets.on('connection', function (socket) {
	console.log('emitting models');
	users.forEach(function(element, idx, arr) {
		console.log("Found user: " + element.get('email') + " - validate? " + element.validate());
	});
	socket.emit('clientModels', users);
});
