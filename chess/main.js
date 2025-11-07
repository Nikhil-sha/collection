// Element References //
const dialog = document.querySelector("dialog");

// State //
const players = {
	white: {
		name: 'Nikhil',
	},
	black: {
		name: 'keka',
	}
};

// Constants and Variables //
var chess;
var chessboard;
var nextPlayer;
var nextPlayerName;
var status;

// Initialisation //
chess = new Chess();
chessboard = new Chessboard('chessboard', {
	position: ChessUtils.FEN.startId,
	eventHandlers: {
		onPieceSelected: pieceSelected,
		onMove: pieceMove
	}
});

// Chessboard event handlers //
function pieceSelected(notationSquare) {
	var i,
		movesNotation,
		movesPosition = [];

	movesNotation = chess.moves({ square: notationSquare, verbose: true });
	for (i = 0; i < movesNotation.length; i++) {
		movesPosition.push(ChessUtils.convertNotationSquareToIndex(movesNotation[i].to));
	}
	return movesPosition;
}

function pieceMove(move) {
	chessMove = chess.move({
		from: move.from,
		to: move.to,
		promotion: 'r'
	});
	nextPlayer = 'white';
	if (chess.turn() === 'b') {
		nextPlayer = 'black';
	}
	if (chessMove !== null) {
		if (chess.in_checkmate() === true) {
			status = 'CHECKMATE! Player ' + players[nextPlayer].name + ' lost.';
		} else if (chess.in_draw() === true) {
			status = 'DRAW!';
		} else if (chess.insufficient_material() === true) {
			status = 'DRAW! No enough material to deliver Checkmate.';
		} else if (chess.in_stalemate() === true) {
			status = 'STALEMATE! ' + players[nextPlayer].name + ' has no legal moves.';
		} else {
			status = 'Next player is ' + players[nextPlayer].name + '.';
			if (chess.in_check() === true) {
				status = 'CHECK! ' + status;
			}
		}
	}
	updateStatus();
	return chess.fen();
}

// Utility Functions //
function showModal(heading, text, options) {
	if (!dialog) {
		console.error("Dialog element not found.");
		return;
	}
	dialog.querySelector('h2').innerText = heading;
	dialog.querySelector('p').innerText = text;
	let buttonsHTML = '';
	switch (options) {
		case 'OK':
			buttonsHTML = `
				<button autofocus value="ok" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Ok</button>
			`;
			break;
		case 'BOTH':
			buttonsHTML = `
				<button value="canceled" class="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 text-sm">Cancel</button>
				<button autofocus value="confirmed" class="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 text-sm">Ok</button>
			`;
			break;
		default:
			console.warn(`Invalid options: "${options}". Falling back to 'OK'.`);
			buttonsHTML = `
				<button autofocus value="OK" class="w-20 px-2 py-1 rounded-md bg-green-500 hover:bg-green-400 focus:outline-green-600 text-white text-sm font-bold">Ok</button>
			`;
	}
	dialog.querySelector('form').innerHTML = buttonsHTML;
	dialog.showModal();
}

function updateStatus() {
	const statusP = document.getElementById("status");
	statusP.innerText = status;
};

updateStatus();