//TODO: Have a hard coded start time (e.g. wait 15 minutes and then start)

var GPS_THRESHOLD = 500; // Needs to be adjusted: threshold for difference between previous and current gps reading values
var GPS_AVERAGE_THRESHOLD = 10; // Needs to be adjusted: threshold for difference between average of last 10 gps readings and current gps reading
var ACCELEROMETER_THRESHOLD = 10; //Needs to be adjusted: threshold for difference between accelerometer values
var TOTAL_VALUES_TO_STORE = 10;
var RELEASE_UNDER_VALUE = 300;

var checkServo = function(cb) {
	var readyToRelease = false;
	var currGPSVal;
	var idToClear;
	var cb = cb||releaseParachute;

	var interval = setInterval(function() {
		currGPSVal = getGPS().altitude;
		if (currGPSVal < RELEASE_UNDER_VALUE) {
			if (!idToClear) {
				idToClear = setInterval(sampleGPS, 100);
			}
			if (!(Math.abs(gpsAverage - currGPSVal) > GPS_AVERAGE_THRESHOLD || gpsValues.length < TOTAL_VALUES_TO_STORE)) {
				clearInterval(idToClear);
				sampleAccelerometer(function(val) {
					if(val) {
						clearInterval(idToClear);
						clearInterval(interval);
						cb();
					}
				})
			}
		}
	}, 100)
}

var gpsValues;
var gpsAverage;
var gpsTotal = 0;
var sampleGPS = function() {
	var prevVal = gpsValues[gpsValues.length - 1];
	var currVal = getGPS().altitude;
	var poppedVal;

	if (gpsValues.length > 0) {
		if (Math.abs(currVal - prevVal) > GPS_THRESHOLD) {
			gpsValues = [];
			return;
		}
	}

	gpsValues.push(currVal);
	if (gpsValues.length > TOTAL_VALUES_TO_STORE) {
		gpsValues = gpsValues.slice(1, TOTAL_VALUES_TO_STORE + 1);
		gpsTotal -= gpsValues[0];
		gpsTotal += currVal;
	} else {
		gpsTotal += currVal;
	}
	gpsAverage = gpsTotal / TOTAL_VALUES_TO_STORE;
}

var sampleAccelerometer = function(cb) {
	var counter = 0;
	var maxIterations = 5;
	var timeBetweenReadings = 10000;
	var prevVal = getAccelerometer();
	var currVal;

	var interval = setInterval(function() {
		if(counter > maxIterations) {
			clearInterval(interval);
			return true;
		}

		currVal = getAccelerometer();
		if (Math.abs(currVal - prevVal) > ACCELEROMETER_THRESHOLD) {
			clearInterval(interval);
			return false;
		}
		prevVal = currVal;
		counter++;
	}, 100)
	cb(interval);
}