# s5con-scanner-wrapper

Wrapper for all scanners.

function dataCallback(data) {

}

function errorCallback(error) {

}

var scanner = appScanner(dataCallback, errorCallback);


function dataCallback2(data) {

}

function errorCallback2(error) {

}

scanner.changeCallbacks(dataCallback2, errorCallback2);
