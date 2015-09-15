//TODO: Have a hard coded start time (e.g. wait 15 minutes and then start)

var GPS_THRESHOLD_ALTITUDE = 99; // Needs to be adjusted: threshold for difference between previous and current gps reading values for altitude
var GPS_THRESHOLD_LAT_LON = 10; // Needs to be adjusted: threshold for difference between previous and current gps reading values for latitude and longitude
var GPS_AVERAGE_THRESHOLD_ALTITUDE = 50; // Needs to be adjusted: threshold for difference between average of last 10 gps readings and current gps reading
var GPS_AVERAGE_THRESHOLD_LAT_LON = 50; // Needs to be adjusted: threshold below which we believe our lat lon values are not changing enough: we are stuck
//var ACCELEROMETER_THRESHOLD = 10; //Needs to be adjusted: threshold for difference between accelerometer values
var TOTAL_VALUES_TO_STORE = 10;
var RELEASE_UNDER_VALUE = 1200;
var IGNORE_CURR_GPS_BELOW = 700;//Value under which we consider GPS readings to be too low and incorrect data
var RUNNING_TEST_CODE = 0; //Gets set to 1 if we run testParachute()
var LANDED = 0;

var checkServo = function(cb) {
    var readyToRelease = false;
    var currGPSAlt;
    var idToClear;
    var cb = cb||releaseParachute;

    var interval = setInterval(function() {
        if (buffering) {
            return;
        }

        if (RUNNING_TEST_CODE) {
            currGPSAlt = getGPSTest().altitude;
        } else {
            currGPSAlt = getGPS().altitude;
        }

        console.log("Waiting to get below RELEASE_UNDER_VALUE. Current value is: " + currGPSAlt);

        if (currGPSAlt < RELEASE_UNDER_VALUE && currGPSAlt > IGNORE_CURR_GPS_BELOW) {
            console.log("We think we are on the ground. Start other checks.");
            if (!idToClear) {
                idToClear = setInterval(sampleGPS, 2000);
            }
            if (!(Math.abs(gpsAltitudeAverage - currGPSAlt) > GPS_AVERAGE_THRESHOLD_ALTITUDE || gpsValues.length < TOTAL_VALUES_TO_STORE)) {
                clearInterval(idToClear);
                //sampleAccelerometer(function(val) {
                //    if(val) {
                //        clearInterval(idToClear);
                        console.log("Releasing Parachute");
                        clearInterval(interval);
                        LANDED = 1;
                        cb();
                //    }
                //})
            }
        }
    }, 2000)
}

var gpsValues = [];
var gpsLonAverage = 0;
var gpsLonTotal = 0;
var gpsLatAverage = 0;
var gpsLatTotal = 0;
var gpsAltitudeAverage = 0;
var gpsAltitudeTotal = 0;
var buffering = 0;
var sampleGPS = function() {
    console.log("Calling sampleGPS");

    //Sampling procedure for first time values are collected
    if(gpsValues.length == 0 && !buffering) {
        bufferGPSValues();
        return;
    }

    if (buffering) {
        return;
    }

    //Otherwise proceed with regular single GPS entry sampling
    var prevVal = gpsValues[gpsValues.length - 1];
    var currVal;
    if (RUNNING_TEST_CODE) {
        currVal = copyGPSObject(getGPSTest());
    } else {
        currVal = copyGPSObject(getGPS());
    }
    var poppedVal;

    if (!LANDED) {
        if (Math.abs(currVal.altitude - prevVal.altitude) > GPS_THRESHOLD_ALTITUDE) {
            gpsValues = [];
            return;
        }
    } else {
        if (Math.abs(currVal.longitude - prevVal.longitude) > GPS_THRESHOLD_LAT_LON || Math.abs(currVal.latitude - prevVal.latitude) > GPS_THRESHOLD_LAT_LON) {
            gpsValues = [];
            return;
        }
    }

    gpsValues.push(currVal);
    if (gpsValues.length > TOTAL_VALUES_TO_STORE) {
        var oldestGPSValue = gpsValues[0];
        gpsValues = gpsValues.slice(1, TOTAL_VALUES_TO_STORE + 1);
        gpsLatTotal = gpsLatTotal - oldestGPSValue.latitude + currVal.latitude;
        gpsLonTotal = gpsLonTotal - oldestGPSValue.longitude + currVal.longitude;
        gpsAltitudeTotal = gpsAltitudeTotal - oldestGPSValue.altitude + currVal.altitude;
    } else {
        gpsLatTotal += currVal.latitude;
        gpsLonTotal += currVal.longitude;
        gpsAltitudeTotal += currVal.altitude;
    }
    gpsLatAverage = gpsLatTotal / TOTAL_VALUES_TO_STORE;
    gpsLonAverage = gpsLonTotal / TOTAL_VALUES_TO_STORE;
    gpsAltitudeAverage = gpsAltitudeTotal / TOTAL_VALUES_TO_STORE;
    console.log(gpsValues);
}

