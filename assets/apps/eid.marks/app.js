function isNotEmpty(elem) {
	var str = elem.value;
	if (str == null || str.length == 0) {
		alert("Those fields won't fill themselves!");
		return false;
	} else {
		return true;
	}
}

function isWeightage(elem) {
	var str = elem.value;
	if (str == null || str.length == 0) {
		alert("Please fill in the required fields");
		return false;
	} else if (parseFloat(str) >= 1 || parseFloat(str) <= 0) {
		alert("Please fill in a valid weightage between 0 and 1.")
	} else {
		return true;
	}
}

function validForm(form) {
	if (isNotEmpty(form.sname)) {
		if (isNotEmpty(form.smarks)) {
			if (isNotEmpty(form.smax)) {
				if (parseInt(form.smarks.value) > parseInt(form.smax.value)) {
					alert("You've done splendidly well you've broken the calculator!\nYou didn't get higher than the max mark!");
					return false;
				}
				if (isWeightage(form.sweightage)) {
					return true;
				}
			}
		}
	}
	return false;
}

var subjectList = [];

function addSubject(sname, smarks, smax, sweightage) {
	const form = document.querySelector('#js-form');
	if (sname === '' || sname === null) return;
	if (smarks === '' || smarks === null) return;
	if (smax === '' || smax === null) return;
	if (sweightage === '' || sweightage === null) return;
	if (parseInt(form.smarks.value) > parseInt(form.smax.value)) return;

	if (subjectList.find(item => item.sname == sname)) {
		alert("Subjet already exists.");
		return false
	}
	const subject = {
		sname,
		smarks,
		smax,
		sweightage
	};

	subjectList.push(subject);
	renderSubject(subject);

	return true
}

function deleteSubject(sname) {
	const index = subjectList.findIndex(item => item.sname === sname);
	const subject = {
		deleted: true,
		sname
	};
	subjectList = subjectList.filter(item => item.sname !== sname);
	renderSubject(subject);
}

function calculate() {
	var overallPercentile = 0.0;
	var overallMark = 0.0;
	var overallMax = 0.0;

	var smallEid = [];
	var mediumEid = [];
	var eidEid = [];
	var bigEid = [];
	var failEid = [];
	for (let i = 0; i < subjectList.length; i++) {
		const subject = subjectList[i];
		
		const smarks = parseFloat(subject.smarks);
		const smax = parseFloat(subject.smax);
		const sweightage = parseFloat(subject.sweightage);
		// check if smax is out of hundred, if not, convert,
		// this is needed for the weightage system
		if (smax != 100) {
			// map the values to hundred
			overallPercentile += (smarks / smax) * 100 * sweightage;
		} else {
			overallPercentile += smarks * sweightage;
		}
		overallMark += smarks;
		overallMax += smax;

		const percentage = parseFloat(subject.smarks) / parseFloat(subject.smax);
		if (percentage >= 0.9) {
			smallEid.push(subject);
		} else if (percentage >= 0.8) {
			mediumEid.push(subject);
		} else if (percentage >= 0.7) {
			eidEid.push(subject);
		} else if (percentage >= 0.6) {
			bigEid.push(subject);
		} else {
			failEid.push(subject);
		}
	}

	return [overallPercentile, overallMark, overallMax,
			smallEid, mediumEid, eidEid, bigEid, failEid];
}

function renderSubject(subject) {
	const table = document.querySelector('#subjectsTable');
	const item = document.querySelector(`[data-key='${subject.sname}']`);

	if (subject.deleted) {
		item.remove();
		if (subjectList.length == 0) table.style.visibility = "collapse"
		return
	}

	const node = document.createElement("tr"); 
	node.setAttribute('class', 'subjectItem');
	node.setAttribute('data-key', subject.sname);
	node.innerHTML = `
<td>${subject.sname}</td>
<td>${subject.smarks}</td>
<td>${subject.smax}</td>
<td>${subject.sweightage}</td>
<td><button class="delete-subject">X</button></td>
`;
	if (item) {
		table.replaceChild(node, item);
	} else {
		table.append(node);
	}

	table.style.visibility = 'visible';
}

const table = document.querySelector('#subjectsTable');
table.addEventListener('click' , event => {
	if (event.target.classList.contains('delete-subject')) {
		const itemKey = event.target.parentElement.parentElement.dataset.key;
		deleteSubject(itemKey);
	}
});

window.addEventListener("load", () => {
	document.querySelector('#sname').focus();
	const form = document.querySelector('#js-form');
	form.addEventListener('submit', event => {
		event.preventDefault();

		const sname = document.querySelector('#sname');
		const smarks = document.querySelector('#smarks');
		const smax = document.querySelector('#smax');
		const sweightage = document.querySelector('#sweightage');

		if (addSubject(sname.value.trim(), smarks.value.trim(), smax.value.trim(), sweightage.value.trim())) {
			sname.value = '';
			smarks.value = '';
			smax.value = '';
			sweightage.value = '';
			sname.focus();
		}
	});
});

function calculateBtn() {
	if (subjectList.length <= 1) {
		alert("You must have done more than one subject this semister!");
		return
	}
	results = calculate();

	var resultsViewer = document.querySelector('#resultsViewer');
	if (resultsViewer) {
		resultsViewer.innerHTML = '';
	}

	const overallPercentileNode = document.createElement("h3");
	if (results[0] >= 90) {
		overallPercentileNode.innerHTML = `Oops! You got small Eid!`;
	} else if (results[0] >= 80) {
		overallPercentileNode.innerHTML = `Good Job! You got medium Eid!`;
	} else if (results[0] >= 70) {
		overallPercentileNode.innerHTML = `Amazing! You got Eid!`;
	} else if (results[0] >= 60) {
		overallPercentileNode.innerHTML = `EID! You got BIG Eid!`;
	} else {
		overallPercentileNode.innerHTML = `That's not funny anymore, you literally failed.`;
	}
	overallPercentileNode.innerHTML += ` <br/>Your overall is ${results[0].toFixed(1).toString()}/100`;

	const detailsNode = document.createElement('dl');

	const overallMark = document.createElement('dt');
	overallMark.innerHTML = `Your overall mark is ${results[1]} from ${results[2]}`;
	detailsNode.append(overallMark);

	const categoryPrompt = ['Subjects that you got small eid in:',
							'Subjects that you got medium eid in:',
							'Subjects that you got eid in:',
							'Subjects that you got big eid in:',
							'Subjects that you failed in:'];

	for (let i = 3; i <= 7; i++) {
		const category = document.createElement('dl');
		const prompt = document.createElement('dt');
		prompt.innerHTML = categoryPrompt[i-3];
		if (results[i].length) category.append(prompt);
		for (let j = 0; j < results[i].length;  j++) {
			const subject = results[i][j];
			const subjectNode = document.createElement('dd');
			subjectNode.innerHTML = `${subject.sname}, ${subject.smarks}/${subject.smax}, ${(subject.smarks/subject.smax)*100}%`;
			category.append(subjectNode);
		}
		detailsNode.append(category);
	}

	const resetBtn = document.createElement('button');
	resetBtn.setAttribute('onclick', `window.location.reload()`);
	resetBtn.innerHTML = 'Reset App';

	resultsViewer.append(overallPercentileNode);
	resultsViewer.append(detailsNode);
	resultsViewer.append(resetBtn);
	resultsViewer.style.visibility = 'visible';
}
