#define MIN_START 6
#define LON_LN 9
#define LAT_LN 8

#ifndef GPARSER_H_
#define GPARSER_H_

int latitudeDeg;
_q9 latitudeMinutes;

int longitudeDeg;
_q9 longitudeMinutes;

void strToDegreeSplit(char *coord, int isLon);

#endif /* GPARSER_H_ */
