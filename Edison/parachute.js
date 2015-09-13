//TODO: Have a hard coded start time (e.g. wait 15 minutes and then start)

var GPS_THRESHOLD = 99; // Needs to be adjusted: threshold for difference between previous and current gps reading values
var GPS_AVERAGE_THRESHOLD = 50; // Needs to be adjusted: threshold for difference between average of last 10 gps readings and current gps reading
//var ACCELEROMETER_THRESHOLD = 10; //Needs to be adjusted: threshold for difference between accelerometer values
var TOTAL_VALUES_TO_STORE = 10;
var RELEASE_UNDER_VALUE = 1200;
var IGNORE_CURR_GPS_BELOW = 700;//Value under which we consider GPS readings to be too low and incorrect data
var RUNNING_PARACHUTE_TEST_CODE = 0; //Gets set to 1 if we run testParachute()

var checkServo = function(cb) {
    var readyToRelease = false;
    var currGPSVal;
    var idToClear;
    var cb = cb||releaseParachute;

    var interval = setInterval(function() {
        if (RUNNING_PARACHUTE_TEST_CODE) {
            currGPSVal = getGPSTest().altitude;
        } else {
            currGPSVal = getGPS().altitude;
        }

        console.log("Waiting to get below RELEASE_UNDER_VALUE. Current value is: " + currGPSVal);

        if (currGPSVal < RELEASE_UNDER_VALUE && currGPSVal > IGNORE_CURR_GPS_BELOW) {
            console.log("We think we are on the ground. Start other checks.");
            if (!idToClear) {
                idToClear = setInterval(sampleGPS, 2000);
            }
            if (!(Math.abs(gpsAverage - currGPSVal) > GPS_AVERAGE_THRESHOLD || gpsValues.length < TOTAL_VALUES_TO_STORE)) {
                clearInterval(idToClear);
                //sampleAccelerometer(function(val) {
                //    if(val) {
                //        clearInterval(idToClear);
                        console.log("Releasing Parachute");
                        clearInterval(interval);
                        cb();
                //    }
                //})
            }
        }
    }, 2000)
}

var gpsValues = [];
var gpsAverage;
var gpsTotal = 0;
var sampleGPS = function() {
    console.log("Calling sampleGPS");
    var prevVal = gpsValues[gpsValues.length - 1];
    var currVal;
    if (RUNNING_PARACHUTE_TEST_CODE) {
        currVal = getGPSTest().altitude;
    } else {
        currVal = getGPS().altitude;
    }
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
    console.log(gpsValues);
}

/*var sampleAccelerometer = function(cb) {
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
}*/

var currAlti = 1300
var subtractThisMuch = 13;
var groundLevel = 1000;
var counter = 0;

//Run this to test parachute code
var testParachuteWithDummyCode = function() {
    RUNNING_PARACHUTE_TEST_CODE = 1;
    setGPSTestData(0, 0, currAlti);

    var idClear = setInterval(function(cb) {
        if (currAlti > groundLevel) {
            currAlti -= subtractThisMuch;
        }
        if (counter % 100 == 0) {
            setGPSTestData(0, 0, 100000);
        }
        setGPSTestData(0, 0, currAlti);
        counter++;
    }, 500);

    checkServo(function() {
        clearInterval(idClear);
        releaseParachute();
        RUNNING_PARACHUTE_TEST_CODE = 0;
    });
}

