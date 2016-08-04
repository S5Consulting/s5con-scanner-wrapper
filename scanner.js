var appScanner = function(dataCallback, errorCallback) {

    var _dataCallback = dataCallback;
    var _errorCallback = errorCallback;

    function Scanner() {        
        this.scannerType = "NO SCANNER";
        this.enabled = false;

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
    Scanner.prototype.disable = function() {
        throw "Not implemented";
    }
    Scanner.prototype.switchProfile = function() {
        throw "Not implemented";
    }

    function LineaPro() {
        this.enabled = true;
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
        this.enabled = true;
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
        this.enabled;

        this.start = function() {
            datawedge.start("com.bluefletch.motorola.datawedge.ACTION");
            datawedge.registerForBarcode(function(data) {
                var labelType = data.type;
                var barcode = data.barcode;
                _dataCallback(barcode);
                enabled = true;
            });
        }

        this.disable = function() {
            datawedge.unregisterBarcode();
        }
        start();
    }
    Datawedge.prototype = Object.create(Scanner.prototype);
    Datawedge.prototype.constructor = Datawedge;

    Datawedge.prototype.enable = function() {
        if (!this.enabled) {
            this.start();
        }                
    }

    Datawedge.prototype.disable = function() {
        if (this.enabled) {
            this.disable();
        }
    }

    Datawedg.prototype.switchProfile = function(profile) {        
        datawedge.switchProfile(profile);
        this.enabled = false;
        this.enable();
    }

    var o = new Scanner();

    return {
        getType: function() {
            return o.scannerType;
        },
        isEnabled: function() {
            return o.enabled;      
        },
        changeCallbacks: function(dataCallback, errorCallback) {
            _dataCallback = dataCallback;
            _errorCallback = errorCallback;
        },
        enable: function() {
            o.enable();
        },
        disable: function() {
            o.disable();
        },
        switchProfile: function(profile) {
            o.switchProfile(profile);
        },
    }
};