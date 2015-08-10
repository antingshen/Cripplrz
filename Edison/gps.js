var m = require('mraa');
var SerialPort = require("serialport").SerialPort;

var GPS_DATA = {};

var initGPS = function(cb) {
    var uart = new m.Uart(0);

    var serialPort = new SerialPort(uart.getDevicePath(), {  
      baudrate: 9600  
    }, false);

    serialPort.open(function (error) {
      if (error) {  
        console.log('Failed to open: '+error);
      } else {  
        console.log('open');  
        serialPort.on('data', function(data) {
          var gps = (data.toString().split("\n").filter(function(line) {
            return line.indexOf("GPGLL") > -1;
          }))[0].split(",");

          console.log(gps);

          var latitudeRaw = gps[1].match(/(\d{2,3})(\d{2}\.\d+)/);
          var longitudeRaw = gps[3].match(/(\d{2,3})(\d{2}\.\d+)/);

          if(latitudeRaw && longitudeRaw) {
              var latitude = {
                degree: latitudeRaw[1],
                minute: latitudeRaw[2],
                direction: gps[2]
              };

              var longitude = {
                degree: longitudeRaw[1],
                minute: longitudeRaw[2],
                direction: gps[4]
              };

              cb({latitude: latitude, longitude: longitude});
            }
        });  
      }  
    });
}

var readGPS(degree, minute) {
    return degree + (0.0166666667*minute);
}

var getGPS() {
  return GPS_DATA;
}

initGPS(function(data) {
    GPS_DATA.latitude = data.latitude;
    GPS_DATA.longitude = data.longitude;
})
