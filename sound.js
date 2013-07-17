// sound emulation routines for EstyJs
// written by Darren Coles

EstyJs.Sound = function(opts) {
	var self = {};

	var samplesPerFrame = 882;
	
	var audioContext = null;
	var audioOutput = null;
	var audioNode = null;
	var audioBuffer = null;

	var soundEnabled = true;
	
	var regSelect = 0;
	var registers = new Uint8Array(16);
	
	var AudioContext = window.AudioContext || window.webkitAudioContext;
	if (AudioContext) {
		/* Use Web Audio API */
		audioBuffer = new Array();

		var audioContext = new AudioContext();
		var audioNode = audioContext.createJavaScriptNode(2048, 1, 1);

		onAudioProcess = function(e) {
			var buffer = e.outputBuffer.getChannelData(0);
			fillBuffer(buffer);
		};
		
		audioNode.onaudioprocess = onAudioProcess;
		audioNode.connect(audioContext.destination);
	}
	else if (typeof(Audio) != 'undefined') {
		/* Use audio data api */
		audioBuffer = new Array();
		audioOutput = new Audio();
		audioOutput.mozSetup(1, samplesPerFrame*50);
	}
	
	
	var sampleCount = 0;
	var sampleValue = 1;
	
	var frameSamples = 0;
	
	var frameCount = 0;
	
	var rowCount = 0;

	function fillBuffer(outputArray) {
		var n = outputArray.length;
		var i = 0;
		var i2 = 0;
		if (!soundEnabled) 
		{
			audioBuffer.length = 0;
			return;
		}
		
		while ((audioBuffer.length+i)<n) {
			outputArray[i++]=0;
		}
		
		while (i<n) {
			outputArray[i++]=audioBuffer[i2++];
		}

		audioBuffer.splice(0,i2);
		
	}
	
	/*function makeSample(freq,count) {
		if (audioBuffer==null) return;
		for (var i=0; i<count; i++) {
			frameSamples++;
			if (!freq) {
				audioBuffer.push(0);
			}
			else {
				audioBuffer.push(sampleValue);

				if ((sampleCount++)>44100/freq/2) {
					sampleCount=0;
					sampleValue=-sampleValue;
				}
			}
		}
	}*/

	function writeSampleData(soundIsEnabled) {
		soundEnabled = soundIsEnabled;
		if (soundEnabled & frameCount>=5 & audioOutput!=null) {
			numberSamplesWritten = audioOutput.mozWriteAudio(audioBuffer);
			audioBuffer.splice(0,numberSamplesWritten);
		}
		
		
	}
	
	self.startFrame = function() {
		rowCount = 0;
		frameSamples = 0;
		frameCount++;
	}

	self.endFrame = function(enabled) {
		//makeSample(sheila.soundFreq,samplesPerFrame-frameSamples);
		writeSampleData(enabled);
	}
	
	self.processRow = function() {
		rowCount++
		//makeSample(sheila.soundFreq, samplesPerFrame/312 * rowCount-frameSamples);
		
	}
	
	self.selectRegister = function(reg) {
		regSelect = reg;
	}
	
	self.readRegister = function() {
		return registers[regSelect];
	}
	
	self.writeRegister = function(val) {
		registers[regSelect] = val;
	}

	return self;
}