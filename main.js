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
		if (files[0].name.lastIndexOf('.')!=-1) {
			var ext = files[0].name.substr(files[0].name.lastIndexOf('.')).toLowerCase();
			if (ext=='.sts') {
				estyjs.openSnapshotFile(files[0]);
			} else if (ext=='.st') {
				estyjs.openFloppyFile('A',files[0]);
			}
		}
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

function openFile(fname) {
    estyjs.openFloppyFile('A', fname);
}

function openFileInDrive(fname,drive) {
	estyjs.openFloppyFile(drive, fname);
}

function openFile2() {
    estyjs.openSnapshotFile('rick_dangerous.sts');
}

function openFile3() {
	estyjs.openSnapshotFile('dmaster.sts');
}

function openFile4() {
    estyjs.openSnapshotFile('speedball2.sts');
}

function changeJoystick() {
	estyjs.setJoystick($('#joystick').prop('checked'));
}

function changeRamSize() {
    estyjs.setMemory($('#ram').prop('checked'));
}