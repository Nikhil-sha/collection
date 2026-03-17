let questionData = null,
	currQuestIndex = 0,
	score = 0,
	attempted = 0,
	wrong = 0;

async function loadData(fileName) {
	try {
		const response = await fetch(`./${fileName}.json`);
		if (!response.ok) {
			throw new Error('Failed to fetch data.json');
			return;
		}
		
		const jsonData = await response.json();
		questionData = jsonData;
	} catch (e) {
		console.error(e);
	}
}

function populateOptions(options) {
	window.optionsEl.innerHTML = '';
	
	options.forEach((opt, i) => {
		const option = window.optionTemp.content.cloneNode(true).firstElementChild;
		option.querySelector('input').value = i;
		option.querySelector('span').innerHTML = opt;
		
		window.optionsEl.appendChild(option);
	})
}

function setQuestion(question) {
	window.questionEl.innerHTML = question.question;
	populateOptions(question.options);
}

function startQuestioning() {
	if (!questionData[currQuestIndex]) {
		console.log('ended!');
		currQuestIndex = 0;
		window.mainFormEl.classList.add('hidden');
		window.resultEl.classList.remove('hidden');
		window.resultEl.querySelector('h2').textContent = 'Congrats!';
		window.resultEl.querySelector('p').innerHTML = `You attempted <strong>${attempted}</strong> of ${questionData.length} question. You answered ${wrong} of them wrong. Your final score is <strong>${score}</strong>.`;
		return;
	}
	setQuestion(questionData[currQuestIndex]);
	window.progressEl.textContent = `Question ${currQuestIndex + 1} of ${questionData.length}`;
}

function submitAnswer(e) {
	e.preventDefault();
	if (!e.target.answer.value || e.target.answer.value === '') {
		return;
	}
	
	if (parseInt(e.target.answer.value) === questionData[currQuestIndex].answer) {
		score += 4;
		attempted++;
		window.prevQuestResEl.className = `size-4 rounded-full bg-green-400`;
	} else {
		navigator.vibrate([50, 50, 50]);
		score--;
		wrong++;
		attempted++;
		window.prevQuestResEl.className = `size-4 rounded-full bg-red-400`;
	}
	
	currQuestIndex += 1;
	startQuestioning();
}

window.addEventListener('DOMContentLoaded', async function() {
	const url = new URL(window.location);
	const param = new URLSearchParams(url.search);
	if (param.get('test')) {
		window.homeCardEl.classList.add('hidden');
		window.mainFormEl.classList.remove('hidden');
		await loadData(param.get('test'));
		startQuestioning();
	}
});
window.mainFormEl.addEventListener('submit', submitAnswer);
window.mainFormEl.addEventListener('reset', (e) => {
	window.prevQuestResEl.className = `size-4 rounded-full bg-yellow-400`;
	currQuestIndex += 1;
	startQuestioning();
});