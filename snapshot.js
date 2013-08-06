// snapshot file handling emulation routines for EstyJs
// written by Darren Coles

EstyJs.SnapshotFile = function (opts) {
    var self = {};

    var processor = opts.processor;
    var memory = opts.memory;
    var io = opts.io;
    var display = opts.display;
    var keyboard = opts.keyboard;
    var mfp = opts.mfp;
    var fileManager = opts.fileManager;

    function readByte(buffer, offset) {
        return buffer[offset];
    }

    function readWord(buffer, offset) {
        return buffer[offset] + (buffer[offset + 1] << 8);
    }

    function readLong(buffer, offset) {
        return buffer[offset] + (buffer[offset + 1] << 8) + (buffer[offset + 2] << 16) + (buffer[offset + 3] << 24);
    }

    function processSnapshot(arrayBuffer) {


        var buffer = new Uint8Array(arrayBuffer);

        var regs = new Object();
        regs.pc = readLong(buffer, 4);
        regs.regs = new Array();
        for (var i = 0; i < 16; i++) {
            regs.regs.push(readLong(buffer, 16 + (i * 4)));
        }
        regs.sr = readWord(buffer, 80);
        regs.othersp = readLong(buffer, 82);

        processor.setSnapshotRegs(regs);


        var displayRegs = new Object();
        displayRegs.screenAddr = readLong(buffer, 86);
        displayRegs.freq = readLong(buffer, 142);
        displayRegs.screenMode = readByte(buffer, 166);
        displayRegs.palette = new Array();
        for (var i = 0; i < 32; i++) {
            displayRegs.palette.push(readByte(buffer, 94 + (i ^ 1)));   /// ^1 to reverse the byte order
        }

        display.setSnapshotRegs(displayRegs);

        //mmu config - not sure about this
        //io.write(0xFF8001,readByte(buffer,167));

        //io.write(0xFFFA07,0);
        //io.write(0xFFFA09,64);

        var mfpregs = new Array();
        for (var i = 0; i < 24; i++) {
            mfpregs.push(readByte(buffer, 172 + i));
        }
        mfp.setSnapshotRegs(mfpregs);

        var keyboardregs = new Object();
        switch (readLong(buffer, 295)) {
            case 8:
                keyboardregs.mouseMode = 'R';
                break;
            case 9:
                keyboardregs.mouseMode = 'A';
                break;
            case 0xa:
                keyboardregs.mouseMode = 'K';
                break;
            case 0x12:
                keyboardregs.mouseMode = '';
                break;
        }

        switch (readLong(buffer, 299)) {
            case 0x14:
                keyboardregs.joystickMode = 'E';
                break;
            case 0x15:
            case 0x1a:
                keyboardregs.joystickMode = '';
                break;
            case 0x19:
                keyboardregs.joystickMode = 'K';
                break;
        }

        keyboard.setSnapshotRegs(keyboardregs);

        var tosFileLen = readLong(buffer, 1954);
        var rambanksize1 = readLong(buffer, 1958 + tosFileLen + 2);
        var rambanksize2 = readLong(buffer, 1958 + tosFileLen + 6);
        var stringStart = 1958 + tosFileLen + 10;
        for (i = 0; i < 30; i++) {
            var stringLen = readLong(buffer, stringStart);
            stringStart += 4 + stringLen;
        }


        var membuff = new Array();
        memoffset = readLong(buffer, stringStart + 284);
        var memvalue = readWord(buffer, memoffset);
        var repeatvalue = 0;
        memoffset += 2;
        var o = rambanksize1 + rambanksize2;
        membuff = new ArrayBuffer(o);
		memDataView = new DataView(membuff);
        while (memvalue != 0xffff) {
            if (memvalue < 0x8000) {
                for (var i = 0; i < memvalue; i++) {
                    o -= 2;
                    memDataView.setUint8(o + 1,(readByte(buffer, memoffset)));
                    memDataView.setUint8(o,(readByte(buffer, memoffset + 1)));
                    memoffset += 2;
                }
            }
            else if (memvalue < 0xfffe) {
                repeatvalue1 = readByte(buffer, memoffset);
                repeatvalue2 = readByte(buffer, memoffset + 1);
                memoffset += 2;
                for (var i = 0; i < (memvalue & 0x7fff); i++) {
                    o -= 2;
                    memDataView.setUint8(o + 1,repeatvalue1);
                    memDataView.setUint8(o,repeatvalue2);
                }
            }
            var memvalue = readWord(buffer, memoffset);
            memoffset += 2;
        }
        memory.setSnapshotMemory(membuff);

    }

    self.loadSnapshot = function (file) {
        fileManager.loadFile(file, processSnapshot);
    }

    return self;
}