var appScanner = function(dataCallback, errorCallback) {

    var _dataCallback = dataCallback;
    var _errorCallback = errorCallback;

    function Scanner() {

        this.scannerType = "NO SCANNER";

        if (sap.ui.Device.os.android && window.datawedge) {
            return new Datawedge();
        } else if (sap.ui.Device.os.ios && window.LineaProCDV) {
            return new LineaPro();
        } else if (typeof navigator.honeywell_scanner_plugin !== "undefined") {
            return new Honeywell();
        }
    }

    Scanner.prototype.enable = function() {
        throw "Not implemented";
    }

    function LineaPro() {

        this.scannerType = "LINEAPRO";

        var onConnectionCallback = function() {}
        var onCardCallback = function() {}
        var onBarcodeCallback = function(data) {
            _dataCallback(data.rawCodesArr[0]);
        }
        var onCancelCallback = function() {}
        var onErrorCallback = function(error) {
            _errorCallback(error);
        }

        LineaProCDV.initDT(
            onConnectionCallback,
            onCardCallback,
            onBarcodeCallback,
            onCancelCallback,
            onErrorCallback);
    }
    LineaPro.prototype = Object.create(Scanner.prototype);
    LineaPro.prototype.constructor = LineaPro;

    function Honeywell() {
        this.scannerType = "HONEYWELL";

        navigator.honeywell_scanner_plugin.scan(function(data) {
            _dataCallback(data.barcode);
        }, function(error) {
            _errorCallback(error);
        });
        navigator.honeywell_scanner_plugin.startListen(function(data) {
            _dataCallback(data.barcode);
        }, function(error) {
            _errorCallback(error);
        });
    }
    Honeywell.prototype = Object.create(Scanner.prototype);
    Honeywell.prototype.constructor = Honeywell;

    function Datawedge() {
        this.scannerType = "DATAWEDGE";

        datawedge.start("com.bluefletch.motorola.datawedge.ACTION");
        datawedge.registerForBarcode(function(data) {
            var labelType = data.type;
            var barcode = data.barcode;
            _dataCallback(barcode);
        });
    }
    Datawedge.prototype = Object.create(Scanner.prototype);
    Datawedge.prototype.constructor = Datawedge;

    var o = new Scanner();

    return {
        getType: function() {
            return o.scannerType;
        },
        changeCallbacks: function(dataCallback, errorCallback) {
            _dataCallback = dataCallback;
            _errorCallback = errorCallback;
        },
        enable: function() {
            o.enable();
        }
    }

};