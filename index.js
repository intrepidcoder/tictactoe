var app = require('express')();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/public/index.html');
});

app.get('/tictactoe.js', function(request, response) {
	response.sendFile(__dirname + '/public/tictactoe.js');
});

var unpairedSocket, needsPair = false;
var gameIndex = 0;
var games = {};

io.on('connection', function(socket) {
	console.log('user connected');
	addPlayer(socket);

	socket.on('disconnect', function() {
		if (socket.gameId) {
			io.to(socket.gameId).emit('opponent-disconnected');
			delete games[socket.gameId];
		}

		console.log('user disconnected');
		if (socket === unpairedSocket) {
			needsPair = false;
		}
	});

	socket.on('move', function() {
		var game = games[socket.gameId];
		game.turn++;
		game.turn %= 2;

		io.to(game.players[game.turn].socket.id).emit('start-turn');
	});

	socket.on('play-again', function() {
		console.log('user reconnected');
		addPlayer(socket);
	});
});

var addPlayer = function(socket) {
	if (needsPair && socket !== unpairedSocket) {
		var gameId = 'game' + gameIndex;
		gameIndex++;

		socket.paired = true;
		unpairedSocket.paired = true;
		socket.gameId = gameId;
		unpairedSocket.gameId = gameId;
		socket.join(gameId);
		unpairedSocket.join(gameId);
		needsPair = false;


		games[gameId] = {'players':[{'socket': unpairedSocket}, {'socket': socket}], 'turn': 0};
		io.to(socket.gameId).emit('matched');
		io.to(unpairedSocket.id).emit('start-turn');
	} else {
		socket.paired = false;
		unpairedSocket = socket;
		needsPair = true;
	}
}

http.listen(3000, function() {
	console.log('Listening on *:3000');
});
