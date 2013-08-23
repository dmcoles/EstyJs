// io registers emulation routines for EstyJs
// written by Darren Coles

//$FFFF8001  r/w  |....xxxx|          Memory configuration
//$FFFF8201  r/w  |xxxxxxxx|          Video base high
//$FFFF8203  r/w  |xxxxxxxx|          Video base medium
//$FFFF8205  r    |..xxxxxx|          Video address counter high (r/w on STe)
//$FFFF8207  r    |xxxxxxxx|          Video address counter med (r/w on STe)
//$FFFF8209  r    |xxxxxxx.|          Video address counter low (r/w on STe)
//$FFFF820A  r/w  |......xx|          Sync mode
//$FFFF8240  r/w  |....xxxxxxxxxxxx|  Palette colour (1 word each, first of 16)
//$FFFF8260  r/w  |......xx|          Screen resolution

//$FFFF8604  r/w  |........xxxxxxxx|  Disk controller
//$FFFF8606  r    |.............xxx|  DMA status
//$FFFF8606  w    |.......xxxxxxxx.|  DMA status
//$FFFF8609  r/w  |..xxxxxx|          DTA high byte
//$FFFF860B  r/w  |xxxxxxxx|          DTA middle byte
//$FFFF860D  r/w  |xxxxxxx.|          DTA low byte

//$FFFF8800  r    |xxxxxxxx|          PSG register data
//           w    |xxxxxxxx|          PSG register select
//$FFFF8802  w    |...xxxxx|          PSG register data

//$FFFFFC00  r/w  |xxxxxxxx|          Keyboard ACIA control
//$FFFFFC02  r/w  |xxxxxxxx|          Keyboard ACIA data
//$FFFFFC04  r/w  |xxxxxxxx|          MIDI ACIA control
//$FFFFFC06  r/w  |xxxxxxxx|          MIDI ACIA data

//$FFFFFA01  r/w  |x.xx...x|          MFP GP I/O

//$FFFFFA03  r/w  |xxxxxxxx|          Active edge                

//$FFFFFA05  r/w  |xxxxxxxx|          Data direction (all bits IN/OUT)

//$FFFFFA07  r/w  |xxxxxxxx|          Interrupt enable A
//$FFFFFA0B  r/w  |xxxxxxxx|          Interrupt pending A
//$FFFFFA0F  r/w  |xxxxxxxx|          Interrupt in-service A
//$FFFFFA13  r/w  |xxxxxxxx|          Interrupt mask A
 
//$FFFFFA09  r/w  |xxxxxxxx|          Interrupt enable B
//$FFFFFA0D  r/w  |xxxxxxxx|          Interrupt pending B
//$FFFFFA11  r/w  |xxxxxxxx|          Interrupt in-service B
//$FFFFFA15  r/w  |xxxxxxxx|          Interrupt mask B
                 
//$FFFFFA17  r/w  |....x...|          Vector base
                 
//$FFFFFA19  r/w  |....xxxx|          Timer A control
//$FFFFFA1B  r/w  |....xxxx|          Timer B control                     

//$FFFFFA1D  r/w  |.xxx.xxx|          Timers C&D control

//$FFFFFA1F  r/w  |xxxxxxxx|          Timer A data
//$FFFFFA21  r/w  |xxxxxxxx|          Timer B data
//$FFFFFA23  r/w  |xxxxxxxx|          Timer C data
//$FFFFFA25  r/w  |xxxxxxxx|          Timer D data
//$FFFFFA27  r/w  |xxxxxxxx|          Sync character

//$FFFFFA29  r/w  |xxxxxxx.|          USART control register

//$FFFFFA2B  r/w  |xxxxxxxx|          Receiver status

//$FFFFFA2D  r/w  |xxxxxxxx|          Transmitter status

//$FFFFFA2F  r/w  |xxxxxxxx|          USART data


					 //ff8800 - psg reg select (write)
//ff8802 - psg write data (write)
//fffa1b - timerb control (write)
//fffa21 - timerb data (write)

//fffa21 - timerb data (read)

