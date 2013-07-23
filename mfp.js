// mfp emulation routines for EstyJS
// written by Darren Coles

EstyJs.mfp = function (opts) {
    var self = {};

    var clockCyclesPerSecond = 2451134;

    var clockCyclesPerCpuCycle = 8000000 / clockCyclesPerSecond;

    var display = null;
    var bug = opts.bug;

    var gpio = 0x20;

    var monoMonitor = false;

    var autoInterruptEnd = false;

    var timerAcontrol = 0;
    var timerBcontrol = 0;
    var timerCcontrol = 0;
    var timerDcontrol = 0;

    var timerAdata = 0;
    var timerBdata = 0;
    var timerCdata = 0;
    var timerDdata = 0;

    var timerAcntr = 0;
    var timerBcntr = 0;
    var timerCcntr = 0;
    var timerDcntr = 0;

    var timerAcntr2 = 0;
    var timerBcntr2 = 0;
    var timerCcntr2 = 0;
    var timerDcntr2 = 0;

    var timerAdiv = 1;
    var timerBdiv = 1;
    var timerCdiv = 1;
    var timerDdiv = 1;

    var interruptEnableA = 0;
    var interruptEnableB = 0;
    var interruptPendingA = 0;
    var interruptPendingB = 0;
    var interruptInServiceA = 0;
    var interruptInServiceB = 0;
    var interruptMaskA = 0;
    var interruptMaskB = 0;

    var activeEdge = 0;

    self.writeData = function (addr, val) {

        if (addr == 0xFFFA01) {
            gpio = val;
			return;
        }

        if (addr == 0xFFFA03) {
            activeEdge = val;
            return;
        }

        if (addr == 0xFFFA07) {
            interruptEnableA = val;
            return;
        }


        if (addr == 0xFFFA09) {
            interruptEnableB = val;
            return;
        }

        if (addr == 0xFFFA0B) {
            interruptPendingA &= val;
            return;
        }

        if (addr == 0xFFFA0D) {
            interruptPendingB &= val;
            return;
        }

        if (addr == 0xFFFA0F) {
            interruptInServiceA = val;
            return;
        }

        if (addr == 0xFFFA11) {
            interruptInServiceB = val;
            return;
        }

        if (addr == 0xFFFA13) {
            interruptMaskA = val;
            return;
        }

        if (addr == 0xFFFA15) {
            interruptMaskB = val;
            return;
        }

        if (addr == 0xFFFA17) {
            autoInterruptEnd = ((val & 8) == 0);
            return;
        }


        if (addr == 0xFFFA19) {
            //timer A control
            timerAcontrol = val;
            switch (val) {
                case 0:
                    timerAcntr2 = 0;
                    timerAdiv = 1;
                    break;
                case 1:
                    timerAdiv = 4;
                    break;
                case 2:
                    timerAdiv = 10;
                    break;
                case 3:
                    timerAdiv = 16;
                    break;
                case 4:
                    timerAdiv = 50;
                    break;
                case 5:
                    timerAdiv = 64;
                    break;
                case 6:
                    timerAdiv = 100;
                    break;
                case 7:
                    timerAdiv = 200;
                    break;
                case 8:
                    timerAdiv = 1;
                    break;
            }
            return;
        }

        if (addr == 0xFFFA1B) {
            //timer B control
            timerBcontrol = val;
            switch (val) {
                case 0:
                    timerBcntr2 = 0;
                    timerBdiv = 1;
                    break;
                case 1:
                    timerBdiv = 4;
                    break;
                case 2:
                    timerBdiv = 10;
                    break;
                case 3:
                    timerBdiv = 16;
                    break;
                case 4:
                    timerBdiv = 50;
                    break;
                case 5:
                    timerBdiv = 64;
                    break;
                case 6:
                    timerBdiv = 100;
                    break;
                case 7:
                    timerBdiv = 200;
                    break;
                case 8:
                    timerBdiv = 1;
            }
            return;
        }

        if (addr == 0xFFFA1F) {
            //timer A data
            timerAdata = val;
            timerAcntr = val;
            timerAcntr2 = 0;
            return;
        }

        if (addr == 0xFFFA21) {
            //timer B data
            timerBdata = val;
            timerBcntr = val;
            timerBcntr2 = 0;
            return;
        }

        if (addr == 0xFFFA1D) {
            //timer C + D control
            timerDcontrol = val & 7;
            timerCcontrol = (val & 0x70) >> 4;

            switch (timerCcontrol) {
                case 0:
                    timerCcntr2 = 0;
                    timerCdiv = 1;
                    break;
                case 1:
                    timerCdiv = 4;
                    break;
                case 2:
                    timerCdiv = 10;
                    break;
                case 3:
                    timerCdiv = 16;
                    break;
                case 4:
                    timerCdiv = 50;
                    break;
                case 5:
                    timerCdiv = 64;
                    break;
                case 6:
                    timerCdiv = 100;
                    break;
                case 7:
                    timerCdiv = 200;
                    break;
            }
            switch (timerDcontrol) {
                case 0:
                    timerDcntr2 = 0;
                    timerDdiv = 1;
                    break;
                case 1:
                    timerDdiv = 4;
                    break;
                case 2:
                    timerDdiv = 10;
                    break;
                case 3:
                    timerDdiv = 16;
                    break;
                case 4:
                    timerDdiv = 50;
                    break;
                case 5:
                    timerDdiv = 64;
                    break;
                case 6:
                    timerDdiv = 100;
                    break;
                case 7:
                    timerDdiv = 200;
                    break;
            }
            return;
        }

        if (addr == 0xFFFA23) {
            //timer C data
            timerCdata = val;
            timerCcntr = val;
            timerCcntr2 = 0;
            return;
        }

        if (addr == 0xFFFA25) {
            //timer D data
            timerDdata = val;
            timerDcntr = val;
            timerDcntr2 = 0;
            return;
        }

        bug.say(sprintf('invalid mfp write $%06x', addr));

    }

    self.readData = function (addr, val) {

        if (addr == 0xFFFA01) {
            return (gpio & 0x20) | (((interruptInServiceA | interruptInServiceB) != 0) ? 16 : 0) | (monoMonitor ? 0 : 0x80);
        }

        if (addr == 0xFFFA03) {
            return activeEdge;
        }

        if (addr == 0xFFFA07) {
            return interruptEnableA;
        }


        if (addr == 0xFFFA09) {
            return interruptEnableB;
        }

        if (addr == 0xFFFA0B) {
            return interruptPendingA;
        }

        if (addr == 0xFFFA0D) {
            return interruptPendingB;
        }

        if (addr == 0xFFFA0F) {
            return interruptInServiceA;
        }

        if (addr == 0xFFFA11) {
            return interruptInServiceB;
        }

        if (addr == 0xFFFA13) {
            return interruptMaskA;
        }

        if (addr == 0xFFFA15) {
            return interruptMaskB;
        }

        if (addr == 0xFFFA17) {
            return autoInterruptEnd ? 8 : 0;
        }


        if (addr == 0xFFFA19) {
            //timer A control
            return timerAcontrol;
        }

        if (addr == 0xFFFA1B) {
            //timer B control
            return timerBcontrol;
        }

        if (addr == 0xFFFA1F) {
            //timer A data
            return timerAcntr;
        }

        if (addr == 0xFFFA21) {
            //timer B data
            return timerBcntr;
        }

        if (addr == 0xFFFA1D) {
            //timer C + D control
            return timerDcontrol | (timerCcontrol << 4)
        }

        if (addr == 0xFFFA23) {
            //timer C data
            return timerCcntr;
        }

        if (addr == 0xFFFA25) {
            //timer D data
            return timerDcntr;
        }

        bug.say(sprintf('invalid mfp read $%06x', addr));
        return 0x00;

    }

    self.startRow = function () {

        //event count or pulse width
        /*if (timerAcontrol >=8 && display.displayOn) {
        timerAcntr2++;
        if (timerAcntr2>=timerAdiv) {
        timerAcntr2 = 0;
        timerAcntr = (timerAcntr-1)&0xff;
			
        //do event when timer A reaches 0
        if (timerAcntr==0) {
        timerAcntr = timerAdata;
					
        if ((interruptEnableA & 32)!=0) {
        self.interruptRequest(13);
        }
        }
        }
        }

        //event count or pulse width
        if (timerBcontrol >=8 && display.displayOn) {
        timerBcntr2++;
        if (timerBcntr2>=timerBdiv) {
        timerBcntr2 = 0;
        timerBcntr = (timerBcntr-1)&0xff;
			
        //do event when timer B reaches 0
        if (timerBcntr==0) {
        timerBcntr = timerBdata;
					
        if ((interruptEnableA & 1)!=0) {
        self.interruptRequest(8);
        }
        }
        }
        }
        */

        if (timerAcontrol > 0 && timerAcontrol < 8) {
            timerAcntr2 += 512;

            while (timerAcntr2 >= timerAdiv * clockCyclesPerCpuCycle) {
                timerAcntr2 -= timerAdiv * clockCyclesPerCpuCycle;
                timerAcntr = (timerAcntr - 1) & 0xff;


                //do event when timer A reaches 0
                if (timerAcntr == 0) {
                    timerAcntr = timerAdata;

                    if ((interruptEnableA & 32) != 0) {
                        self.interruptRequest(13);
                    }
                }
            }
        }

        if (timerBcontrol > 0 && timerBcontrol < 8) {
            timerBcntr2 += 512;

            while (timerBcntr2 >= timerBdiv * clockCyclesPerCpuCycle) {
                timerBcntr2 -= timerBdiv * clockCyclesPerCpuCycle;
                timerBcntr = (timerBcntr - 1) & 0xff;


                //do event when timer B reaches 0
                if (timerBcntr == 0) {
                    timerBcntr = timerBdata;

                    if ((interruptEnableA & 1) != 0) {
                        self.interruptRequest(8);
                    }
                }
            }
        }

        if (timerCcontrol > 0) {
            timerCcntr2 += 512;

            while (timerCcntr2 >= timerCdiv * clockCyclesPerCpuCycle) {
                timerCcntr2 -= timerCdiv * clockCyclesPerCpuCycle;
                timerCcntr = (timerCcntr - 1) & 0xff;


                //do event when timer C reaches 0
                if (timerCcntr == 0) {
                    timerCcntr = timerCdata;

                    if ((interruptEnableB & 0x20) != 0) {
                        self.interruptRequest(5);
                    }
                }
            }
        }

        if (timerDcontrol > 0) {
            timerDcntr2 += 512;

            while (timerDcntr2 >= timerDdiv * clockCyclesPerCpuCycle) {
                timerDcntr2 -= timerDdiv * clockCyclesPerCpuCycle;
                timerDcntr = (timerDcntr - 1) & 0xff;


                //do event when timer C reaches 0
                if (timerDcntr == 0) {
                    timerDcntr = timerDdata;

                    if ((interruptEnableB & 0x10) != 0) {
                        self.interruptRequest(4);
                    }
                }
            }
        }
    }

    self.endRow = function () {
        //event count or pulse width
        if (timerAcontrol >= 8 && display.displayOn) {
            timerAcntr2++;
            if (timerAcntr2 >= timerAdiv) {
                timerAcntr2 = 0;
                timerAcntr = (timerAcntr - 1) & 0xff;

                //do event when timer A reaches 0
                if (timerAcntr == 0) {
                    timerAcntr = timerAdata;

                    if ((interruptEnableA & 32) != 0) {
                        self.interruptRequest(13);
                    }
                }
            }
        }

        //event count or pulse width
        if (timerBcontrol >= 8 && display.displayOn) {
            timerBcntr2++;
            if (timerBcntr2 >= timerBdiv) {
                timerBcntr2 = 0;
                timerBcntr = (timerBcntr - 1) & 0xff;

                //do event when timer B reaches 0
                if (timerBcntr == 0) {
                    timerBcntr = timerBdata;

                    if ((interruptEnableA & 1) != 0) {
                        self.interruptRequest(8);
                    }
                }
            }
        }

    }

    self.setDisplay = function (d) {
        display = d;
    }


    self.interruptRequest = function (lvl) {

        switch (lvl) {
            //timer D interrupt   
            case 4:
                if (interruptEnableB & interruptMaskB & 0x10) {
                    interruptPendingB |= 0x10;
                }
                break;
            //timer C interrupt   
            case 5:
                if (interruptEnableB & interruptMaskB & 0x20) {
                    interruptPendingB |= 0x20;
                }
                break;
            //acia (keyboard & midi)   
            case 6:
                if (interruptEnableB & interruptMaskB & 0x40) {
                    interruptPendingB |= 0x40;
                }
                break;
            //floppy   
            case 7:
                if (interruptEnableB & interruptMaskB & 0x80) {
                    interruptPendingB |= 0x80;
                }
                break;

            //timer B interrupt   
            case 8:
                if (interruptEnableA & interruptMaskA & 1) {
                    interruptPendingA |= 1;
                }
                break;
            //timer A interrupt   
            case 13:
                if (interruptEnableA & interruptMaskA & 0x20) {
                    interruptPendingA |= 0x20;
                }
                break;
        }
    }

    self.doInterrupts = function (processor) {
        if ((interruptPendingA & (~interruptInServiceA)) | (interruptPendingB & (~interruptInServiceB))) {
            //if (interruptPendingA | interruptPendingB) & {
            processor.mfpInterrupt();
        }
    }

    self.setFloppyGpio = function () {
        gpio |= 32;
    }

    self.clearFloppyGpio = function () {
        gpio &= 223;
    }


    self.getInterrupt = function () {
        var x = 0x80;
        var n = 15;
        while (x > 0) {
            if ((interruptPendingA & x) && ((interruptInServiceA & x) == 0)) {
                if (!autoInterruptEnd) interruptInServiceA |= x;
                interruptPendingA ^= x;

                return n;
            }
            n--;
            x >>= 1;
        }
        x = 0x80;
        while (x > 0) {
            if ((interruptPendingB & x) && ((interruptInServiceB & x) == 0)) {
                if (!autoInterruptEnd) interruptInServiceB |= x;
                interruptPendingB ^= x;
                return n;
            }
            n--;
            x >>= 1;
        }

        return undefined;
    }

    self.setSnapshotRegs = function (regs) {
        //for (var i = 0; i<regs.length; i++) {
        //	self.writeData(0xfffa01+(i<<1),regs[i]);
        //}

        self.writeData(0xfffa01, regs[0]);
        self.writeData(0xfffa03, regs[1]);
        self.writeData(0xfffa05, regs[2]);
        self.writeData(0xfffa07, regs[3]);
        self.writeData(0xfffa09, regs[4]);
        self.writeData(0xfffa0b, regs[5]);
        self.writeData(0xfffa0d, regs[6]);
        self.writeData(0xfffa0f, regs[7]);
        self.writeData(0xfffa11, regs[8]);
        self.writeData(0xfffa13, regs[9]);
        self.writeData(0xfffa15, regs[10]);
        self.writeData(0xfffa17, regs[11]);
        self.writeData(0xfffa19, regs[12]);
        self.writeData(0xfffa1b, regs[13]);
        self.writeData(0xfffa1d, regs[14]);
        self.writeData(0xfffa1f, regs[15]);
        self.writeData(0xfffa21, regs[16]);
        self.writeData(0xfffa23, regs[17]);
        self.writeData(0xfffa25, regs[18]);


    }

    return self;
}