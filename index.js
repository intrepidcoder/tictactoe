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
		if (socket.paired) {
			io.to(socket.gameId).emit('opponent-disconnected');
			games[socket.gameId].players[0].socket.paired = false;
			games[socket.gameId].players[1].socket.paired = false;
			delete games[socket.gameId];
			delete socket.gameId;
		}

		if (socket === unpairedSocket) {
			needsPair = false;
			socket.paired = false;
		}
	});

	socket.on('move', function(index) {
		var game = games[socket.gameId];
		index = parseInt(index, 10);

		if (socket.paired && typeof index === 'number' && 0 <= index && index < 10 && game.players[game.turn].socket.id === socket.id && typeof game.filled[index] !== 'number') {
			game.filled[index] = game.turn;
			game.turn++;
			game.turn %= 2;

			io.to(game.players[game.turn].socket.id).emit('opponent-moved', index);

			if (isFinished(game.filled)) {
				game.players[0].socket.paired = false;
				game.players[1].socket.paired = false;
				delete games[socket.gameId];
				delete game.players[0].socket.gameId;
				delete game.players[1].socket.gameId;
			}
		}
	});

	socket.on('play-again', function() {
		if (!socket.paired) {
			addPlayer(socket);
		}
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
};

var isFinished = function(filled) {
	var positions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
	var filledCount = 0;

	for (var i = 0; i < positions.length; i++) {
		if (typeof filled[positions[i][0]] === 'number' && filled[positions[i][0]] === filled[positions[i][1]] && filled[positions[i][1]] === filled[positions[i][2]]) {
			return true;
		}
	}

	for (var i = 0; i < filled.length; i++) {
		if (typeof filled[i] === 'number') filledCount++;
	}

	return filledCount >= 9;
};

http.listen(3000, function() {
	console.log('Listening on *:3000');
});
