#include "gpsparser.h"

void strToDegreeSplit(char *coord, int isLon) {
    int coordLn;

    if (isLon) {
        coordLn = LON_LN;
    } else {
        coordLn = LAT_LN;
    }

    char *coordMinChar = &coord[coordLn - MIN_START];

    int coordDeg = 0;
    _q9 coordMinFP = 0;
    _q9 multFactor = 10;

    //Converts string longitude degrees to fixed-point degrees
    for (int j = 0; j < coordLn - MIN_START; j++) {
        coordDeg = coordDeg * 10 + coord[j] - '0';
    }

    //Converts string minutes to fixed-point minutes
    for (int i = 0; i < MIN_START; i++) {
        coordMinFP = coordMinFP + multFactor * (coordMinChar[i] - '0');
        multFactor = multFactor / 10;
    }

    if (isLon) {
        longitudeDeg = coordDeg;
        longitudeMinutes = coordMinFP;
    } else {
        latitudeDeg = coordDeg;
        latitudeMinutes = coordMinFP;
    }
}
