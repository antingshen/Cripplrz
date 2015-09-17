var fs = require('fs');

var writeSDCard = function(fileName, text, cb) {
    fs.writeFile('/media/sdcard/' + fileName, text, cb);
}

var appendSDCard = function(fileName, text, cb) {
    fs.appendFile('/media/sdcard/' + filename, text, cb);
}

var SDLog = function(text) {
    fs.appendFile('/media/sdcard/log', text + "\n");
}
