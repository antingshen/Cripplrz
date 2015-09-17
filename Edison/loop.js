var hasStartedSampling = 0;

var mainLoop = function() {
    if (!hasStartedSampling) {
        setInterval(sampleGPS, 5000);
        hasStartedSampling = 1;
    }
    setTimeout(function() {
        if (isStuck()) {
            unstuckProcedure(mainLoop);
        } else {
            step();
            mainLoop();
        }
    }, 1000)
}