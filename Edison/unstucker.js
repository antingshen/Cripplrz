var UNSTUCKER_VARIABLES = {
    rotateCount : 0,
    ROTATIONAL_TRIES : 10,
    WIGGLE_TRIES : 5,
}

var isStuck = function() {
    console.log("Checking stuckness");
    if (SAMPLING_VARIABLES.gpsValues.length < PARACHUTE_VARIABLES.TOTAL_VALUES_TO_STORE) {
        console.log("Still stuck. Not enough data.");
        return false;
    } else {
        var currGPSVal;
        if (PARACHUTE_VARIABLES.RUNNING_TEST_CODE) {
            currGPSVal = copyGPSObject(getGPSTest());
        } else {
            currGPSVal = copyGPSObject(getGPS());
        }

        if (Math.abs(SAMPLING_VARIABLES.gpsLonAverage - currGPSVal.longitude) < PARACHUTE_VARIABLES.GPS_AVERAGE_THRESHOLD_LAT_LON && Math.abs(SAMPLING_VARIABLES.gpsLatAverage - currGPSVal.latitude) < PARACHUTE_VARIABLES.GPS_AVERAGE_THRESHOLD_LAT_LON) {
            console.log("Still stuck.");
            return true;
        } else {
            console.log("Not stuck anymore. We should be able to move again.");
            return false;
        }
    }
}

var testUnstucker = function() {
    PARACHUTE_VARIABLES.RUNNING_TEST_CODE = 1;
    changeGPSValues();
    resampleGPSValues();
    console.log(isStuck());
}

var changeGPSValues = function() {
    SAMPLING_VARIABLES.gpsValues = [
        {latitude : 50, longitude : 50, altitude : 0},
        {latitude : 60, longitude : 60, altitude : 0},
        {latitude : 70, longitude : 70, altitude : 0},
        {latitude : 80, longitude : 50, altitude : 0},
        {latitude : 90, longitude : 50, altitude : 0},
        {latitude : 100, longitude : 50, altitude : 0},
        {latitude : 110, longitude : 50, altitude : 0},
        {latitude : 110, longitude : 60, altitude : 0},
        {latitude : 115, longitude : 65, altitude : 0},
        {latitude : 125, longitude : 55, altitude : 0},
    ];
}

var resampleGPSValues = function() {
    var totalLat = 0;
    var totalLon = 0;
    for (element in SAMPLING_VARIABLES.gpsValues) {
        totalLat += SAMPLING_VARIABLES.gpsValues[element].latitude;
        totalLon += SAMPLING_VARIABLES.gpsValues[element].longitude;
    }
    SAMPLING_VARIABLES.gpsLonAverage = totalLon / SAMPLING_VARIABLES.gpsValues.length;
    SAMPLING_VARIABLES.gpsLatAverage = totalLat / SAMPLING_VARIABLES.gpsValues.length;
}

var rotateClockwise = function() {
    console.log("Rotating clockwise");
    //driveMotors(100, -100);
}

var rotateCounterClockwise = function() {
    console.log("Rotating counter clockwise");
    //driveMotors(-100, 100);
}

var goBackwards = function() {
    console.log("Moving backwards");
    //driveMotors(-100, -100);
}

var goForwards = function() {
    console.log("Moving forwards");
    //driveMotors(100, 100);
}

var stopMotors = function() {
    console.log("Braking");
    //driveMotors(0, 0);
}

var wiggle = function() {
    for(var i = 0; i < UNSTUCKER_VARIABLES.WIGGLE_TRIES; i++)
    {
        driveMotors(100, 50);
        setTimeout(function() {
            driveMotors(50, 100);
        }, 2000);
        setTimeout(stopMotors, 4000);
    }
}

var unstuckProcedure = function(cb) {
    unstuckProcedureClockwise(cb);
}

var unstuckProcedureClockwise = function(cb) {
    console.log("Initiated unstuckProcedureClockwise");
    UNSTUCKER_VARIABLES.rotateCount = 0;

    var idToClear = setInterval(function() {
        console.log("I'm inside!");
        if (UNSTUCKER_VARIABLES.rotateCount >= UNSTUCKER_VARIABLES.ROTATIONAL_TRIES) {
            clearInterval(idToClear);
            unstuckProcedureCounterClockwise();
            if (cb) {
                cb();
            }
        }

        goBackwards();
        setTimeout(goForwards, 5000);
        setTimeout(function() {
            stopMotors();

            if (!isStuck()) {
                clearInterval(idToClear);
                if (cb) {
                    cb();
                }
            } else {
                rotateClockwise();
                setTimeout(stopMotors, 500);
                //wiggle();
                UNSTUCKER_VARIABLES.rotateCount += 1;
            }
        }, 15000);
    }, 20000 + (4000 * UNSTUCKER_VARIABLES.WIGGLE_TRIES));
}

var unstuckProcedureCounterClockwise = function(cb) {
    console.log("Initiated unstuckProcedureCounterClockwise");
    UNSTUCKER_VARIABLES.rotateCount = 0;

    var idToClear = setInterval(function() {
        if (UNSTUCKER_VARIABLES.rotateCount >= UNSTUCKER_VARIABLES.ROTATIONAL_TRIES) {
            clearInterval(idToClear);
            if (cb) {
                cb();
            }
        }

        goBackwards();
        setTimeout(goForwards, 5000);
        setTimeout(function() {
            stopMotors();

            if (!isStuck()) {
                clearInterval(idToClear);
                if (cb) {
                    cb();
                }
            } else {
                rotateCounterClockwise();
                setTimeout(stopMotors, 500);
                //wiggle();
                UNSTUCKER_VARIABLES.rotateCount += 1;
            }
        }, 15000);
    }, 20000 + (4000 * UNSTUCKER_VARIABLES.WIGGLE_TRIES));
}
