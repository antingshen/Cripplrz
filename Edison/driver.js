var m = require('/usr/lib/node_modules/mraa');

var DIR_LEFT = 0,
    DIR_RIGHT = 1,
    DIR_FORWARD = 2;

var START_GPS = {
    latitude: 37.8718992,
    longitude: -122.25853990000002
}

var END_GPS = {
    latitude: 40.874722,
    longitude: -118.73555599999997
}

var MEMORIAL_GPS = {
    latitude: 37.8724111,
    longitude: -122.2576996
}

var SLOWER_WHEEL_SPEED = 50,
    FASTER_WHEEL_SPEED = 100;

var FINAL_GPS = END_GPS;

var determineDiff = function(start, end) {
    var y = end.latitude - start.latitude;
    var x = end.longitude - start.longitude;

    var direction = Math.atan2(y, x);

    if (direction < 0)
        direction += 2 * Math.PI;

    return {
        x: x,
        y: y,
        heading: direction
    };
}

var turnFromMagnitude = function(direction, magnitude) {
    if(direction === DIR_LEFT) {
        console.log("Turning left with " + magnitude + " : " + determineMagnitude(magnitude) + ", 100");
        //driveMotors(determineMagnitude(magnitude), FASTER_WHEEL_SPEED );
    } else if(direction === DIR_RIGHT) {
        console.log("Turning right with " + magnitude + " : " + "100, " + determineMagnitude(magnitude));
        //driveMotors(FASTER_WHEEL_SPEED, determineMagnitude(magnitude));
    } else {
        console.log("Going forward at magnitude speed!");
        //driveMotors(FASTER_WHEEL_SPEED, FASTER_WHEEL_SPEED);
    }
}

var determineMagnitude = function(diff) {
    return SLOWER_WHEEL_SPEED; //(70+(Math.PI - diff)*30/Math.PI);
}

var determineTurn = function(curHeading, finHeading, cb) {
    var cur = readCompass();
    var fin = determineDiff(getGPS(), END_GPS);

    console.log(curHeading + " to " + finHeading);

    if(Math.abs(finHeading - curHeading) < Math.PI/4) {
        cb(DIR_FORWARD);
    } else if(finHeading > curHeading) {
        if(finHeading - curHeading > Math.PI) {
            console.log("1 Turn left");
            curHeading += 2*Math.PI;
            cb(DIR_LEFT, curHeading - finHeading);
        } else {
            console.log("2 Turn right");
            cb(DIR_RIGHT, finHeading - curHeading);
        }
    } else {
        if(curHeading - finHeading > Math.PI) {
            console.log("3 Turn right");
            finHeading += 2*Math.PI;
            cb(DIR_RIGHT, finHeading - curHeading);
        } else {
            console.log("4 Turn left");
            cb(DIR_LEFT, curHeading - finHeading);
        }
    }
}

var step = function() {
    var cur = readCompass();
    var fin = determineDiff(getGPS(), FINAL_GPS);

    determineTurn(cur.heading, fin.heading, turnFromMagnitude);
}
