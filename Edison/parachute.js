var fs = require('fs');

//TODO: Have a hard coded start time (e.g. wait 15 minutes and then start)
var PARACHUTE_VARIABLES = {
    GPS_THRESHOLD_ALTITUDE : 100, // Needs to be adjusted: threshold for difference between previous and current gps reading values for altitude
    GPS_THRESHOLD_LAT_LON : 100, // Needs to be adjusted: threshold for difference between previous and current gps reading values for latitude and longitude
    GPS_AVERAGE_THRESHOLD_ALTITUDE : 20, // Needs to be adjusted: threshold for difference between average of last 10 gps readings and current gps reading
    GPS_AVERAGE_THRESHOLD_LAT_LON : 3, // Needs to be adjusted: threshold below which we believe our lat lon values are not changing enough: we are stuck
    TOTAL_VALUES_TO_STORE : 10,
    
    RELEASE_UNDER_VALUE : 1200,
    IGNORE_CURR_GPS_BELOW : 1000, //Value under which we consider GPS readings to be too low and incorrect data
    LANDED : 0,
    BEGIN_CHECK_SERVO : 0,
    TIME_TO_WAIT_BEFORE_SAMPLING : 0,
    RUNNING_TEST_CODE : 0 //Gets set to 1 if we run testParachute()
}

var initParachute = function(cb) {
    readParachuteReleased(function(val) {
        if(val === '1') {
            console.log(val);
            cb();
        } else {
            setTimeout(function() {
                checkServo(cb);
            }, PARACHUTE_VARIABLES.TIME_TO_WAIT_BEFORE_SAMPLING);
        }
    })
}

var checkServo = function(cb) {
    var readyToRelease = false;
    var currGPSAlt;
    var idToClear;
    var cb = cb||releaseParachute;

    readParachuteReleased(function(val) {
        if(val === '1') {
            PARACHUTE_VARIABLES.LANDED = 1;
            cb();
        } else {
            var interval = setInterval(function() {
                if (SAMPLING_VARIABLES.buffering) {
                    return;
                }

                if (PARACHUTE_VARIABLES.RUNNING_TEST_CODE) {
                    currGPSAlt = getGPSTest().altitude;
                } else {
                    currGPSAlt = getGPS().altitude;
                }

                //Don't start checking for altitude values until we are in the air.
                /*if (!PARACHUTE_VARIABLES.BEGIN_CHECK_SERVO && currGPSAlt < PARACHUTE_VARIABLES.RELEASE_UNDER_VALUE + 500) {
                    console.log("Have not lifted off yet");
                    return;
                } else {
                    console.log("Switched");
                    PARACHUTE_VARIABLES.BEGIN_CHECK_SERVO = 1;
                }*/

                console.log("Waiting to get below PARACHUTE_VARIABLES.RELEASE_UNDER_VALUE. Current value is: " + currGPSAlt);

                if (currGPSAlt < PARACHUTE_VARIABLES.RELEASE_UNDER_VALUE && currGPSAlt > PARACHUTE_VARIABLES.IGNORE_CURR_GPS_BELOW) {
                    console.log("We think we are on the ground. Start other checks.");
                    if (!idToClear) {
                        idToClear = setInterval(sampleGPS, 5000);
                    }
                    if (!(Math.abs(SAMPLING_VARIABLES.gpsAltitudeAverage - currGPSAlt) > PARACHUTE_VARIABLES.GPS_AVERAGE_THRESHOLD_ALTITUDE || SAMPLING_VARIABLES.gpsValues.length < PARACHUTE_VARIABLES.TOTAL_VALUES_TO_STORE)) {
                        clearInterval(idToClear);
                        clearInterval(interval);
                        console.log("Releasing Parachute");
                        PARACHUTE_VARIABLES.LANDED = 1;
                        writeToParachuteReleased(1);
                        releaseParachute();
                        cb();
                    }
                }
            }, 5000);
        }
    });
}

