// fdc (wd1770) emulation routines for EstyJS
// written by Darren Coles

EstyJs.fdc = function (opts) {
    var self = {};

    var selectedDrive = '';

    var bug = opts.bug;

    var mfp = opts.mfp;

    var fileManager = opts.fileManager;

    var memory = null;

	var aborted = false;
	
    var floppyAdata = new Uint8Array(0);
    var floppyBdata = new Uint8Array(0);

    var driveSide = 0;
    var trackNo = 0;
    var sectorNo = 0;
    var sectorCount = 0;
    var dataReg = 0;
    var driveStatusA = 0x64; //
    var driveStatusB = 0x64; //
	var hblSinceLastcommandA = 0;
	var hblSinceLastcommandB = 0;
		
    var driveAcurrentTrack = 0;
    var driveBcurrentTrack = 0;

    var commandNo = 0;
    var dmaAddr = 0;
    var commandCompleteTimer = 0;
    var dmaStatusReg = 0;

    function processFileA(arrayBuffer) {
        floppyAdata = new Uint8Array(arrayBuffer);
    }

    function processFileB(arrayBuffer) {
        floppyBdata = new Uint8Array(arrayBuffer);
    }
	
	function getDiskGeometry() {
		var result = new Object();

		var floppyData = null;
		
        switch (selectedDrive) {
            case 'A':
                floppyData = floppyAdata;
				break;
            case 'B':
                floppyData = floppyAdata;
				break;
		}

		if (floppyData.length>9*80*512) {
			result.sides = 2;
		}
		else {
			result.sides = 1;
		}
		
		result.sectors = Math.floor(floppyData.length / 80 / result.sides / 512);
	
		return result;
	}

    function getDiskByte(byteOffset) {
        var sectorOffset = 0;
		
		var diskGeo = getDiskGeometry();
			
		sectorOffset = ((sectorNo-1) + (trackNo * diskGeo.sectors * diskGeo.sides) + (driveSide * diskGeo.sectors)) * 512;
		
		switch (selectedDrive) {
            case 'A':
                if (floppyAdata.length > sectorOffset + byteOffset) return floppyAdata[sectorOffset + byteOffset];
            case 'B':
                if (floppyBdata.length > sectorOffset + byteOffset) return floppyBdata[sectorOffset + byteOffset];

        }
        return 0;

    }

    function diskInserted() {
        switch (selectedDrive) {
            case 'A':
                return floppyAdata.length > 0;
            case 'B':
                return floppyBdata.length > 0;
            default:
                return false;
        }
    }

    function currentTrack() {
        switch (selectedDrive) {
            case 'A':
                return driveAcurrentTrack;
            case 'B':
                return driveBcurrentTrack;
            default:
                return 0;
        }
    }
	
	function setCurrentDriveTrack(val) {
        switch (selectedDrive) {
            case 'A':
                driveAcurrentTrack = val;
				break;
            case 'B':
                driveBcurrentTrack = val;
				break;
        }
	}
	
    function readDriveStatus() {
        switch (selectedDrive) {
            case 'A':
                return driveStatusA;
            case 'B':
                return driveStatusB;
            default:
                return 0x64;
        }
    }

	function resetHblSinceLastCommand() {
        switch (selectedDrive) {
            case 'A':
                hblSinceLastCommandA = 0;
                break;
            case 'B':
                hblSinceLastCommandB = 0;
                break;
        }
	}
	
    function writeDriveStatus(val) {
        switch (selectedDrive) {
            case 'A':
                driveStatusA = val;
                break;
            case 'B':
                driveStatusB = val;
                break;
        }
    }

    function processCommand() {
        switch (commandNo&0xf0) {
            case 0x0:
                //track 0 seek
				//bug.say(sprintf("fdc process command - restore %s",selectedDrive));
                commandCompleteTimer = 10;
                //set busy flag

                break;
            case 0x10:
                //seek track				
				//bug.say(sprintf("fdc process command - seek %s - track %d",selectedDrive,dataReg));
                commandCompleteTimer = 2;
                break;
            case 0x20:
				bug.say("fdc process command - step");
                commandCompleteTimer = 2;
				break;
            case 0x30:
				bug.say("fdc process command - step with update");
				commandCompleteTimer = 2;
				break;
            case 0x40:
				bug.say("fdc process command - step in");
				stepDir=1;
				commandCompleteTimer = 2;
				break;
            case 0x50:
				bug.say("fdc process command - step in with update");
				stepDir=1;
				commandCompleteTimer = 2;
				break;
            case 0x60:
				bug.say("fdc process command - step out");
				stepDir=0;
				commandCompleteTimer = 2;
				break;
            case 0x70:
				bug.say("fdc process command - step out with update");
				stepDir=0;
				commandCompleteTimer = 2;
				break;
            case 0x80:
                commandCompleteTimer = 5;
				//bug.say(sprintf("fdc: command read sector - %s - side: %d - track: %d - sector: %d - sector count: %d - addr: $%06x",selectedDrive,driveSide,trackNo,sectorNo,sectorCount,dmaAddr));
                dmaStatusReg = 1 | (sectorCount ? 2 : 0);
                mfp.setFloppyGpio();
				break;
            case 0x90:
				bug.say(sprintf("fdc: command read sector multiple - %s - side: %d - track: %d - sector: %d - sector count: %d - addr: $%06x",selectedDrive,driveSide,trackNo,sectorNo,sectorCount,dmaAddr));				
                commandCompleteTimer = 5;
                dmaStatusReg = 1 | (sectorCount ? 2 : 0);
                mfp.setFloppyGpio();
				break;
            case 0xa0:
				bug.say("fdc process command - write sector");
                commandCompleteTimer = 5;
				break;
            case 0xb0:
				bug.say("fdc process command - write sector multiple");
                commandCompleteTimer = 5;
				break;
            case 0xc0:
				bug.say("fdc process command - read addr");
                commandCompleteTimer = 5;
				break;
            case 0xd0:
				bug.say("fdc process command - force interrupt");
				//clear busyflag
				writeDriveStatus(readDriveStatus() & 0xfe);
                dmaStatusReg = 1;				
				if (commandCompleteTimer>0) {
					commandCompleteTimer=0;
					aborted = true;
					dmaStatusReg = 1;
					mfp.setFloppyGpio();
					return;
		}
				break;
            case 0xe0:
				bug.say("fdc process command - read track");
                commandCompleteTimer = 5;
				break;
            case 0xf0:
				bug.say("fdc process command - write track");
                commandCompleteTimer = 5;
				break;
        }
		resetHblSinceLastCommand();
        writeDriveStatus(0x81);
        dmaStatusReg = 1;
        mfp.setFloppyGpio();
    }

    self.selectDrive = function (drive) {
        switch (drive & 6) {
            case 0:
                //no drive selected
                //bug.say("deslect drives");
                selectedDrive = '';
                break;
            case 2:
                //drive A selected
                //bug.say("select drive A");
                selectedDrive = 'A';
                break;
            case 4:
                //drive B selected
                //bug.say("select drive B");
                selectedDrive = 'B';
                break;
            case 6:
                //both drives selected - invalid
                //bug.say("select both drives, invalid!");
                selectedDrive = '';
                break;
        }

        driveSide = (drive & 1);
    }

    self.setTrackRegisterHi = function (v) {
        trackNo = (trackNo & 0xff) | (v << 8);
    }

    self.setTrackRegisterLo = function (v) {
        trackNo = (trackNo & 0xff00) | v;
    }

    self.setSectorRegisterHi = function (v) {
        sectorNo = (sectorNo & 0xff) | (v << 8);
    }

    self.setSectorRegisterLo = function (v) {
        sectorNo = (sectorNo & 0xff00) | v;
    }

    self.setSectorCountRegisterHi = function (v) {
        sectorCount = (sectorCount & 0xff) | (v << 8);
    }

    self.setSectorCountRegisterLo = function (v) {
        sectorCount = (sectorCount & 0xff00) | v;
    }

    self.setDataRegisterHi = function (v) {
        dataReg = (dataReg & 0xff) | (v << 8);
    }

    self.setDataRegisterLo = function (v) {
        dataReg = (dataReg & 0xff00) | v;
    }

    self.setCommandRegisterHi = function (v) {
        commandNo = (commandNo & 0xff) | (v << 8);
        mfp.setFloppyGpio();
    }

    self.setCommandRegisterLo = function (v) {
        commandNo = (commandNo & 0xff00) | v;
        mfp.setFloppyGpio();
        processCommand();
    }

    self.setDmaAddrHi = function (v) {
        dmaAddr = (dmaAddr & 0x00ffff) | (v << 16);
    }

    self.setDmaAddrMid = function (v) {
        dmaAddr = (dmaAddr & 0xff00ff) | (v << 8);
    }

    self.setDmaAddrLo = function (v) {
        dmaAddr = (dmaAddr & 0xffff00) | v;
    }

    self.getDmaStatus = function () {
        return dmaStatusReg;
    }

    self.getTrackNo = function () {
        //bug.say("get track reg");
        return trackNo;
    }

    self.getSectorNo = function () {
        //bug.say("get sector reg");
        return sectorNo;
    }

    self.getSectorCount = function () {
        //bug.say("get sector count: "+sectorCount.toString());
        return sectorCount;
    }

    self.getDataRegister = function () {
        //bug.say("get data reg");
        return dataReg;
    }

    self.getDmaAddr = function () {
        return dmaAddr;
    }

    self.getDriveStatus = function () {
        mfp.setFloppyGpio();
		var status = readDriveStatus();
        //bug.say("read drive status, gpio reset, status = "+status.toString());
        return status;
    }

    self.loadFile = function (drive, filename) {
        switch (drive) {
            case 'A':
                fileManager.loadFile(filename, processFileA);
                break;
            case 'B':
                fileManager.loadFile(filename, processFileB);
                break;
        }

    }

    self.setMemory = function (mem) {
        memory = mem;
    }


    self.processRow = function () {
		if (driveStatusA & 0x80) {
			hblSinceLastCommandA++;
			if ((hblSinceLastCommandA>200*50*2)) {
				driveStatusA &= 0x7f;
				hblSinceLastCommandA = 0;
			}
			
		}
		
		if (driveStatusB & 0x80) {
			hblSinceLastCommandB++;
			if ((hblSinceLastCommandB>200*50*2)) {
				driveStatusB &= 0x7f;
				hblSinceLastCommandB = 0;
			}
			
		}
		
        if (commandCompleteTimer) {
            commandCompleteTimer--;

            if (!commandCompleteTimer  && !aborted) {
				var status;
				
				//bug.say("command complete");
				
                //command complete trigger interrupt and transfer data if appropriate
                switch (commandNo & 0xf0) {
					case 0x00:
						setCurrentDriveTrack(0);
						status = 0xe0 | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
                    case 0x10:
						//seek
						setCurrentDriveTrack(dataReg);
						trackNo = dataReg;
						status = 0xe0 | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
					case 0x20:
						//step
						if (stepDir) setCurrentDriveTrack(getCurrentDriveTrack()+1); else if (getCurrentDriveTrack()) setCurrentDriveTrack(getCurrentDriveTrack()-1);
						status = 0xe0 | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
					case 0x30:
						//step with update
						if (stepDir) setCurrentDriveTrack(getCurrentDriveTrack()+1); else if (getCurrentDriveTrack()) setCurrentDriveTrack(getCurrentDriveTrack()-1);
						trackNo=getCurrentDriveTrack();
						status = 0xe0 | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
					case 0x40:
						//step in
						setCurrentDriveTrack(getCurrentDriveTrack()+1);
						status = 0xe0 | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
					case 0x50:
						//step in with update
						setCurrentDriveTrack(getCurrentDriveTrack()+1);
						trackNo=getCurrentDriveTrack();
						status = 0xe0 | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
					case 0x60:
						//step out
						status = 0xe0 | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
					case 0x70:
						if (getCurrentDriveTrack()) setCurrentDriveTrack(getCurrentDriveTrack()-1);
						trackNo=getCurrentDriveTrack();
						status = 0xe0 | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
                    case 0x80:
                        //read data
                        var byteCount = 512;
						//bug.say(sprintf("read from offset $%8x",(((sectorNo-1) + (trackNo * 18) + (driveSide * 9)) * 512)));
                        for (var i = 0; i < byteCount; i++) {
                            memory.writeByte(dmaAddr + i, getDiskByte(i));
						}
						status = 0x80;// | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
                        break;
					case 0x90:
						//read data multiple
 
						var diskGeo = getDiskGeometry();
						var byteCount = sectorCount*512;
						
						if (sectorCount+sectorNo > diskGeo.sectors) {
							byteCount = (diskGeo.sectors - (sectorNo-1)) * 512;
						}
						
						//bug.say(sprintf("read from offset $%8x",(((sectorNo-1) + (trackNo * 18) + (driveSide * 9)) * 512)));
                        for (var i = 0; i < byteCount; i++) {
                            memory.writeByte(dmaAddr + i, getDiskByte(i));
						}
						status = 0x80;// | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
                        break;

					case 0xa0:
						//write - write protected
						status = 0xc0;// | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
					case 0xb0:
						//write multiple - write protected
						status = 0xc0;// | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
					case 0xc0:
						//read addr
						break;
					case 0xd0:
						//force interrupt
						break;
					case 0xe0:
						//read track
						break;
					case 0xf0:
						//write track
						break;


						
					default:
						status = 0xe0 | (currentTrack() ? 0 : 4) | (diskInserted() ? 0 : 16);
						break;
                }
				writeDriveStatus(status);
				
				aborted=false;


                dmaStatusReg = 1;

                mfp.clearFloppyGpio();

                //trigger interrupt
                mfp.interruptRequest(7);

            }
        }
 		
	}
	
	self.getDisplayData = function() {
		var result = new Array();
		if (driveStatusA & 0x80) {
			result.push('A: '+driveAcurrentTrack.toString());
		}
		
		if (driveStatusB & 0x80) {
			result.push('B: '+driveBcurrentTrack.toString());
		}
		
		return result;
	}

    return self;
}