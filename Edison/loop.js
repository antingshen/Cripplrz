var mainLoop = function() {
    setTimeout(function() {
        if(isStuck()) {
            unstuckProcedure(mainLoop);
        } else {
            step();
            mainLoop();
        }
    }, 1000)
}