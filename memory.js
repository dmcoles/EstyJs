// memory emulation routines for EstyJs
// written by Darren Coles

EstyJs.Memory = function (opts) {
    var self = {};

    var defaultRamsize = 1024 * 1024;
    //var defaultRamsize = 512 * 1024;
    var ram = new ArrayBuffer(defaultRamsize);
    var ramDataView = new DataView(ram);
    var rom = new ArrayBuffer(0);
    var romDataView = new DataView(rom);

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
                rom = arrayBuffer;
                romDataView = new DataView(rom);
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
            return romDataView.getUint8(addr);
        }

        if (addr < ram.byteLength) {
            return ramDataView.getUint8(addr);
        }

        if (addr >= 0xe00000 & addr < 0xf00040) {
            //system rom
            return romDataView.getUint8(addr & 0x3ffff);
            //return 0xff;
        }

        if (addr >= 0xf00040 & addr < 0xfa0000) {
            //illegal
            bug.say(sprintf('invalid memory read $%08x', addr));
            processor.memoryError(addr);
        }

        if (addr >= 0xfa0000 & addr <= 0xfc0000) {
            //cartridge rom
            return 0xff;
        }

        if (addr >= 0xfc0000 & addr < 0xff0000) {
            return romDataView.getUint8(addr & 0x3ffff);
        }

        if (addr >= 0xff0000) {
            var m = io.read(addr);
            if (m == undefined) processor.memoryError(addr);
            return m;
        }

        return 0xff;

    }

    self.readWord = function (addr) {
        addr = addr & 0xffffff;

        //mirror first 8 bytes of rom at 0
        if (addr < 8) {
            return romDataView.getUint16(addr, false);
        }

        if (addr < ram.byteLength) {
            return ramDataView.getUint16(addr, false);
        }

        if (addr >= 0xe00000 & addr < 0xf00040) {
            //system rom
            return romDataView.getUint16(addr & 0x3ffff);
            //return 0xff;
        }

        if (addr >= 0xfa0000 & addr < 0xfc0000) {
            //cartridge rom
            return 0xffff;
        }

        if (addr >= 0xfc0000 & addr < 0xff0000) {
            return romDataView.getUint16(addr & 0x3ffff);
        }

        //default to reading one byte at a time for all other memory addresses
        return ((self.readByte(addr) << 8) + (self.readByte(addr + 1))) & 0xffff;


    }

    self.readLong = function (addr) {
        addr = addr & 0xffffff;

        //mirror first 8 bytes of rom at 0
        if (addr < 8) {
            return romDataView.getInt32(addr, false);
        }

        if (addr < ram.byteLength) {
            return ramDataView.getInt32(addr, false);
        }

        if (addr > 0xe00000 & addr < 0xf00040) {
            //system rom
            return romDataView.getInt32(addr & 0x3ffff);
            //return 0xff;
        }

        if (addr >= 0xfa0000 & addr <= 0xfc0000) {
            //cartridge rom
            return 0xffffffff;
        }

        if (addr >= 0xfc0000 & addr < 0xff0000) {
            return romDataView.getInt32(addr & 0x3ffff);
        }

        //default to reading one byte at a time for all other memory addresses
        return ((self.readByte(addr) << 24) + (self.readByte(addr + 1) << 16) + (self.readByte(addr + 2) << 8) + (self.readByte(addr + 3))) & 0xffffffff;
    }

    self.writeByte = function (addr, val) {
        addr = addr & 0xffffff;
        if (addr < 8) {
            processor.memoryError(addr);
        }
        if (addr < ram.byteLength) {
            ramDataView.setUint8(addr, val);
        }
        else if ((addr & 0xFF0000) == 0xFF0000) {
            try
            {
                io.write(addr, val);
            }
            catch(Error)
            {
                if (Error=="memory error") processor.memoryError(addr);
            }
        }
        else {
            //bug.say(sprintf('invalid memory write $%08x', addr));
        }

    }

    self.writeWord = function (addr, val) {
        addr = addr & 0xffffff;
        if (addr < 8) {
            processor.memoryError(addr);
        }
        if (addr < ram.byteLength) {
            ramDataView.setUint16(addr, val, false);
        }
        else {
            self.writeByte(addr, val >>> 8);
            self.writeByte(addr + 1, val & 0xff);
        }
    }

    self.writeLong = function (addr, val) {
        addr = addr & 0xffffff;
        if (addr < 8) {
            processor.memoryError(addr);
        }
        if (addr < ram.byteLength) {
            ramDataView.setInt32(addr, val, false);
        }
        else {
            self.writeByte(addr, val >>> 24);
            self.writeByte(addr + 1, (val >>> 16) & 0xff);
            self.writeByte(addr + 2, (val >>> 8) & 0xff);
            self.writeByte(addr + 3, val & 0xff);
        }
    }

    self.loadSnapshot = function (buffer, offset, datalen) {
        //ignore anything that isnt a ram snapshot
        if (buffer[offset + 0] != 0) return;

        for (var i = 0; i < datalen - 1; i++) {
            ram[i] = buffer[offset + i + 1];
        }

    }

    self.reset = function () {
        for (var i = 0; i < ram.byteLength; i++) ram[i] = 0;
    }

    self.setProcessor = function (p) {
        processor = p;
    }

    self.setMemSize = function (memSize) {
        defaultRamsize = 1024 * memSize;
        ram = new ArrayBuffer(defaultRamsize);
        ramDataView = new DataView(ram);
    }

    self.setSnapshotMemory = function (membuff) {
        ram = membuff;
        ramDataView = new DataView(ram);
    }

    return self;
}