EstyJs.io = function (opts) {
    var self = {};

    var sound = opts.sound;
    var display = null;

    var bug = opts.bug;

    var keyboard = opts.keyboard;
    var mfp = opts.mfp;
    var fdc = opts.fdc;

    var dmaModeControl = 0;
    var dmaAddr = 0;
	
    var memConfig = 5; //2 banks of 512k ram present only
    //var memConfig = 4; //1 banks of 512k ram present only

    self.setRamBanks = function (bankCount) {
        switch (bankCount) {
            case 1:
                memConfig = 4;
                break;
            case 2:
                memConfig = 5;
                break;
            default:
                memConfig = 4;
        }
    }

    self.reset = function () {

    }

    self.write = function (addr, val) {

        addr = addr & 0xffffff;

        if (addr == 0xFF8001) {
            //Memory configuration
            memConfig = val;
            return;
        }

        if (addr == 0xFF8201) {
            //Video base high			
            display.setDisplayStartHi(val);
            return;
        }

        if (addr == 0xFF8203) {
            //Video base Med			
            display.setDisplayStartMed(val);
            return;
        }

        if (addr == 0xFF820A) {
            //Sync mode	
            display.setSyncMode(val);
            return;
        }

        if (addr >= 0xFF8240 & addr < 0xFF8260) {
            display.writePaletteReg(addr - 0xFF8240, val);
            return;
        }

        if (addr == 0xFF8260) {
            display.writeScreenMode(val);
            return;
        }

        if (addr == 0xff8606) {
            dmaModeControl = (dmaModeControl & 0xff) | (val << 8);
            return;
        }

        if (addr == 0xff8607) {
            dmaModeControl = (dmaModeControl & 0xff00) | val;
            return;
        }

        if (addr == 0xff8604) {
            switch (dmaModeControl & 31) {
                case 0:
                    fdc.setCommandRegisterHi(val);
                    break;
                case 2:
                    //track select
                    fdc.setTrackRegisterHi(val);
                    break;
                case 4:
                    //sector select
                    fdc.setSectorRegisterHi(val);
                    break;
                case 6:
                    //data register
                    fdc.setDataRegisterHi(val);
                    break;
                case 16:
                    //sector count select
                    fdc.setSectorCountRegisterLo(val);
                    break;

            }
            return;
        }

        if (addr == 0xff8605) {
            switch (dmaModeControl & 31) {
                case 0:
                    fdc.setCommandRegisterLo(val);
                    break;
                case 2:
                    //track select
                    fdc.setTrackRegisterLo(val);
                    break;
                case 4:
                    //sector select
                    fdc.setSectorRegisterLo(val);
                    break;
                case 6:
                    //data register
                    fdc.setDataRegisterLo(val);
                    break;
                case 16:
                    //sector count select
                    fdc.setSectorCountRegisterLo(val);
                    break;
            }
            return;
        }

        if (addr == 0xff8609) {
            //dma address hi
            fdc.setDmaAddrHi(val);
            return;
        }

        if (addr == 0xff860b) {
            //dma address mid
            fdc.setDmaAddrMid(val);
            return;
        }

        if (addr == 0xff860d) {
            //dma address lo
            fdc.setDmaAddrLo(val);
            return;
        }

        if ((addr & 0xffff01) == 0xff8801) return;

        if ((addr & 0xffff03) == 0xff8800) {
            //PSG register select
            sound.selectRegister(val);
            return;
        }


        if ((addr & 0xffff03) == 0xff8802) {
            //PSG register write
            sound.writeRegister(val);
            return;
        }

        if ((addr & 0xFFFA00) == 0xFFFA00) {
            mfp.writeData(addr, val);
            return;
        }

        if (addr == 0xFFFC00) {
            //Keyboard ACIA control
            keyboard.setControl(val);
            return;
        }

        if (addr == 0xFFFC02) {
            //Keyboard ACIA data
            keyboard.processCommand(val);
            //bug.say(sprintf('ACIA (keyboard) write command $%02x', val));
            return;
        }

        if ((addr & 0xFFFF00) == 0xFF8900) {
            throw "memory error";
        }

        if ((addr & 0xFFFF00) == 0xFF8A00) {
            throw "memory error";
        }

        if ((addr & 1) == 0) return;

        bug.say(sprintf('invalid io write $%06x', addr));
    }

    self.read = function (addr) {
        addr = addr & 0xffffff;

        if (addr == 0xFF8001) {
            return memConfig;
        }

        if (addr == 0xFF8201) {
            //Video base high			
            return (display.getDisplayStart() & 0xff0000) >>> 16;
        }

        if (addr == 0xFF8203) {
            //Video base Med			
            return (display.getDisplayStart() & 0x00ff00) >>> 8;
        }

        if (addr == 0xFF8205) {
            //Video address counter high
            return (display.getCurrentAddress() & 0xff0000) >>> 16;
        }

        if (addr == 0xFF8207) {
            //Video address counter med 
            return (display.getCurrentAddress() & 0x00ff00) >>> 8;
        }

        if (addr == 0xFF8209) {
            //Video address counter low			
            return display.getCurrentAddress() & 0x0000ff;
        }

        if (addr == 0xFF820A) {
            //Sync mode	
            return display.getSyncMode();
        }

        if (addr >= 0xFF8240 & addr < 0xFF8260) {
            return display.readPaletteReg(addr - 0xFF8240);
        }

        if (addr == 0xFF8260) {
            return display.readScreenMode();
        }

        if (addr == 0xff8604) {
            return 0xff;
        }

        if (addr == 0xff8605) {
            switch (dmaModeControl & 15) {
                case 0:
                    //status register
                    return fdc.getDriveStatus() & 0xff;
                case 2:
                    //track select
                    return fdc.getTrackNo() & 0xff;
                case 4:
                    //sector select
                    return fdc.getSectorNo() & 0xff;
                case 6:
                    //data register
                    return fdc.getDataRegister() & 0xff;
                    /*case 16:
                    //sector count select
                    return fdc.getSectorCount() & 0xff;*/
            }
        }

        if (addr == 0xff8606) {
            return 0xff;
        }

        if (addr == 0xff8607) {
            return fdc.getDmaStatus() & 0xff;
        }

        if (addr == 0xff8609) {
            //dma address hi
            return (fdc.getDmaAddr() & 0xff0000) >>> 16;
        }

        if (addr == 0xff860b) {
            //dma address mid
            return (fdc.getDmaAddr() & 0xff00) >>> 8;
        }

        if (addr == 0xff860d) {
            //dma address lo
            return (fdc.getDmaAddr() & 0xff);
        }

        if (addr == 0xff8800) {
            //PSG register data
            return sound.readRegister();
        }

        if (addr == 0xff8802) {
            return 0xff;
        }


        if ((addr & 0xFFFA00) == 0xFFFA00) {
            return mfp.readData(addr);
        }

        if (addr == 0xFFFC00) {
            //Keyboard ACIA control
            return keyboard.readControl();

        }

        if (addr == 0xFFFC02) {
            //Keyboard ACIA data
            return keyboard.readData();
        }

        if (addr == 0xFFFC04) {
            //midi ACIA control
            return 2;
        }

        if (addr == 0xFFFC06) {
            //midi ACIA data
            return 0x00;
        }

        if ((addr & 0xFFFF00) == 0xFF8A00) {
            return; //return undefined
        }

        if ((addr & 0xFFFF00) == 0xFF8900) {
            return; //return undefined
        }

        bug.say(sprintf('invalid io read $%06x', addr));
        return 0xff;
    }


    /*self.loadSnapshot = function(buffer,offset) {
    //ier
    //isr
    //screen low 0xfe02)
    //screen high (0xfe03)
    //casette (0xfe04)
    //rom page - 0xfe05
    //current rom
    //fe06,fe07,fe08,fe09,fe0a,fe0b,fe0c,fe0d,fe0e,fe0f
    //4 bytes - number of 16mhz cycles since last display end interrupt

    self.write(0xfe00, buffer[offset+0]);
	
    //interrupt_status.nmi = false;
    //interrupt_status.high_tone = false;
    //interrupt_status.rtc = false;
    //interrupt_status.display_end = false;
    //interrupt_status.power_on = true;

	
		
    self.write(0xfe02, buffer[offset+2]);
    self.write(0xfe03, buffer[offset+3]);
    self.write(0xfe04, buffer[offset+4]);
    self.write(0xfe05, buffer[offset+5]);
    self.romBank = buffer[offset+6]&0xf;
    for (var i = 6; i<16; i++) {
    self.write(0xfe00+i, buffer[offset+i+1]);  //fe06,fe07,fe08,fe09,fe0a,fe0b,fe0c,fe0d,fe0e,fe0f
    }
		
		
    }*/

    self.setDisplay = function (d) {
        display = d;
    }

    return self;
}