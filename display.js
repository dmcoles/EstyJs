// display emulation routines for EstyJs
// written by Darren Coles
"use strict";

EstyJs.Display = function (opts) {
    var self = {};

    var memory = opts.memory;
    var ramDv = memory.getRamDv();
    var output = opts.output;
    var fdc = opts.fdc;
    var processor = opts.processor;

    var flipFlop = false;

    var element = document.getElementById(output);
    var context = element.getContext("2d");

    var imageData = context.createImageData(640, 512);

    var bigEndian = false;

    var buf8 = null;
    var data = null;

    if (typeof (imageData.data) != 'undefined') {
        buf8 = new Uint8Array(imageData.data.buffer);
        data = new Uint32Array(imageData.data.buffer);

        data[0] = 0x01020304;
        if (buf8[0] = 0x04) {
            bigEndian = false;
        } else {
            bigEndian = true;
        }

    }
    else {
        data = imageData.data;
    }


    var syncMode = 2; //50hz

    var screenMode = 0; //lo-res

    var screenStart = 0;
    var screenRowStart = 0;

    var palette8 = new Uint8Array(32);

    var paletteConverted = new Uint32Array(16);

    var frameRate = 0;

    var frameSkip = false;

    var showSpeedPct = false;

    var widths = new Uint8Array([160, 160, 160]);

    var rowCount = 0;

    self.beamRow = 0;
    self.displayOn = true;

    var pixelIndex = 0;

    self.reset = function () {
    }

    function readPaletteValue(reg) {
        reg = reg << 1;
        return (palette8[reg] << 8) + palette8[reg + 1];
    }

    function convertPalette() {
        for (var i = 0; i < 16; i++) {
            var c = readPaletteValue(i);
            var b = ((c & 0x7) << 1); //|1;
            var g = ((c & 0x70) << 1) >> 4; // | 0x10;
            var r = ((c & 0x700) << 1) >> 8; // | 0x100;

            if (bigEndian) {
                paletteConverted[i] = (((r << 4) | r) << 24) | (((g << 4) | g) << 16) | (((b << 4) | b) << 8) | 0x000000ff;
            } else {
                paletteConverted[i] = (((r << 4) | r)) | (((g << 4) | g) << 8) | (((b << 4) | b) << 16) | 0xff000000;
            }
        }
    }

    function optimisedScreenDraw() {

        var scrnAddr;

        var colour;
        var m;

        var m1, m2;

        var x = 0;
        var y = self.beamRow;

        //convertPalette();

        switch (screenMode & 3) {
            case 0:
                //lo-res
                scrnAddr = screenRowStart;
                for (x = 0; x < 20; x++) {
                    //m1 = memory.readLong(scrnAddr);
                    //m2 = memory.readLong(scrnAddr + 4);
                    m1 = ramDv.getInt32(scrnAddr, false);
                    m2 = ramDv.getInt32(scrnAddr + 4,false);
                    scrnAddr += 8;

                    colour = paletteConverted[((m1 & 0x80000000) >>> 31) | ((m1 & 0x8000) >> 14) | ((m2 & 0x80000000) >>> 29) | ((m2 & 0x8000) >> 12)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x40000000) >> 30) | ((m1 & 0x4000) >> 13) | ((m2 & 0x40000000) >> 28) | ((m2 & 0x4000) >> 11)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x20000000) >> 29) | ((m1 & 0x2000) >> 12) | ((m2 & 0x20000000) >> 27) | ((m2 & 0x2000) >> 10)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x10000000) >> 28) | ((m1 & 0x1000) >> 11) | ((m2 & 0x10000000) >> 26) | ((m2 & 0x1000) >> 9)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x8000000) >> 27) | ((m1 & 0x800) >> 10) | ((m2 & 0x8000000) >> 25) | ((m2 & 0x800) >> 8)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x4000000) >> 26) | ((m1 & 0x400) >> 9) | ((m2 & 0x4000000) >> 24) | ((m2 & 0x400) >> 7)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x2000000) >> 25) | ((m1 & 0x200) >> 8) | ((m2 & 0x2000000) >> 23) | ((m2 & 0x200) >> 6)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x1000000) >> 24) | ((m1 & 0x100) >> 7) | ((m2 & 0x1000000) >> 22) | ((m2 & 0x100) >> 5)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x800000) >> 23) | ((m1 & 0x80) >> 6) | ((m2 & 0x800000) >> 21) | ((m2 & 0x80) >> 4)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x400000) >> 22) | ((m1 & 0x40) >> 5) | ((m2 & 0x400000) >> 20) | ((m2 & 0x40) >> 3)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x200000) >> 21) | ((m1 & 0x20) >> 4) | ((m2 & 0x200000) >> 19) | ((m2 & 0x20) >> 2)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x100000) >> 20) | ((m1 & 0x10) >> 3) | ((m2 & 0x100000) >> 18) | ((m2 & 0x10) >> 1)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x80000) >> 19) | ((m1 & 0x8) >> 2) | ((m2 & 0x80000) >> 17) | ((m2 & 0x8))];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x40000) >> 18) | ((m1 & 0x4) >> 1) | ((m2 & 0x40000) >> 16) | ((m2 & 0x4) << 1)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x20000) >> 17) | ((m1 & 0x2)) | ((m2 & 0x20000) >> 15) | ((m2 & 0x2) << 2)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x10000) >> 16) | ((m1 & 0x1) << 1) | ((m2 & 0x10000) >> 14) | ((m2 & 0x1) << 3)];
                    data[pixelIndex++] = colour;
                    data[pixelIndex++] = colour;


                }
                pixelIndex += 640;
                break;
            case 1:
                //med res
                scrnAddr = screenRowStart;
                for (x = 0; x < 40; x++) {
                    //m1 = memory.readLong(scrnAddr);
                    m1 = ramDv.getInt32(scrnAddr, false);

                    scrnAddr += 4;

                    colour = paletteConverted[((m1 & 0x80000000) >>> 31) | ((m1 & 0x8000) >> 14)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x40000000) >> 30) | ((m1 & 0x4000) >> 13)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x20000000) >> 29) | ((m1 & 0x2000) >> 12)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x10000000) >> 28) | ((m1 & 0x1000) >> 11)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x8000000) >> 27) | ((m1 & 0x800) >> 10)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x4000000) >> 26) | ((m1 & 0x400) >> 9)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x2000000) >> 25) | ((m1 & 0x200) >> 8)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x1000000) >> 24) | ((m1 & 0x100) >> 7)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x800000) >> 23) | ((m1 & 0x80) >> 6)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x400000) >> 22) | ((m1 & 0x40) >> 5)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x200000) >> 21) | ((m1 & 0x20) >> 4)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x100000) >> 20) | ((m1 & 0x10) >> 3)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x80000) >> 19) | ((m1 & 0x8) >> 2)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x40000) >> 18) | ((m1 & 0x4) >> 1)];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x20000) >> 17) | ((m1 & 0x2))];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[((m1 & 0x10000) >> 16) | ((m1 & 0x1) << 1)];
                    data[pixelIndex++] = colour;


                }
                pixelIndex += 640;
                break;
            case 2:
                //high res
                scrnAddr = screenRowStart;
                for (x = 0; x < 80; x++) {
                    m = memory.readByte(scrnAddr++);
                    colour = paletteConverted[(m & 0x80) >> 7];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x40) >> 6];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x20) >> 5];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x10) >> 4];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x8) >> 3];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x4) >> 2];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x2) >> 1];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x1)];
                    data[pixelIndex++] = colour;
                }
                for (x = 0; x < 80; x++) {
                    m = memory.readByte(scrnAddr++);
                    colour = paletteConverted[(m & 0x80) >> 7];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x40) >> 6];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x20) >> 5];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x10) >> 4];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x8) >> 3];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x4) >> 2];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x2) >> 1];
                    data[pixelIndex++] = colour;

                    colour = paletteConverted[(m & 0x1)];
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

        var m1, m2;

        var x = 0;
        var y = self.beamRow;

        //convertPalette();

        switch (screenMode & 3) {
            case 0:
                //lo-res
                scrnAddr = screenRowStart;
                for (x = 0; x < 20; x++) {
                    m1 = memory.readLong(scrnAddr);
                    m2 = memory.readLong(scrnAddr + 4);
                    scrnAddr += 8;

                    colour = paletteConverted[((m1 & 0x80000000) >>> 31) | ((m1 & 0x8000) >> 14) | ((m2 & 0x80000000) >>> 29) | ((m2 & 0x8000) >> 12)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x40000000) >> 30) | ((m1 & 0x4000) >> 13) | ((m2 & 0x40000000) >> 28) | ((m2 & 0x4000) >> 11)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x20000000) >> 29) | ((m1 & 0x2000) >> 12) | ((m2 & 0x20000000) >> 27) | ((m2 & 0x2000) >> 10)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x10000000) >> 28) | ((m1 & 0x1000) >> 11) | ((m2 & 0x10000000) >> 26) | ((m2 & 0x1000) >> 9)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x8000000) >> 27) | ((m1 & 0x800) >> 10) | ((m2 & 0x8000000) >> 25) | ((m2 & 0x800) >> 8)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x4000000) >> 26) | ((m1 & 0x400) >> 9) | ((m2 & 0x4000000) >> 24) | ((m2 & 0x400) >> 7)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x2000000) >> 25) | ((m1 & 0x200) >> 8) | ((m2 & 0x2000000) >> 23) | ((m2 & 0x200) >> 6)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x1000000) >> 24) | ((m1 & 0x100) >> 7) | ((m2 & 0x1000000) >> 22) | ((m2 & 0x100) >> 5)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x800000) >> 23) | ((m1 & 0x80) >> 6) | ((m2 & 0x800000) >> 21) | ((m2 & 0x80) >> 4)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x400000) >> 22) | ((m1 & 0x40) >> 5) | ((m2 & 0x400000) >> 20) | ((m2 & 0x40) >> 3)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x200000) >> 21) | ((m1 & 0x20) >> 4) | ((m2 & 0x200000) >> 19) | ((m2 & 0x20) >> 2)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x100000) >> 20) | ((m1 & 0x10) >> 3) | ((m2 & 0x100000) >> 18) | ((m2 & 0x10) >> 1)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x80000) >> 19) | ((m1 & 0x8) >> 2) | ((m2 & 0x80000) >> 17) | ((m2 & 0x8))];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x40000) >> 18) | ((m1 & 0x4) >> 1) | ((m2 & 0x40000) >> 16) | ((m2 & 0x4) << 1)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x20000) >> 17) | ((m1 & 0x2)) | ((m2 & 0x20000) >> 15) | ((m2 & 0x2) << 2)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x10000) >> 16) | ((m1 & 0x1) << 1) | ((m2 & 0x10000) >> 14) | ((m2 & 0x1) << 3)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;


                }
                pixelIndex += 2560;
                break;
            case 1:
                //med res
                scrnAddr = screenRowStart;
                for (x = 0; x < 40; x++) {
                    m1 = memory.readLong(scrnAddr, true);
                    scrnAddr += 4;

                    colour = paletteConverted[((m1 & 0x80000000) >>> 31) | ((m1 & 0x8000) >> 14)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x40000000) >> 30) | ((m1 & 0x4000) >> 13)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x20000000) >> 29) | ((m1 & 0x2000) >> 12)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x10000000) >> 28) | ((m1 & 0x1000) >> 11)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x8000000) >> 27) | ((m1 & 0x800) >> 10)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x4000000) >> 26) | ((m1 & 0x400) >> 9)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x2000000) >> 25) | ((m1 & 0x200) >> 8)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x1000000) >> 24) | ((m1 & 0x100) >> 7)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x800000) >> 23) | ((m1 & 0x80) >> 6)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x400000) >> 22) | ((m1 & 0x40) >> 5)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x200000) >> 21) | ((m1 & 0x20) >> 4)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x100000) >> 20) | ((m1 & 0x10) >> 3)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x80000) >> 19) | ((m1 & 0x8) >> 2)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x40000) >> 18) | ((m1 & 0x4) >> 1)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x20000) >> 17) | ((m1 & 0x2))];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[((m1 & 0x10000) >> 16) | ((m1 & 0x1) << 1)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;


                }
                pixelIndex += 2560;
                break;
            case 2:
                //high res
                scrnAddr = screenRowStart;
                for (x = 0; x < 80; x++) {
                    m = memory.readByte(scrnAddr++, true);
                    colour = paletteConverted[(m & 0x80) >> 7];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x40) >> 6];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x20) >> 5];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x10) >> 4];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x8) >> 3];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x4) >> 2];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x2) >> 1];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x1)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                }
                for (x = 0; x < 80; x++) {
                    m = memory.readByte(scrnAddr++, true);
                    colour = paletteConverted[(m & 0x80) >> 7];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x40) >> 6];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x20) >> 5];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x10) >> 4];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x8) >> 3];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x4) >> 2];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x2) >> 1];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;

                    colour = paletteConverted[(m & 0x1)];
                    data[pixelIndex++] = colour & 0xff;
                    data[pixelIndex++] = (colour & 0xff00) >> 8;
                    data[pixelIndex++] = (colour & 0xff0000) >> 16;
                    data[pixelIndex++] = 255;
                }
                break;

            default:
                break;
        }
    }

    self.startFrame = function () {

        flipFlop = !flipFlop;

        if (!frameSkip) flipFlop = true;

        if (flipFlop) {
            if (imageData != null) {
                //if (buf8 != null) imageData.data.set(buf8);
                context.putImageData(imageData, 0, 0); // at coords 0,0

                var text = fdc.getDisplayData();

                context.fillStyle = "White";
                context.font = "bold 16px Arial";
                if (text.length > 0) {
                    context.fillText(text[0], 600, 380);
                }
                if (text.length > 1) {
                    context.fillText(text[1], 600, 395);
                }

                if (showSpeedPct) context.fillText(frameRate.toFixed(2) + "%", 10, 15);

            }

        }

        self.beamRow = 0;
        screenRowStart = screenStart;
        rowCount = 0;

        pixelIndex = 0;
    }

    self.startRow = function () {
        if (self.beamRow < 63 | self.beamRow >= 263) {
            self.displayOn = false;
            return;
        }

        self.displayOn = true;

        convertPalette();

    }

    self.processRow = function () {

        if (self.beamRow < 63 | self.beamRow >= 263) {
            self.beamRow++;
            return;
        }

        if (screenRowStart < 0xfffff && (flipFlop)) {
            if (buf8 != null) {
                optimisedScreenDraw();
            }
            else {
                standardScreenDraw();
            }
        }


        screenRowStart += widths[screenMode & 3];

        self.beamRow++
        rowCount++;
    }

    self.setDisplayStartHi = function (val) {
        screenStart = screenStart & 0x00ffff | val << 16;
    }

    self.setDisplayStartMed = function (val) {
        screenStart = screenStart & 0xff00ff | val << 8;
    }

    self.getDisplayStart = function () {
        return screenStart;
    }

    self.getCurrentAddress = function () {
        return screenRowStart + ((Math.min(320, Math.max(0, processor.getRowCycleCount() - 68)) >> 2) << 1);
    }

    self.getSyncMode = function () {
        return syncMode;
    }

    self.setSyncMode = function (val) {
        syncMode = val;
    }

    self.readPaletteReg = function (reg) {
        return palette8[reg];
    }

    self.writePaletteReg = function (reg, val) {
        palette8[reg] = val;
    }

    self.readScreenMode = function () {
        return screenMode;
    }

    self.writeScreenMode = function (val) {
        screenMode = val;
    }

    self.setFrameRate = function (val) {
        frameRate = val;
    }

    self.setFrameSkip = function (val) {
        frameSkip = val;
    }

    self.setShowSpeedPct = function (val) {
        showSpeedPct = val;
    }

    self.setSnapshotRegs = function (data) {
        screenStart = data.screenAddr;

        screenMode = data.screenMode;

        for (var i = 0; i < 32; i++) {
            palette8[i] = data.palette[i];
        }
    }

    return self;
}