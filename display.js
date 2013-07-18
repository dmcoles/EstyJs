// display emulation routines for EstyJs
// written by Darren Coles

EstyJs.Display = function (opts) {
    var self = {};

    var memory = opts.memory;
    var output = opts.output;

    var element = document.getElementById(output);
    var context = element.getContext("2d");

    var imageData = null;
    var buf = null;

    var buf8 = null;
    var data = null;

	var syncMode = 2; //50hz
	
	var screenMode = 0; //lo-res
	
    var screenStart = 0;
    var screenRowStart = 0;

	var palette8 = new Uint8Array(32);

	var paletteConverted = new Uint32Array(16);


	var widths = new Uint8Array([160,160,160]);
	
    var rowCount = 0;

    self.beamRow = 0;
    self.displayOn = true;

    var pixelIndex = 0;

    self.reset = function () {
    }
	
	function readPaletteValue(reg) {
		reg = reg <<1;
		return (palette8[reg] << 8) + palette8[reg+1];
	}
	
	function convertPalette() {
		for (var i=0; i<16; i++) {
			var c = readPaletteValue(i);
			var b = ((c & 0x7) << 1);//|1;
			var g = ((c & 0x70) <<1) >> 4;// | 0x10;
			var r = ((c & 0x700)<<1) >> 8;// | 0x100;
			
			paletteConverted[i] = (((r << 4) | r)) | (((g << 4) | g) << 8) | (((b << 4) | b) << 16) | 0xff000000;
		}
	}

    function optimisedScreenDraw() {

        var scrnAddr;

        var colour;
        var m;

		var m1,m2,m3,m4;
		
        var x = 0;
        var y = self.beamRow;

		convertPalette();

        switch (screenMode) {
            case 0:
				//lo-res
				scrnAddr = screenRowStart;
                for (x = 0; x < 20; x++) {
                    m1 = memory.readWord(scrnAddr, true);			
					m2 = memory.readWord(scrnAddr+2, true);			
                    m3 = memory.readWord(scrnAddr+4, true);			
					m4 = memory.readWord(scrnAddr+6, true);			
					scrnAddr+=8;
					
					colour = paletteConverted[((m1 & 0x8000) >> 15) | ((m2 & 0x8000) >> 14) | ((m3 & 0x8000) >> 13) | ((m4 & 0x8000) >> 12)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x4000) >> 14) | ((m2 & 0x4000) >> 13) | ((m3 & 0x4000) >> 12) | ((m4 & 0x4000) >> 11)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x2000) >> 13) | ((m2 & 0x2000) >> 12) | ((m3 & 0x2000) >> 11) | ((m4 & 0x2000) >> 10)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x1000) >> 12) | ((m2 & 0x1000) >> 11) | ((m3 & 0x1000) >> 10) | ((m4 & 0x1000) >> 9)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x800) >> 11) | ((m2 & 0x800) >> 10) | ((m3 & 0x800) >> 9) | ((m4 & 0x800) >> 8)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x400) >> 10) | ((m2 & 0x400) >> 9) | ((m3 & 0x400) >> 8) | ((m4 & 0x400) >> 7)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x200) >> 9) | ((m2 & 0x200) >> 8) | ((m3 & 0x200) >> 7) | ((m4 & 0x200) >> 6)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x100) >> 8) | ((m2 & 0x100) >> 7) | ((m3 & 0x100) >> 6) | ((m4 & 0x100) >> 5)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x80) >> 7) | ((m2 & 0x80) >> 6) | ((m3 & 0x80) >> 5) | ((m4 & 0x80) >> 4)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x40) >> 6) | ((m2 & 0x40) >> 5) | ((m3 & 0x40) >> 4) | ((m4 & 0x40) >> 3)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x20) >> 5) | ((m2 & 0x20) >> 4) | ((m3 & 0x20) >> 3 ) | ((m4 & 0x20) >> 2)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x10) >> 4) | ((m2 & 0x10) >> 3) | ((m3 & 0x10) >> 2) | ((m4 & 0x10) >> 1)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x8) >> 3) | ((m2 & 0x8) >> 2) | ((m3 & 0x8) >> 1) | ((m4 & 0x8))];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x4) >> 2) | ((m2 & 0x4) >> 1) | ((m3 & 0x4) ) | ((m4 & 0x4) << 1)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x2) >> 1) | ((m2 & 0x2) ) | ((m3 & 0x2) << 1) | ((m4 & 0x2) << 2)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x1) ) | ((m2 & 0x1) << 1) | ((m3 & 0x1) << 2) | ((m4 & 0x1) << 3)];			
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

					
					}				
				pixelIndex += 640;
               break;
            case 1:
				//med res
				scrnAddr = screenRowStart;
                for (x = 0; x < 40; x++) {
                    m1 = memory.readWord(scrnAddr, true);			
					m2 = memory.readWord(scrnAddr+2, true);			
					scrnAddr+=4;
					
					colour = paletteConverted[((m1 & 0x8000) >> 15) | ((m2 & 0x8000) >> 14)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x4000) >> 14) | ((m2 & 0x4000) >> 13)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x2000) >> 13) | ((m2 & 0x2000) >> 12)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x1000) >> 12) | ((m2 & 0x1000) >> 11)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x800) >> 11) | ((m2 & 0x800) >> 10)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x400) >> 10) | ((m2 & 0x400) >> 9)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x200) >> 9) | ((m2 & 0x200) >> 8)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x100) >> 8) | ((m2 & 0x100) >> 7)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x80) >> 7) | ((m2 & 0x80) >> 6)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x40) >> 6) | ((m2 & 0x40) >> 5)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x20) >> 5) | ((m2 & 0x20) >> 4)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x10) >> 4) | ((m2 & 0x10) >> 3)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x8) >> 3) | ((m2 & 0x8) >> 2)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x4) >> 2) | ((m2 & 0x4) >> 1)];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x2) >> 1) | ((m2 & 0x2) )];			
                    data[pixelIndex++] = colour;

					colour = paletteConverted[((m1 & 0x1)) | ((m2 & 0x1) << 1)];			
                    data[pixelIndex++] = colour;

					
					}				
				pixelIndex += 640;				
               break;
            case 2:
				//high res
				scrnAddr = screenRowStart;
                for (x = 0; x < 80; x++) {
                    m = memory.readByte(scrnAddr++, true);			
                    colour = paletteConverted[(m&0x80)>>7];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x40)>>6];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x20)>>5];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x10)>>4];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x8)>>3];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x4)>>2];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x2)>>1];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x1)];
                    data[pixelIndex++] = colour;
                }				
                for (x = 0; x < 80; x++) {
                    m = memory.readByte(scrnAddr++, true);			
                    colour = paletteConverted[(m&0x80)>>7];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x40)>>6];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x20)>>5];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x10)>>4];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x8)>>3];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x4)>>2];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x2)>>1];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m&0x1)];
                    data[pixelIndex++] = colour;
                }				
				break;

            default:
                break;
		}
    }

    function standardScreenDraw() {

        var scrnAddr;

        var colour;
        var m;

        var x = 0;
        var y = self.beamRow;

/*
        switch (sheila.screenMode) {
            case 0:
                for (x = 0; x < 640; x += 8) {
                    scrnAddr = screenRowStart + (x & 0xfff8);
                    if (scrnAddr > 32767) scrnAddr = scrnAddr - 0x5000;
                    m = memory.readByte(scrnAddr, true);

                    colour = colours[sheila.palette[(m & 128) >> 7]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 64) >> 6]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 32) >> 5]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 16) >> 4]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 8) >> 3]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 4) >> 2]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 2) >> 1]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 1)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                }
                break;
            case 1:
                for (x = 0; x < 320; x += 4) {
                    scrnAddr = screenRowStart + ((x & 0xfffc) << 1);
                    if (scrnAddr > 32767) scrnAddr = scrnAddr - 0x5000;
                    m = memory.readByte(scrnAddr, true);

                    colour = colours[sheila.palette[((m & 128) >> 6) | ((m & 8) >> 3)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[((m & 64) >> 5) | ((m & 4) >> 2)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[((m & 32) >> 4) | ((m & 2) >> 1)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[((m & 16) >> 3) | ((m & 1))]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                }
                break;
            case 2:
                for (x = 0; x < 160; x += 2) {
                    scrnAddr = screenRowStart + ((x & 0xfffe) << 2);
                    if (scrnAddr > 32767) scrnAddr = scrnAddr - 0x5000;
                    m = memory.readByte(scrnAddr, true);

                    colour = colours[sheila.palette[((m & 128) >> 4) | ((m & 32) >> 3) | ((m & 8) >> 2) | ((m & 2) >> 1)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = colours[sheila.palette[((m & 64) >> 3) | ((m & 16) >> 2) | ((m & 4) >> 1) | ((m & 1))]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                }
                break;


            case 3:
                for (x = 0; x < 640; x += 8) {
                    scrnAddr = screenRowStart + (x & 0xfff8);
                    if (scrnAddr > 32767) scrnAddr = scrnAddr - 0x5000;
                    m = memory.readByte(scrnAddr, true);

                    colour = colours[sheila.palette[(m & 128) >> 7]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 64) >> 6]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 32) >> 5]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 16) >> 4]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 8) >> 3]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 4) >> 2]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 2) >> 1]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 1)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                }
                break;
            case 4:
                for (x = 0; x < 320; x += 8) {
                    scrnAddr = screenRowStart + (x & 0xfff8);
                    if (scrnAddr > 32767) scrnAddr = scrnAddr - 0x2800;
                    m = memory.readByte(scrnAddr, true);
                    
                    colour = colours[sheila.palette[(m & 128) >> 7]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 64) >> 6]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 32) >> 5]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 16) >> 4]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 8) >> 3]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 4) >> 2]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 2) >> 1]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 1)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    
                }
                break;
            case 5:
                for (x = 0; x < 160; x += 4) {
                    scrnAddr = screenRowStart + ((x & 0xfffc) << 1);
                    if (scrnAddr > 32767) scrnAddr = scrnAddr - 0x2800;
                    m = memory.readByte(scrnAddr, true);

                    colour = colours[sheila.palette[((m & 128) >> 6) | ((m & 8) >> 3)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[((m & 64) >> 5) | ((m & 4) >> 2)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[((m & 32) >> 4) | ((m & 2) >> 1)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[((m & 16) >> 3) | (m & 1)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                }
                break;
            case 6:
            case 7:
                for (x = 0; x < 320; x += 8) {
                    scrnAddr = screenRowStart + (x & 0xfff8);
                    if (scrnAddr > 32767) scrnAddr = scrnAddr - 0x2000;
                    m = memory.readByte(scrnAddr, true);

                    colour = colours[sheila.palette[(m & 128) >> 7]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 64) >> 6]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 32) >> 5]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 16) >> 4]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 8) >> 3]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 4) >> 2]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 2) >> 1]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    colour = colours[sheila.palette[(m & 1)]];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                }
                break;
            default:
                break;
        }*/
    }

    self.startFrame = function () {

        if (imageData != null) {
            if (buf8 != null) imageData.data.set(buf8);
            context.putImageData(imageData, 0, 0); // at coords 0,0
        }

        imageData = context.createImageData(640, 512);

        if (typeof (imageData.data.set) != 'undefined') {
            buf = new ArrayBuffer(imageData.data.length);
            buf8 = new Uint8Array(buf);
            data = new Uint32Array(buf);
        }
        else {
            data = imageData.data;
        }

        self.beamRow = 0;
        screenRowStart = screenStart;
        rowCount = 0;

        pixelIndex = 0;
    }

    self.startRow = function () {
        if (self.beamRow <63 | self.beamRow >=263) {
            self.displayOn = false;
            return;
        }

        self.displayOn = true;


    }

    self.processRow = function () {

        if (self.beamRow <63 |  self.beamRow>=263) {
            self.beamRow++;
            return;
        }

        if (buf8 != null) {
            optimisedScreenDraw();
        }
        else {
            standardScreenDraw();
            pixelIndex += 2560;
        }


        screenRowStart += widths[screenMode];

        self.beamRow++
        rowCount++;
    }

	self.setDisplayStartHi = function(val) {
		screenStart = screenStart & 0x00ffff | val<<16;
	}
	
	self.setDisplayStartMed = function(val) {
		screenStart = screenStart & 0xff00ff | val<<8;	
	}
	
	self.getDisplayStart = function() {
		return screenStart;
	}

 	self.getCurrentAddress = function() {
		return screenRowStart;
	}
	
	self.getSyncMode = function() {
		return syncMode;
	}

	self.setSyncMode = function(val) {
		syncMode = val;
	}
	
	self.readPaletteReg = function(reg) {
		return palette8[reg];
	}

	self.writePaletteReg = function(reg,val) {
		palette8[reg] = val;
	}

	self.readScreenMode = function() {
		return screenMode;
	}
	
	self.writeScreenMode = function(val) {
		screenMode = val;
	}
	
	self.setSnapshotRegs = function(data) {
		screenStart = data.screenAddr;
		
		screenMode = data.screenMode;
		
		for (var i=0; i<32; i++) {
			palette8[i] = data.palette[i];
		}
	}

	return self;
}