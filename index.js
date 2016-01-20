var express = require('express');
var app = express();
var http = require('http').Server(app);
var io = require('socket.io')(http);

app.get('/', function(request, response) {
	response.sendFile(__dirname + '/public/index.html');
});

app.use(express.static('public'));

var unpairedSocket, needsPair = false;
var gameIndex = 0;
var games = {};

io.on('connection', function(socket) {
	addPlayer(socket);

	socket.on('disconnect', function() {
		if (socket.gameId) {
			io.to(socket.gameId).emit('opponent-disconnected');
			delete games[socket.gameId];
		}

		if (socket === unpairedSocket) {
			needsPair = false;
		}
	});

	socket.on('move', function(index) {
		var game = games[socket.gameId];
		index = parseInt(index, 10);

		if (typeof index === 'number' && 0 <= index && index < 10 && game.players[game.turn].socket.id === socket.id && !game.filled[index]) {
			game.turn++;
			game.turn %= 2;
			game.filled[index] = true;

			io.to(game.players[game.turn].socket.id).emit('opponent-moved', index);
		}
	});

	socket.on('play-again', function() {
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


		games[gameId] = {'players':[{'socket': unpairedSocket, 'id': unpairedSocket.id}, {'socket': socket, 'id': socket.id}], 'turn': 0, 'filled': []};
		io.to(socket.gameId).emit('matched');
		io.to(unpairedSocket.id).emit('start-game');
	} else {
		socket.paired = false;
		unpairedSocket = socket;
		needsPair = true;
	}
}

http.listen(3000, function() {
	console.log('Listening on *:3000');
});
