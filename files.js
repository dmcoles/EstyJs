 //  file handling routines for EstyJs
// written by Darren Coles

EstyJs.fileManager = function (opts) {
    var self = {};

    function unzip(buffer, getZipNamesOnly) {
        var unzipper = new JSUnzip(new Uint8Array(buffer));

        if (getZipNamesOnly != undefined && getZipNamesOnly) {
            if (unzipper.isZipFile()) {
                var files = new Array();
                unzipper.readEntries();

                for (var i = 0; i < unzipper.entries.length; i++) {
                    files.push(unzipper.entries[i].fileName);
                }

                return files;
            }
            else {
                return new Array();
            }

        }

        if (unzipper.isZipFile()) {
            unzipper.readEntries();

            for (var i = 0; i < unzipper.entries.length; i++) {
                var entry = unzipper.entries[i];
                var fname = entry.fileName.toUpperCase();
                var ext = fname.substr(fname.lastIndexOf('.')).toLowerCase();
                if (((ext == '.st') || (ext == '.msa') || (ext == '.sts')) && (entry.compressionMethod == 8 | entry.compressionMethod == 0)) {

                    if (entry.compressionMethod == 8) {
                        return (new Uint8Array(JSInflate.inflate(entry.data))).buffer;
                    } else {
                        return (new Uint8Array(entry.data)).buffer;
                    }
                }

            }

            return null;
        }

        return buffer;
    }

    function load_filereader(file, callback, getZipNamesOnly) {
        var reader = new FileReader();
        reader.onload = function (e) {
            callback(unzip(e.target.result, ((getZipNamesOnly != undefined) && getZipNamesOnly)));
        };

        reader.readAsArrayBuffer(file);
    }

    function load_binary_resource(url, callback, getZipNamesOnly) {

        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";


        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                callback(unzip(arrayBuffer, ((getZipNamesOnly != undefined) && getZipNamesOnly)));
            }
        };

        oReq.send(null);
    }

    self.loadFile = function (file, callback) {
        if (Object.prototype.toString.call(file) == '[object File]') {
            load_filereader(file, callback);
        }
        else {
            load_binary_resource(file, callback)
        }
    }

    self.getZipFilenames = function (file, callback) {
        if (Object.prototype.toString.call(file) == '[object File]') {
            load_filereader(file, callback, true);
        }
        else {
            load_binary_resource(file, callback, true)
        }
    }

    return self;
}