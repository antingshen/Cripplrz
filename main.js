var m = require('mraa');

var COMPASS_OBJECT;

var radToDegree = function(rad) {
    return (rad*180/Math.PI);
}

var initCompass = function() {
    var instance = new m.I2c(0);
    instance.address(0x1e);

    var b = new Buffer(2);

    b[0] = 0x00;
    b[1] = 0x70;
    instance.write(b);

    b[0] = 0x01;
    b[1] = 0xA0;
    instance.write(b);

    b[0] = 0x02;
    b[1]= 0x00;
    instance.write(b);

    COMPASS_OBJECT = instance;

    return instance;
}

var readCompass = function(i) {
    i = i||COMPASS_OBJECT;
    var b = new Buffer(1);
    b[0] = 0x03;
    i.address(0x1e);
    i.write(b);
    b = COMPASS_OBJECT.read(6);

    var x = ((((b[0] << 8) | b[1]) << 16) >> 16),
        z = ((((b[2] << 8) | b[3]) << 16) >> 16),
        y = ((((b[4] << 8) | b[5]) << 16) >> 16);

    var direction = Math.atan2(y*0.92, x*0.92);

    if (direction < 0)
        direction += 2 * Math.PI;

    console.log(b[0], b[1], b[2], b[3], b[4], b[5]);

    console.log("Compass data: " + [x,y,z].join(","));
    console.log("Heading: " + radToDegree(direction));
    return {
        x: x,
        y: y,
        z: z,
        heading: direction
    };
}

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

var readGPS = function(degree, minute) {
    return degree + (0.0166666667*minute);
}

var m = require('mraa');

var LEFT_PWM = 3;
var LEFT_HI = 12;
var LEFT_LO = 13;

var RIGHT_PWM = 5;
var RIGHT_HI = 7;
var RIGHT_LO = 8;

var MOTOR_PINS = {
    digital: {},
    analog: {}
};

var mapRange = function(value, low1, high1, low2, high2) {
    if(value > 0)
        return low2 + (high2 - low2) * (value - low1) / (high1 - low1);
    else
        return -1*(low2 + (high2 - low2) * (value - low1) / (high1 - low1));
}

var readPins = function() {
    console.log("LEFT PWM " + MOTOR_PINS.analog.left_pwm.read());
    console.log("LEFT HI " + MOTOR_PINS.digital.left_hi.read());
    console.log("LEFT LO " + MOTOR_PINS.digital.left_lo.read());
    console.log("RIGHT PWM " + MOTOR_PINS.analog.right_pwm.read());
    console.log("RIGHT HI " + MOTOR_PINS.digital.right_hi.read());
    console.log("RIGHT LO " + MOTOR_PINS.digital.right_lo.read());
}

var initMotors = function() {
    MOTOR_PINS.analog.left_pwm = new m.Pwm(LEFT_PWM);
    MOTOR_PINS.digital.left_hi = new m.Gpio(LEFT_HI);
    MOTOR_PINS.digital.left_lo = new m.Gpio(LEFT_LO);

    MOTOR_PINS.analog.right_pwm = new m.Pwm(RIGHT_PWM);
    MOTOR_PINS.digital.right_hi = new m.Gpio(RIGHT_HI);
    MOTOR_PINS.digital.right_lo = new m.Gpio(RIGHT_LO);

    for(var prop in MOTOR_PINS.digital) {
        MOTOR_PINS.digital[prop].dir(m.DIR_OUT);
    }

    for(var prop in MOTOR_PINS.analog) {
        MOTOR_PINS.analog[prop].enable(true);
    }
}

var driveLeftMotor = function(speed) {
    setLeftSpeed(speed);
    setLeftDirection(speed);
}

var driveRightMotor = function(speed) {
    setRightSpeed(speed);
    setRightDirection(speed);
}

var setLeftSpeed = function(speed) {
    MOTOR_PINS.analog.left_pwm.write(mapRange(speed, 0, 100, 0, 1));
}

var setRightSpeed = function(speed) {
    MOTOR_PINS.analog.right_pwm.write(mapRange(speed, 0, 100, 0, 1));
}

var brakeMotors = function() {
    brakeLeftMotor();
    brakeRightMotor();
}

