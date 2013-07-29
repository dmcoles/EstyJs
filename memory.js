// memory emulation routines for EstyJs
// written by Darren Coles

EstyJs.Memory = function (opts) {
    var self = {};

    var defaultRamsize=1024*1024;
    //var defaultRamsize = 512 * 1024;
    var romsize = 128 * 1024;
    var ram = new Uint8Array(defaultRamsize);
    var rom = new Uint8Array(romsize);

    var io = opts.io;
    var bug = opts.bug;


    var processor = null;

    self.loaded = 0;

    function load_binary_resource(url) {

        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";

        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                rom = new Uint8Array(arrayBuffer);
                self.loaded++;
            }
        };

        oReq.send(null);
    }


    load_binary_resource('./tos.img');

    self.readByte = function (addr) {
        //0 - 00CFFFFF max 14mb of ram
        //$00E00000 - 00F0003F system rom
        //00F00040 - 00F9FFFF illegal addres
        //00FA0000 - 00FBFFFF cartridge rom
        //00FC0000 - FEFFFF - system rom
        //00FF0000 - FFFFFF - memory mapped registers

        addr = addr & 0xffffff;

        //mirror first 8 bytes of rom at 0
        if (addr < 8) {
            return rom[addr];
        }

        if (addr < ram.length) {
            return ram[addr];
        }

        if (addr > 0xe00000 & addr < 0xf00040) {
            //system rom
            return rom[addr & 0x3ffff];
            //return 0xff;
        }

        if (addr >= 0xf00040 & ram <= 0xf9ffff) {
            //illegal
            processor.memoryError(addr);
        }

        if (addr >= 0xfa0000 & ram <= 0xfc0000) {
            //cartridge rom
            return 0xff;
        }

        if (addr >= 0xfc0000 & addr < 0xff0000) {
            return rom[addr & 0x3ffff];
        }

        if (addr >= 0xff0000) {
            var m = io.read(addr);
            if (m == undefined) processor.memoryError(addr);
            return m;
        }

        return 0;

    }

    self.readWord = function (addr) {
        return ((self.readByte(addr) << 8) + (self.readByte(addr + 1))) & 0xffff;
    }

    self.readLong = function (addr) {
        return ((self.readByte(addr) << 24) + (self.readByte(addr + 1) << 16) + (self.readByte(addr + 2) << 8) + (self.readByte(addr + 3))) & 0xffffffff;
    }

    self.writeByte = function (addr, val) {
        val = val & 0xff;
        addr = addr & 0xffffff;
        if (addr < ram.length) {
            ram[addr] = val;
        }
        else if ((addr & 0xFF0000) == 0xFF0000) {
            io.write(addr, val);
        }
        else {
            //bug.say(sprintf('invalid memory write $%08x', addr));
        }

    }

    self.writeWord = function (addr, val) {
        self.writeByte(addr, (val >>> 8) & 0xff);
        self.writeByte(addr + 1, val & 0xff);
    }

    self.writeLong = function (addr, val) {
        self.writeByte(addr, (val >>> 24) & 0xff);
        self.writeByte(addr + 1, (val >>> 16) & 0xff);
        self.writeByte(addr + 2, (val >>> 8) & 0xff);
        self.writeByte(addr + 3, val & 0xff);
    }

    self.loadSnapshot = function (buffer, offset, datalen) {
        //ignore anything that isnt a ram snapshot
        if (buffer[offset + 0] != 0) return;

        for (var i = 0; i < datalen - 1; i++) {
            ram[i] = buffer[offset + i + 1];
        }

    }

    self.reset = function () {
        for (var i = 0; i < ram.length; i++) ram[i] = 0;
    }

    self.setProcessor = function (p) {
        processor = p;
    }

    self.setMemSize = function (memSize) {
        defaultRamsize = 1024 * memSize;
        ram = new Uint8Array(defaultRamsize);
    }

    self.setSnapshotMemory = function (membuff) {
        ram = membuff;
    }

    return self;
}