var bufferDone = 0;
var bufferGPSValues = function() {
    buffering = 1;
    bufferDone = 0;
    var GPSbuffer = [];
    var totalLoops = 3;
    var counter = 0;
    //Put 3 potential GPS values into a buffer list
    var bufferID = setInterval(function() {
        console.log("Buffer before V");
        console.log(GPSbuffer);
        if (counter >= totalLoops) {
            bufferDone = 1;
            clearInterval(bufferID);
            return;
        } else {
            counter += 1;
        }

        console.log("Grabbing entry for GPS buffer.");
        //console.log("Counter: " + counter);
        if (RUNNING_TEST_CODE) {
            GPSbuffer.push(copyGPSObject(getGPSTest()));
            console.log("Buffer after V");
            console.log(GPSbuffer);
        } else {
            GPSbuffer.push(copyGPSObject(getGPS()));
        }
    }, 2000);

    //If the values in our buffer are valid, we add them to our real list of values. Otherwise, we start over.
    var checkerID = setInterval(function() {
        if (bufferDone) {
            if (checkValidBufferValues(GPSbuffer)) {
                console.log("Passed check for valid buffer values.");
                var entry;
                for (var i = 0; i < GPSbuffer.length; i++) {
                    entry = GPSbuffer[i];
                    gpsValues.push(entry);
                    gpsLonTotal += entry.latitude;
                    gpsLatTotal += entry.longitude;
                    gpsAltitudeTotal += entry.altitude;
                }
                console.log(gpsValues);
            }
            buffering = 0;
            clearInterval(checkerID);
        }    
    }, 2000);
    return;
}

var checkValidBufferValues = function(listOfPotentialValues) {
    for (var i = 0; i < listOfPotentialValues.length; i++) {
        for (var j = 0; j < listOfPotentialValues.length; j++) {
            if (i != j) {
                if (!LANDED) {
                    if (Math.abs(currVal.altitude - prevVal.altitude) > GPS_THRESHOLD_ALTITUDE) {
                        return false;
                    }
                } else {
                    if (Math.abs(currVal.longitude - prevVal.longitude) > GPS_THRESHOLD_LAT_LON || Math.abs(currVal.latitude - prevVal.latitude) > GPS_THRESHOLD_LAT_LON) {
                        return false;
                    }
                }
            }
        }
    }
    return true;
}

var copyGPSObject = function(objectToCopy) {
    var copy = {};
    copy.latitude = objectToCopy.latitude;
    copy.longitude = objectToCopy.longitude;
    copy.altitude = objectToCopy.altitude;
    return copy;
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

var currAlti = 1220
var subtractThisMuch = 13;
var groundLevel = 1000;
var counter = 0;

//Run this to test parachute code
var testParachuteWithDummyCode = function() {
    RUNNING_TEST_CODE = 1;
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
    }, 2000);

    checkServo(function() {
        clearInterval(idClear);
        releaseParachute();
        RUNNING_TEST_CODE = 0;
    });
}

