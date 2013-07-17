// main block for EstyJs
// written by Darren Coles

function EstyJs(output) {

	//var d = new Date();
	//var startTime = d.getTime();
	//var lastFrame = startTime;
	var frameCount = 0;

	var running = true;
	
	var soundEnabled = true;
	
	var requestAnimationFrame = (
		//window.requestAnimationFrame || window.msRequestAnimationFrame ||
		//window.mozRequestAnimationFrame || window.webkitRequestAnimationFrame ||
		//window.oRequestAnimationFrame ||
		function(callback) {
			setTimeout(function() {
				callback();
			}, 20);
		}
	);

	var self = {};

	var firstFrame = true;

	var bug = EstyJs.bug({
	});
	
	var fdc = EstyJs.fdc({
	});
	
	var mfp = EstyJs.mfp( {
		bug: bug
	});

	var keyboard = EstyJs.Keyboard({
		mfp: mfp,
		control: output
	});

	var sound = EstyJs.Sound({
	});
	
	var io = EstyJs.io({
		sound : sound,
		bug: bug,
		mfp: mfp,
		fdc: fdc,
		keyboard: keyboard
	});

	var memory = EstyJs.Memory({
		io: io,
		bug: bug
	});

	var processor = EstyJs.Processor({
		memory : memory,
		mfp : mfp,
		bug: bug
	});

	var display = EstyJs.Display({
		memory : memory,
		io : io,
		output: output
	});
	
	var snapshot = EstyJs.SnapshotFile({
		memory : memory,
		io : io,
		display: display,
		keyboard: keyboard,
		mfp: mfp,
		processor: processor
	});

	mfp.setDisplay(display);
	io.setDisplay(display);	
	processor.setup();
	memory.setProcessor(processor);
	
	setTimeout(runframe, 20);
	//requestAnimationFrame(runframe);

	function runframe() {
		if (running & memory.loaded==1) {
			if (firstFrame) {
				self.reset();
				firstFrame = false;
			}
			var currTime = window.performance.now();
			//var reqFrames = (currTime - startTime)/20;		
			//while (frameCount< reqFrames)
			{
				display.startFrame();			
				sound.startFrame();
				processor.vblInterrupt();
				while (display.beamRow<313) {
					display.startRow();
					mfp.startRow();
					processor.hblInterrupt();
					processor.runCode();
					display.processRow();
					sound.processRow();
					keyboard.processRow();
				}
				sound.endFrame(soundEnabled);
				frameCount++;
			}
		}
		var nextframe = Math.max(1,20-(window.performance.now()-currTime));

		setTimeout(runframe, nextframe );
	}
	
	self.reset = function(){
		memory.reset();
		display.reset();
		processor.reset(0);

	};
	
	self.pauseResume = function() {
		running = !running;
		return running;
	}
	
	self.soundToggle = function() {
		soundEnabled = !soundEnabled;
		return soundEnabled;
	}
	
	self.openFile = function(file) {
		snapshot.loadSnapshot(file); 
	}

	self.setJoystick = function(joyEnabled) {
		keyboard.KeypadJoystick = joyEnabled;
	}
	
	return self;
}