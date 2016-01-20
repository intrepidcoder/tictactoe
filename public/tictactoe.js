$(document).ready(function() {
	var socket = io();
	var canMove = false;
	var playAs = 'o';

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
		$('#tile' + index).addClass(playAs == 'x' ? 'naught' : 'cross').empty();
	});

	$('#reconnect').click(function() {
		socket.emit('play-again');
		console.log('Waiting for opponent.');
		$('#reconnect').prop({'disabled':true});
	});

	// $('#move').click(function() {
	// 	socket.emit('move');
	// 	console.log('Waiting for opponent\'s move.');
	// 	$('#move').prop({'disabled':true});
	// });

	// Wrap click event handler for tile in closure to store index
	var makeTileClickHandler = function(index) {
		return function(event) {
			if (canMove) {
				socket.emit('move', index);
				console.log('Waiting for opponent\'s move.', index);
				// $(this).append($('<img>', {'src': 'images/o.svg', 'alt': 'o', 'width': 150, 'height': 150}));
				$(this).parent().addClass(playAs == 'o' ? 'naught' : 'cross').empty();
				canMove = false;
			}
		};
	};

	$('.tile').each(function(index) {
		var $innerTile = $('<div>');
		$innerTile.addClass('empty-tile');
		$innerTile.on('click', makeTileClickHandler(index));
		$(this).append($innerTile);
		$(this).attr('id', 'tile' + index);
	});
});
