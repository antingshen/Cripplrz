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