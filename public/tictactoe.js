$(document).ready(function() {
	var socket = io();
	var canMove = false, playAs = 'o', board = [];

	socket.on('matched', function() {
		addMessage('Opponent\'s turn (x)');
	});

	socket.on('pin', function(pin) {
		$('#player-pin').text('Your PIN is ' + pin + '. Enter your opponent\'s PIN to play.');
	});

	socket.on('opponent-disconnected', function() {
		addMessage('Opponent disconnected');
		$('#play-again').show();
	});

	socket.on('start-game', function(playAsIndex) {
		$('#pin-container').slideUp();
		if (playAsIndex === 0) {
			playAs = 'x';
			canMove = true;
			addMessage('Your turn (x)');
		} else if (playAsIndex === 1) {
			playAs = 'o';
			canMove = false;
			addMessage('Opponent\'s turn (x)');
		}
	});

	socket.on('opponent-moved', function(index) {
		$('#tile' + index).removeClass('empty-tile').addClass(playAs == 'x' ? 'naught' : 'cross');
		addMessage('Your turn (' + playAs + ')');
		board[index] = playAs == 'x' ? 'o' : 'x';
		checkGameOver();
		canMove = true;
	});

	$('#play-again').click(function() {
		canMove = false;
		socket.emit('play-again');
		$('.tile').addClass('empty-tile').removeClass('naught cross three-in-a-row').css({'opacity': 1.0});
		$(this).hide();
		$('#game-pin').val('');
		$('#pin-container').slideDown();
		playAs = 'o';
		board = [];
	});

	// Wrap click event handler for tile in closure to store index
	var makeTileClickHandler = function(index) {
		return function(event) {
			if (canMove && !board[index]) {
				canMove = false;
				socket.emit('move', index);
				addMessage('Opponent\'s turn (' + (playAs === 'x' ? 'o' : 'x') + ')', index);
				$(this).removeClass('empty-tile').addClass(playAs == 'o' ? 'naught' : 'cross');
				board[index] = playAs;
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
			canMove = false;
			addMessage(winner === playAs ? 'You won!' : 'You lost');
			$('#play-again').show();
			$('.tile').filter(':not(.three-in-a-row)').animate({'opacity': 0.3}, 2000);
		} else {

			for (i = 0; i < board.length; i++) {
				if (board[i]) filledCount++;
			}

			if (filledCount >= 9) {
				canMove = false;
				addMessage('Tie');
				$('#play-again').show();
			}
		}
	};

	$('#pin-form').on('submit', function(e) {
		var $gamePin = $('#game-pin');
		$gamePin.css({color: ''});
		e.preventDefault();
		var pin = parseInt($('#game-pin').val());
		if (!isNaN(pin) && pin >= 0) {
			socket.emit('enter-pin', pin);
		} else {
			var distance = 5, duration = 50;
			$gamePin.css({color: 'red'});
			for (var i = 0; i < 2; i++) {
				$gamePin.animate({left: -distance}, duration);
				$gamePin.animate({left: distance * 2}, duration * 2);
				$gamePin.animate({left: 0}, duration);
			}
		}
	});

	socket.on('invalid-pin', function() {
		var $gamePin = $('#game-pin');
		var distance = 5, duration = 50;
		$gamePin.css({color: 'red'});
		for (var i = 0; i < 2; i++) {
			$gamePin.animate({left: -distance}, duration);
			$gamePin.animate({left: distance * 2}, duration * 2);
			$gamePin.animate({left: 0}, duration);
		}
	});

	var addMessage = function(messageText) {
		$('#message').animate({'opacity': 0.0}, 'slow', function() {
			$(this).text(messageText).animate({'opacity': 1.0}, 'slow');
		});
	};

	// Add click events and ids to each tile.
	$('.tile').each(function(index) {
		$(this).on('click', makeTileClickHandler(index))
			.attr('id', 'tile' + index)
			.addClass('empty-tile');
	});

	$('#game-pin').val('');
	addMessage('Ready');
});
