var mainLoop = function() {
    setTimeout(function() {
        isStuck();
        step();
        mainLoop();
    }, 1000)
}