var brakeLeftMotor = function() {
    MOTOR_PINS.digital.left_hi.write(1);
    MOTOR_PINS.digital.left_lo.write(1);
}

var brakeRightMotor = function() {
    MOTOR_PINS.digital.right_hi.write(1);
    MOTOR_PINS.digital.right_lo.write(1);
}

var setLeftDirection = function(val) {
    MOTOR_PINS.digital.left_hi.write(val > 0 ? 1 : 0);
    MOTOR_PINS.digital.left_lo.write(val < 0 ? 1 : 0);
}

var setRightDirection = function(val) {
    MOTOR_PINS.digital.right_hi.write(val > 0 ? 1 : 0);
    MOTOR_PINS.digital.right_lo.write(val < 0 ? 1 : 0);
}

var CONFIGURATION = {
    timeStep: 100,
    motorStep: 10,
    currentLeft: 0,
    currentRight: 0,
    targetLeft: 0,
    targetRight: 0,
    interval: 0
}

//value is 0-100, will be coerced to 0.0-1.0
var driveMotors = function(leftSpeed, rightSpeed) {
    CONFIGURATION.targetLeft = leftSpeed;
    CONFIGURATION.targetRight = rightSpeed;
}

var initMotorControl = function(opts) {
    opts = opts||{};
    CONFIGURATION.timeStep = opts.timeStep||CONFIGURATION.timeStep;
    CONFIGURATION.motorStep = opts.motorStep||CONFIGURATION.motorStep;

    changeInterval();
}

var changeInterval = function(newTimeStep) {
    clearInterval(CONFIGURATION.interval);

    CONFIGURATION.timeStep = newTimeStep||CONFIGURATION.timeStep;

    CONFIGURATION.interval = setInterval(function() {
        driveLeftMotorStepped();
        driveRightMotorStepped();
    }, CONFIGURATION.timeStep);
}

//determines for one timestep
var determineNextSpeed = function(current, target) {
    if(Math.abs(target - current) > CONFIGURATION.motorStep) {
        return (target > current) ? current + CONFIGURATION.motorStep : current - CONFIGURATION.motorStep;
    } else {
        return target;
    }
}

var driveLeftMotorStepped = function() {
    if(CONFIGURATION.currentLeft !== CONFIGURATION.targetLeft) {
        var spd = determineNextSpeed(CONFIGURATION.currentLeft, CONFIGURATION.targetLeft);
        console.log("Drive left " + spd);
        driveLeftMotor(spd);
        CONFIGURATION.currentLeft = spd;
    }
}

var driveRightMotorStepped = function() {
    if(CONFIGURATION.currentRight !== CONFIGURATION.targetRight) {
        var spd = determineNextSpeed(CONFIGURATION.currentRight, CONFIGURATION.targetRight);
        console.log("Drive right " + spd);
        driveRightMotor(spd);
        CONFIGURATION.currentRight = spd;
    }
}

var m = require('mraa');

var DIR_LEFT = 0,
    DIR_RIGHT = 1;

var START_GPS = {
    latitude: 37.8718992,
    longitude: -122.25853990000002
}

var END_GPS = {
    latitude: 40.874722,
    longitude: -118.73555599999997
}

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
    if(direction == DIR_LEFT) {
        console.log("Turning left with " + magnitude + " : " + determineMagnitude(magnitude) + ", 100");
        driveMotors(determineMagnitude(magnitude), 100);
    } else {
        console.log("Turning right with " + magnitude + " : " + "100, " + determineMagnitude(magnitude));
        driveMotors(100, determineMagnitude(magnitude));
    }
}

var determineMagnitude = function(diff) {
    return (0+(Math.PI - diff)*30/Math.PI);
}

var determineTurn = function(curHeading, finHeading, cb) {
    var cur = readCompass();
    var fin = determineDiff(START_GPS, END_GPS);

    console.log(curHeading + " to " + finHeading);

    if(finHeading > curHeading) {
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
    var fin = determineDiff(START_GPS, END_GPS);

    determineTurn(cur.heading, fin.heading, turnFromMagnitude);
}

initCompass();
initMotors();
initMotorControl();