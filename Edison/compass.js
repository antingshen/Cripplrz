var m = require('/usr/lib/node_modules/mraa');

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

    /*if (direction < 0)
        direction += 2 * Math.PI;*/

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
