var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/index.html');
});

var unpairedSocket, needsPair = false;
var gameIndex = 0;

io.on('connection', function(socket) {
	console.log('user connected');

	if (needsPair) {
		socket.paired = true;
		unpairedSocket.paired = true;
		socket.gameRoom = 'game' + gameIndex;
		unpairedSocket.gameRoom = 'game' + gameIndex;
		socket.join('game' + gameIndex);
		unpairedSocket.join('game' + gameIndex);
		gameIndex++;
		needsPair = false;

		io.to(socket.gameRoom).emit('matched');
	} else {
		socket.paired = false;
		unpairedSocket = socket;
		needsPair = true;
	}

	socket.on('disconnect', function() {
		io.to(socket.gameRoom).emit('opponent-disconnected');
		console.log('user disconnected');
		if (socket === unpairedSocket) {
			needsPair = false;
		}
	});

	socket.on('chat message', function(msg) {
		console.log('message: ' + msg);
	});
});

http.listen(3000, function() {
	console.log('Listening on *:3000');
});
