var appScanner = function(dataCallback, errorCallback) {

    /* Singleton instance */
    if (arguments.callee._appScannerInstance) {
        arguments.callee._appScannerInstance.changeCallbacks(dataCallback, errorCallback);
        return arguments.callee._appScannerInstance;
    }

    var _dataCallback = dataCallback;
    var _errorCallback = errorCallback;

    function Scanner() {
        this.scannerType = "NO SCANNER";
        this.enabled = false;
        this.active = false;

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
    Scanner.prototype.startScanner = function() {
        throw "Not implemented";
    }
    Scanner.prototype.stopScanner = function() {
        throw "Not implemented";
    }
    Scanner.prototype.switchProfile = function() {
        throw "Not implemented";
    }

    function LineaPro() {
        this.enabled = true;
        this.active = false;
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

    LineaPro.prototype.startScanner = function() {
        LineaProCDV.barcodeStart();
        this.active = true;
    }
    LineaPro.prototype.stopScanner = function() {
        LineaProCDV.barcodeStop();
        this.active = false
    }

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
        this.enabled = true;
        this.scannerType = "DATAWEDGE";

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

        this.start();
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

    Datawedge.prototype.switchProfile = function(profile) {
        datawedge.switchProfile(profile);
        this.start();
    }

    var o = new Scanner();

    arguments.callee._appScannerInstance = {
        getType: function() {
            return o.scannerType;
        },
        isEnabled: function() {
            return o.enabled;
        },
        isActive: function() {
            return o.active;
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
        startScanner: function() {
            o.startScanner();
        },
        stopScanner: function() {
            o.stopScanner();
        },
        switchProfile: function(profile) {
            o.switchProfile(profile);
        },
    }
    return arguments.callee._appScannerInstance;
}