var SAMPLING_VARIABLES = {
    gpsValues : [],
    gpsLonAverage : 0,
    gpsLonTotal : 0,
    gpsLatAverage : 0,
    gpsLatTotal : 0,
    gpsAltitudeAverage : 0,
    gpsAltitudeTotal : 0,
    buffering : 0
}
var sampleGPS = function() {
    console.log("Calling sampleGPS");

    //Sampling procedure for first time values are collected
    if(SAMPLING_VARIABLES.gpsValues.length == 0 && !SAMPLING_VARIABLES.buffering) {
        bufferGPSValues();
        return;
    }

    if (SAMPLING_VARIABLES.buffering) {
        return;
    }

    //Otherwise proceed with regular single GPS entry sampling
    var prevVal = SAMPLING_VARIABLES.gpsValues[SAMPLING_VARIABLES.gpsValues.length - 1];
    var currVal;
    if (PARACHUTE_VARIABLES.RUNNING_TEST_CODE) {
        currVal = copyGPSObject(getGPSTest());
    } else {
        currVal = copyGPSObject(getGPS());
    }
    var poppedVal;

    //Do not accept any undefined values
    if(!currVal.longitude || !currVal.latitude || !currVal.altitude) {
        return;
    }

    if (!PARACHUTE_VARIABLES.LANDED) {
        if (Math.abs(currVal.altitude - prevVal.altitude) > PARACHUTE_VARIABLES.GPS_THRESHOLD_ALTITUDE) {
            SAMPLING_VARIABLES.gpsValues = [];
            return;
        }
    } else {
        if (Math.abs(currVal.longitude - prevVal.longitude) > PARACHUTE_VARIABLES.GPS_THRESHOLD_LAT_LON || Math.abs(currVal.latitude - prevVal.latitude) > PARACHUTE_VARIABLES.GPS_THRESHOLD_LAT_LON) {
            SAMPLING_VARIABLES.gpsValues = [];
            return;
        }
    }

    SAMPLING_VARIABLES.gpsValues.push(currVal);
    if (SAMPLING_VARIABLES.gpsValues.length > PARACHUTE_VARIABLES.TOTAL_VALUES_TO_STORE) {
        var oldestGPSValue = SAMPLING_VARIABLES.gpsValues[0];
        SAMPLING_VARIABLES.gpsValues = SAMPLING_VARIABLES.gpsValues.slice(1, PARACHUTE_VARIABLES.TOTAL_VALUES_TO_STORE + 1);
        SAMPLING_VARIABLES.gpsLatTotal = SAMPLING_VARIABLES.gpsLatTotal - oldestGPSValue.latitude + currVal.latitude;
        SAMPLING_VARIABLES.gpsLonTotal = SAMPLING_VARIABLES.gpsLonTotal - oldestGPSValue.longitude + currVal.longitude;
        SAMPLING_VARIABLES.gpsAltitudeTotal = SAMPLING_VARIABLES.gpsAltitudeTotal - oldestGPSValue.altitude + currVal.altitude;
    } else {
        SAMPLING_VARIABLES.gpsLatTotal += currVal.latitude;
        SAMPLING_VARIABLES.gpsLonTotal += currVal.longitude;
        SAMPLING_VARIABLES.gpsAltitudeTotal += currVal.altitude;
    }
    SAMPLING_VARIABLES.gpsLatAverage = SAMPLING_VARIABLES.gpsLatTotal / PARACHUTE_VARIABLES.TOTAL_VALUES_TO_STORE;
    SAMPLING_VARIABLES.gpsLonAverage = SAMPLING_VARIABLES.gpsLonTotal / PARACHUTE_VARIABLES.TOTAL_VALUES_TO_STORE;
    SAMPLING_VARIABLES.gpsAltitudeAverage = SAMPLING_VARIABLES.gpsAltitudeTotal / PARACHUTE_VARIABLES.TOTAL_VALUES_TO_STORE;
    console.log(SAMPLING_VARIABLES.gpsValues);
}

