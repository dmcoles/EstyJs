 //  file handling routines for EstyJs
// written by Darren Coles

EstyJs.fileManager = function (opts) {
    var self = {};

    function load_filereader(file, callback) {
        var reader = new FileReader();
        reader.onload = function (e) {
            callback(e.target.result);
        };

        reader.readAsArrayBuffer(file);
    }

    function load_binary_resource(url, callback) {

        var oReq = new XMLHttpRequest();
        oReq.open("GET", url, true);
        oReq.responseType = "arraybuffer";


        oReq.onload = function (oEvent) {
            var arrayBuffer = oReq.response; // Note: not oReq.responseText
            if (arrayBuffer) {
                callback(arrayBuffer);
            }
        };

        oReq.send(null);
    }


    self.loadFile = function (file,callback) {
        if (Object.prototype.toString.call(file) == '[object File]') {
            load_filereader(file, callback);
        }
        else {
            load_binary_resource(file, callback)
        }
    }

    return self;
}