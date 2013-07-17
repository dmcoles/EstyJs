// main initialisation routines for EstyJs
// written by Darren Coles

var estyjs = null;			

function reset() {
	estyjs.reset();
}

function pauseResume() {
	var running = estyjs.pauseResume();
	if (running) {
		$("#btnPause span").text("Pause");
	}
	else {
		$("#btnPause span").text("Resume");
	}
}

function fileSelected(evt) {
	var files = evt.target.files;
	if (files.length>0) {
		estyjs.openFile(files[0]);
	}
	
}

function soundToggle() {
	var sound = estyjs.soundToggle();
	if (sound) {
		$("#btnSound span").text("Sound off");
	}
	else {
		$("#btnSound span").text("Sound on");
	}
}

function openFile2() {
	estyjs.openFile('rick_dangerous.sts');
}

function openFile3() {
	estyjs.openFile('dmaster.sts');
}

function openFile4() {
	estyjs.openFile('speedball2.sts');
}

function changeJoystick() {
	estyjs.setJoystick($('#joystick').prop('checked'));
}