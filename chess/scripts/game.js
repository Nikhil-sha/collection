const game = {
  socket: null,
  you: {},
  opponent: {},
  engine: null,
  board: null,
  status: "",
  history: []
};

async function main(callback) {
  const saved = JSON.parse(localStorage.getItem("chess"));
  if (!saved || !saved.name || !saved.id) {
    const name = await Dialog.prompt('Enter your name.', 'User Info!', 'eg. John Doe');
    game.socket = new Peer();
    game.you = { name };
  } else {
    game.socket = new Peer(saved.id);
    game.you = saved;
  }
  
  game.socket.on("open", (id) => {
    game.you.id = id;
    console.log(id);
    if (!saved || !saved.name || !saved.id) localStorage.setItem('chess', JSON.stringify({ name: game.you.name, id: game.you.id }));
  });
  
  game.socket.on('connection', (conn) => {
    game.opponent.connection = conn;
    game.you.color = 'w'
    setupConnectionEvents(conn);
  })
  
  game.socket.on('error', (err) => {
    console.error('Error:', err);
    
    const userMessage = {
      'peer-unavailable': 'The peer is unavailable. Check the ID and try again.',
      'network': 'A network error occurred. Please check your connection.',
      'disconnected': 'Disconnected from the server. Reconnecting...',
      'browser-incompatible': 'Your browser does not support this feature.',
      'webrtc': 'A WebRTC error occurred. Try reloading the page.',
      'server-error': 'A server error occurred. Try again later.',
    };
    
    Dialog.alert(userMessage[err.type] || 'An unexpected error occurred. Please try again.', 'Error');
  });
  
  game.engine = new Chess();
  game.board = new Chessboard('chessboard', {
    position: ChessUtils.FEN.startId,
    eventHandlers: {
      onPieceSelected: pieceSelected,
      onMove: pieceMove
    }
  });
  
  callback();
}

async function connectToPeer() {
  const id = await Dialog.prompt('Enter Opponent\'s peer id to play', 'Connect');
  game.you.color = 'b';
  game.board.setOrientation(ChessUtils.ORIENTATION.black);
  game.opponent.connection = game.socket.connect(id);
  setupConnectionEvents(game.opponent.connection);
}

function setupConnectionEvents(conn) {
  conn.on("open", async () => {
    Dialog.alert(`Connected to: ${conn.peer}`, 'Connected');
    sendToOpponent({
      type: 'info',
      data: game.you.name
    });
  });
  
  conn.on("data", async (rawData) => {
    try {
      const { type, data } = JSON.parse(rawData);
      console.log("Received Data:", rawData);
      
      switch (type) {
        case 'info':
          game.opponent.name = data;
          break;
          
        case 'move':
          const chessMove = game.engine.move(data);
          
          if (chessMove !== null) {
            checkGameStatus();
          }
          
          game.board.setPosition(game.engine.fen());
          break;
          
        case 'undo':
          undoMove(true);
          break;
          
        default:
          break;
      }
    } catch (err) {
      console.error("Error handling received data:", err);
      Dialog.alert("Failed to process received data.", 'Error');
    }
  });
  
  conn.on("close", () => {
    Dialog.alert("Connection closed.", 'Disconnected');
    connection = null;
  });
}

function sendToOpponent(payload) {
  if (!game.opponent.connection) return;
  
  if (typeof payload === 'string') {
    game.opponent.connection.send(payload);
  } else {
    game.opponent.connection.send(JSON.stringify(payload));
  }
}

const Dialog = {
  alert(message, title = "Alert") {
    return new Promise((resolve) => {
      createDialog({
        title,
        message,
        showInput: false,
        showCancel: false,
        onConfirm: () => resolve()
      });
    });
  },
  
  confirm(message, title = "Confirm") {
    return new Promise((resolve) => {
      createDialog({
        title,
        message,
        showInput: false,
        showCancel: true,
        onConfirm: () => resolve(true),
        onCancel: () => resolve(false)
      });
    });
  },
  
  prompt(message, title = "Input", placeholder = "") {
    return new Promise((resolve) => {
      createDialog({
        title,
        message,
        showInput: true,
        inputPlaceholder: placeholder,
        showCancel: true,
        onConfirm: (inputValue) => resolve(inputValue),
        onCancel: () => resolve(null)
      });
    });
  }
};

