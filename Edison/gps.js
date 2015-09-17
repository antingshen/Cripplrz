var m = require('/usr/lib/node_modules/mraa');
var SerialPort = require("/usr/lib/node_modules/serialport").SerialPort;

var GPS_DATA = {};
var lastRead = 0;

var DUMMY_DATA = {};

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
          if(lastRead + 5000 > (new Date).getTime() || !data) {
            return;
          } else {
            lastRead = (new Date).getTime();
          }

          var gps = (data.toString().split("\n").filter(function(line) {
            return line.indexOf("GPGGA") > -1;
          }))[0];

          if(gps) {
            gps = gps.split(",");

            //console.log(data.toString());

            //console.log(gps);

            var latitudeRaw = gps[2].match(/(\d{2,3})(\d{2}\.\d+)/);
            var longitudeRaw = gps[4].match(/(\d{2,3})(\d{2}\.\d+)/);
            var altitude = gps[9];


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

                latitude = readGPS(latitude.degree, latitude.minute);
                longitude = readGPS(longitude.degree, longitude.minut);

                console.log({latitude: latitude, longitude: longitude, altitude: altitude});

                cb({latitude: latitude, longitude: longitude, altitude: altitude});
              }
            }
        });  
      }  
    });
}

var readGPS = function(degree, minute) {
    return degree + (0.0166666667*minute);
}

var getGPS = function() {
  return GPS_DATA;
}

//Function for testing parachute code
var setGPSTestData = function(lat, lon, alti) {
  DUMMY_DATA.latitude = lat;
  DUMMY_DATA.longitude = lon;
  DUMMY_DATA.altitude = alti;
  console.log("Setting dummy data to:" + lat + " " + lon + " " + alti);
}

//Function for testing parachhute code
var getGPSTest = function() {
  return DUMMY_DATA;
}

initGPS(function(data) {
    GPS_DATA.latitude = data.latitude;
    GPS_DATA.longitude = data.longitude;
    GPS_DATA.altitude = data.altitude;
})
