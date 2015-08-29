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
