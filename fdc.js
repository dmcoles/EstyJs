// fdc (wd1770) emulation routines for EstyJS
// written by Darren Coles

EstyJs.fdc = function(opts) {
	var self = {};

	var fdcStatus1 = 0xff;
	var fdcStatus2 = 0x64;
	
	var dmaStatus1 = 0xff;
	var dmaStatus2 = 0x00;

	self.readStatus1 = function() {
		return fdcStatus1;
	}
	
	self.readStatus2 = function() {
		return fdcStatus2;
	}

	self.readDmaStatus1 = function() {
		return dmaStatus1;
	}
	
	self.readDmaStatus2 = function() {
		return dmaStatus2;
	}

	self.processCommand = function(cmd) {
	}
	
	self.processCommand2 = function(addr,cmd) {
	}

	return self;
}