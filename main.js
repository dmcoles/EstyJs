// main initialisation routines for EstyJs
// written by Darren Coles
"use strict";

var estyjs = null;			

setTimeout(mouseLocked, 250);

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
			if (ext == '.sts') {
			    estyjs.openSnapshotFile(files[0]);
			} else if (ext == '.st' || ext == '.msa') {
			    estyjs.openFloppyFile('A', files[0]);
			} else if (ext == '.zip') {
			    estyjs.openZipFile('A', files[0]);
			}
		}
	}
	
}

function fileSelected2(evt) {
    var files = evt.target.files;
    if (files.length > 0) {
        if (files[0].name.lastIndexOf('.') != -1) {
            var ext = files[0].name.substr(files[0].name.lastIndexOf('.')).toLowerCase();
            if (ext == '.sts') {
                estyjs.openSnapshotFile(files[0]);
            } else if (ext == '.st' || ext == '.msa') {
                estyjs.openFloppyFile('B', files[0]);
            } else if (ext == '.zip') {
                estyjs.openZipFile('B', files[0]);
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

function changeShowPct() {
    estyjs.setShowPct($('#showpct').prop('checked'));
}

function changeFrameskip() {
    estyjs.setFrameskip($('#frameskip').prop('checked'));
}


function changeRamSize() {
    estyjs.setMemory($('#ram').prop('checked'));
}

function lockMouse() {
    estyjs.lockMouse();
}

function mouseLocked() {
    var locked = estyjs.getMouseLocked();
    if (locked) {
        $("#btnLocked span").text("Unlock");
    }
    else {
        $("#btnLocked span").text("Lock");
    }
    setTimeout(mouseLocked, 250);

}

function fullScreen() {
    if ($('#accordion').is(':hidden')) {
        $("#accordion").show();
        $("#EstyJsOutput").width(640);
        $("#estyjs").css("left", 420);
        $("#btnFullscreen span").text("Expand");
    }
    else {
        $("#accordion").hide();
        $("#EstyJsOutput").width(window.innerWidth-80);
        $("#estyjs").css("left", 20);
        $("#btnFullscreen span").text("Shrink");
    }
}