function createDialog({
  title = "Dialog",
  message = "",
  showInput = false,
  inputPlaceholder = "",
  showCancel = true,
  onConfirm = () => {},
  onCancel = () => {}
}) {
  const dialog = document.createElement("dialog");
  dialog.className = `
		backdrop:bg-black/50
		rounded-xl p-6 shadow-xl bg-white dark:bg-gray-800
		w-11/12 max-w-md text-gray-800 dark:text-gray-100
		animate-fade-in
	`;
  
  const inputHTML = showInput ?
    `<input id="dialogInput" type="text" placeholder="${inputPlaceholder}" class="w-full p-2 mt-2 mb-4 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:bg-gray-700 dark:border-gray-600" />` :
    "";
  
  const cancelBtnHTML = showCancel ?
    `<button id="dialogCancel" class="px-4 py-2 rounded-md bg-gray-300 dark:bg-gray-600 hover:bg-gray-400 dark:hover:bg-gray-500">
			Cancel
		</button>` :
    "";
  
  dialog.innerHTML = `
		<h3 class="text-xl font-semibold mb-2">${title}</h3>
		<p class="mb-2">${message}</p>
		${inputHTML}
		<div class="flex justify-end space-x-2 mt-4">
			${cancelBtnHTML}
			<button id="dialogConfirm" class="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">
				OK
			</button>
		</div>
	`;
  
  document.body.appendChild(dialog);
  dialog.showModal();
  
  // Event listeners
  dialog.querySelector("#dialogConfirm").onclick = () => {
    const inputValue = showInput ? dialog.querySelector("#dialogInput").value : undefined;
    if (inputValue === "" || inputValue === null) {
      return;
    }
    onConfirm(inputValue);
    dialog.close();
    dialog.remove();
  };
  
  if (showCancel) {
    dialog.querySelector("#dialogCancel").onclick = () => {
      onCancel();
      dialog.close();
      dialog.remove();
    };
  }
}

function undoMove(signal) {
  const undone = game.engine.undo();
  if (undone) {
    game.board.setPosition(game.engine.fen());
    game.status = 'Move undone. It\'s ' + (game.turn === 'you' ? game.you.name : game.opponent.name) + '\'s turn.';
    
    console.log(game.status);
    if (!signal) sendToOpponent({
      type: 'undo',
      data: 'undo'
    });
  } else {
    console.warn("No moves to undo!");
  }
}

function yourTurn() {
  if (game.engine && game.board) {
    return game.engine.turn() === game.you.color ? true : false;
  } else {
    console.log('not your turn!')
    return false;
  }
}

function checkGameStatus() {
  if (game.engine.in_checkmate() === true) {
    game.status = 'CHECKMATE! ' + (yourTurn() ? game.you.name : game.opponent.name) + ' lost.';
  } else if (game.engine.in_draw() === true) {
    game.status = 'DRAW!';
  } else if (game.engine.insufficient_material() === true) {
    game.status = 'DRAW! Not enough material to deliver Checkmate.';
  } else if (game.engine.in_stalemate() === true) {
    game.status = 'STALEMATE! ' + (yourTurn() ? game.you.name : game.opponent.name) + ' has no legal moves.';
  } else {
    game.status = (yourTurn() ? game.you.name : game.opponent.name) + '\'s turn!';
    if (game.engine.in_check() === true) {
      game.status = 'CHECK! ' + game.status;
    }
  }
  
  document.getElementById('status').textContent = game.status;
  document.getElementById('fen').value = game.engine.fen();
}

function pieceSelected(notationSquare) {
  if (!yourTurn()) return;
  
  var i,
    movesNotation,
    movesPosition = [];
  
  movesNotation = game.engine.moves({ square: notationSquare, verbose: true });
  for (i = 0; i < movesNotation.length; i++) {
    movesPosition.push(ChessUtils.convertNotationSquareToIndex(movesNotation[i].to));
  }
  return movesPosition;
}

function pieceMove(move) {
  const chessMove = game.engine.move({
    from: move.from,
    to: move.to,
    promotion: 'q'
  });
  
  if (chessMove !== null) {
    checkGameStatus();
    
    sendToOpponent({
      type: 'move',
      data: {
        from: move.from,
        to: move.to,
        promotion: 'q'
      }
    });
  }
  
  return game.engine.fen();
}

const callback = () => {
  console.log(game);
};

main(callback);