var bufferDone = 0;
var bufferGPSValues = function() {
    SAMPLING_VARIABLES.buffering = 1;
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
        }

        console.log("Grabbing entry for GPS buffer.");
        //console.log("Counter: " + counter);
        var readyToPush;
        if (PARACHUTE_VARIABLES.RUNNING_TEST_CODE) {
            readyToPush = copyGPSObject(getGPSTest());
            
            if(!readyToPush.longitude || !readyToPush.latitude || !readyToPush.altitude) {
                return;
            }

            GPSbuffer.push(readyToPush);
            console.log("Buffer after V");
            console.log(GPSbuffer);
        } else {
            readyToPush = copyGPSObject(getGPS());
            
            if(!readyToPush.longitude || !readyToPush.latitude || !readyToPush.altitude) {
                return;
            }

            GPSbuffer.push(readyToPush);
        }
        counter += 1;
    }, 5000);

    //If the values in our buffer are valid, we add them to our real list of values. Otherwise, we start over.
    var checkerID = setInterval(function() {
        if (bufferDone) {
            if (checkValidBufferValues(GPSbuffer)) {
                console.log("Passed check for valid buffer values.");
                var entry;
                for (var i = 0; i < GPSbuffer.length; i++) {
                    entry = GPSbuffer[i];
                    SAMPLING_VARIABLES.gpsValues.push(entry);
                    SAMPLING_VARIABLES.gpsLonTotal += entry.latitude;
                    SAMPLING_VARIABLES.gpsLatTotal += entry.longitude;
                    SAMPLING_VARIABLES.gpsAltitudeTotal += entry.altitude;
                }
                console.log(SAMPLING_VARIABLES.gpsValues);
            }
            SAMPLING_VARIABLES.buffering = 0;
            clearInterval(checkerID);
        }    
    }, 5000);
    return;
}

//Ensure that buffered values are close enough to each other.
var checkValidBufferValues = function(listOfPotentialValues) {
    for (var i = 0; i < listOfPotentialValues.length; i++) {
        for (var j = 0; j < listOfPotentialValues.length; j++) {
            if (i != j) {
                var currVal = listOfPotentialValues[i];
                var otherVal = listOfPotentialValues[j];
                if (!PARACHUTE_VARIABLES.LANDED) {
                    if (Math.abs(currVal.altitude - otherVal.altitude) > PARACHUTE_VARIABLES.GPS_THRESHOLD_ALTITUDE) {
                        return false;
                    }
                } else {
                    if (Math.abs(currVal.longitude - otherVal.longitude) > PARACHUTE_VARIABLES.GPS_THRESHOLD_LAT_LON || Math.abs(currVal.latitude - otherVal.latitude) > PARACHUTE_VARIABLES.GPS_THRESHOLD_LAT_LON) {
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

PARACHUTE_FILE_WRITER = {
    fs : require('fs')
}

var writeToParachuteReleased = function(text) {
    PARACHUTE_FILE_WRITER.fs.writeFile('/home/root/parachuteReleased', text, function(err) {
        if (err) throw err;
    });
}

var readParachuteReleased = function(cb) {
    PARACHUTE_FILE_WRITER.fs.readFile('/home/root/parachuteReleased', function(err, data) {
        if(err) cb('0');
        else cb(data.toString());
    })
}

var currAlti = 1220
var subtractThisMuch = 13;
var groundLevel = 1000;
var counter = 0;

//Run this to test parachute code
//opts.currAlti, opts.subtractThisMuch, opts.groundLevel
var testParachuteWithDummyCode = function(opts) {
    opts = opts||{};
    PARACHUTE_VARIABLES.RUNNING_TEST_CODE = 1;
    var currAlti = opts.currAlti||1220;
    var subtractThisMuch = opts.subtractThisMuch||13;
    var groundLevel = opts.groundLevel||1000;
    var counter = 0;
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
        PARACHUTE_VARIABLES.RUNNING_TEST_CODE = 0;
    });
}

