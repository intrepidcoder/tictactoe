$(document).ready(function() {
	var socket = io();
	var canMove = false, playAs = 'o', board = [];


	$('#reconnect, #move').prop({'disabled':true});
	console.log('Waiting for opponent.');

	socket.on('matched', function() {
		console.log('Matched with opponent.');
		$('#reconnect').prop({'disabled':true});
	});

	socket.on('opponent-disconnected', function() {
		console.log('Opponent disconnected.');
		$('#reconnect').prop({'disabled':false});
	});

	socket.on('start-game', function() {
		console.log('Your turn.');
		canMove = true;
		playAs = 'x';
	});

	socket.on('opponent-moved', function(index) {
		console.log('Your turn.', index);
		canMove = true;
		$('#tile' + index).removeClass('empty-tile').addClass(playAs == 'x' ? 'naught' : 'cross');
		board[index] = playAs == 'x' ? 'o' : 'x';
		checkGameOver();
	});

	$('#reconnect').click(function() {
		socket.emit('play-again');
		console.log('Waiting for opponent.');
		$('#reconnect').prop({'disabled':true});
	});

	// Wrap click event handler for tile in closure to store index
	var makeTileClickHandler = function(index) {
		return function(event) {
			if (canMove) {
				socket.emit('move', index);
				console.log('Waiting for opponent\'s move.', index);
				$(this).removeClass('empty-tile').addClass(playAs == 'o' ? 'naught' : 'cross');
				board[index] = playAs;
				canMove = false;
				checkGameOver();
			}
		};
	};

	var checkGameOver = function() {
		var positions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
		var filledCount = 0, winner = '';

		for (var i = 0; i < positions.length; i++) {
			if (typeof board[positions[i][0]] !== 'undefined' && board[positions[i][0]] === board[positions[i][1]] && board[positions[i][1]] === board[positions[i][2]]) {
				winner = board[positions[i][0]];
				break;
			}
		}

		if (winner) {
			// $gameOver = $('<div>').attr({'id': 'game-over'}).text(winner === playAs ? 'You won!' : 'You lost.');
			// $('#board').animate({'opacity': 0.5}); //.append($gameOver);
			console.log(winner === playAs ? 'You won!' : 'You lost.');
			canMove = false;
		} else {

			for (var i = 0; i < board.length; i++) {
				if (board[i]) filledCount++;
			}

			if (filledCount >= 9) {
				console.log('Tie');
				canMove = false;
			}
		}
	};

	// Add click events and ids to each tile.
	$('.tile').each(function(index) {
		$(this).on('click', makeTileClickHandler(index))
			.attr('id', 'tile' + index)
			.addClass('empty-tile');
	});
});
