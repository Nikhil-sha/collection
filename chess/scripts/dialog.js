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
