$(document).ready(function() {
	var socket = io();

	$('#reconnect').prop({'disabled':true});
	console.log('Waiting for opponant.');

	socket.on('matched', function() {
		console.log('Matched with opponent.');
		$('#reconnect').prop({'disabled':true});
	});

	socket.on('opponent-disconnected', function() {
		console.log('Opponent disconnected.');
		$('#reconnect').prop({'disabled':false});
	});

	$('#reconnect').click(function() {
		socket.emit('play-again');
		console.log('Waiting for opponant.');
		$('#reconnect').prop({'disabled':true});
	});

});
