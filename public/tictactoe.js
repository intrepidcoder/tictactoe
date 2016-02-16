$(document).ready(function() {
	var socket = io();
	var canMove = false, playAs = 'o', board = [];

	socket.on('matched', function() {
		addMessage('Opponent\'s turn (x)');
	});

	socket.on('opponent-disconnected', function() {
		addMessage('Opponent disconnected');
		$('#play-again').show();
	});

	socket.on('start-game', function() {
		playAs = 'x';
		addMessage('Your turn (x)');
		canMove = true;
	});

	socket.on('opponent-moved', function(index) {
		addMessage('Your turn (' + playAs + ')');
		canMove = true;
		$('#tile' + index).removeClass('empty-tile').addClass(playAs == 'x' ? 'naught' : 'cross');
		board[index] = playAs == 'x' ? 'o' : 'x';
		checkGameOver();
	});

	$('#play-again').click(function() {
		socket.emit('play-again');
		$('.tile').addClass('empty-tile').removeClass('naught cross three-in-a-row').css({'opacity': 1.0});
		$(this).hide();
		addMessage('Waiting for opponent');
		playAs = 'o';
		canMove = false;
		board = [];
	});

	// Wrap click event handler for tile in closure to store index
	var makeTileClickHandler = function(index) {
		return function(event) {
			if (canMove) {
				socket.emit('move', index);
				addMessage('Opponent\'s turn (' + (playAs === 'x' ? 'o' : 'x') + ')', index);
				$(this).removeClass('empty-tile').addClass(playAs == 'o' ? 'naught' : 'cross');
				board[index] = playAs;
				canMove = false;
				checkGameOver();
			}
		};
	};

	var checkGameOver = function() {
		var positions = [[0, 1, 2], [3, 4, 5], [6, 7, 8], [0, 3, 6], [1, 4, 7], [2, 5, 8], [0, 4, 8], [2, 4, 6]];
		var i, filledCount = 0, winner = '';

		for (i = 0; i < positions.length; i++) {
			if (typeof board[positions[i][0]] !== 'undefined' && board[positions[i][0]] === board[positions[i][1]] && board[positions[i][1]] === board[positions[i][2]]) {
				winner = board[positions[i][0]];
				$('#tile' + positions[i][0]).addClass('three-in-a-row');
				$('#tile' + positions[i][1]).addClass('three-in-a-row');
				$('#tile' + positions[i][2]).addClass('three-in-a-row');
				break;
			}
		}

		if (winner) {
			addMessage(winner === playAs ? 'You won!' : 'You lost');
			canMove = false;
			$('#play-again').show();
			$('.tile').filter(':not(.three-in-a-row)').animate({'opacity': 0.3}, 2000);
		} else {

			for (i = 0; i < board.length; i++) {
				if (board[i]) filledCount++;
			}

			if (filledCount >= 9) {
				addMessage('Tie');
				canMove = false;
				$('#play-again').show();
			}
		}
	};

	var addMessage = function(messageText) {
		$('#message').animate({'opacity': 0.0}, 'slow', function() {
			$(this).text(messageText).animate({'opacity': 1.0}, 'slow');
		});
	};

	addMessage('Waiting for opponent');

	// Add click events and ids to each tile.
	$('.tile').each(function(index) {
		$(this).on('click', makeTileClickHandler(index))
			.attr('id', 'tile' + index)
			.addClass('empty-tile');
	});
});
