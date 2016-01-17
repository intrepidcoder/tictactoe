$(document).ready(function() {
	var socket = io();

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

	socket.on('start-turn', function() {
		console.log('Your turn.');
		$('#move').prop({'disabled':false});
	});

	$('#reconnect').click(function() {
		socket.emit('play-again');
		console.log('Waiting for opponent.');
		$('#reconnect').prop({'disabled':true});
	});

	$('#move').click(function() {
		socket.emit('move');
		console.log('Waiting for opponent\'s move.');
		$('#move').prop({'disabled':true});
	});
});
