var ROTATIONAL_TRIES = 10;
var TURN_TRIES = 5;
var ADJUSTMENT_THRESHOLD = 5;
var WIGGLE_TRIES = 10;

var isStuck = function() {
    if (gpsValues.length < TOTAL_VALUES_TO_STORE) {
        return false;
    } else {
        var currGPSVal;
        if (RUNNING_TEST_CODE) {
            currGPSVal = copyGPSObject(getGPSTest());
        } else {
            currGPSVal = copyGPSObject(getGPS());
        }

        if (Math.abs(gpsLonAverage - currGPSVal.longitude) < GPS_AVERAGE_THRESHOLD_LAT_LON || Math.abs(gpsLatAverage - currGPSVal.latitude) < GPS_AVERAGE_THRESHOLD_LAT_LON) {
            return true;
        } else {
            return false;
        }
    }
}

var rotateClockwise = function() {
    driveMotors(100, -100);
    //Needs timeout time
}

var rotateCounterClockwise = function() {
    driveMotors(-100, 100);
    //Needs timeout time
}

var goBackwards = function() {
    driveMotors(-100, -100);
    //Needs timeout time
}

var goForwards = function() {
    driveMotors(100, 100);
    //Needs timeout time
}

var wiggle = function() {
    for(var i = 0; i < WIGGLE_TRIES; i++)
    {
        driveMotors(100, 50);
        //Needs timeout time
        driveMotors(50, 100);
        //Needs timeout time
        if(!isStuck()) {
            return;
        }
    }
}

var unstuckProcedure = function(initialLeft, initialRight) {
    for(var j = 0; j < ROTATIONAL_TRIES; j++) {
        for(var i = 0; !isStuck() && i < TURN_TRIES; i++) {
            goBackwards();
            goForwards(initial_left, initial_right);
        }

        if(isStuck()) {
            rotateClockwise();
            wiggle();
        } else {
            return;
        }
    }

    for(var j = 0; j < 2 * ROTATIONAL_TRIES; j++) {
        for(var i = 0; !isStuck() && i < TURN_TRIES; i++) {
            goBackwards();
            goForwards(initial_left, initial_right);
        }

        if(isStuck()) {
            rotateCounterClockwise();
            wiggle();
        } else {
            return;
        }
    }
}
