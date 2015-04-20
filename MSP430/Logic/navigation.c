#include "navigation.h"

int determineQuadrant(int x, int y)
{
    if(y > 0)
        return x > 0 ? 1 : 2;
    else
        return x > 0 ? 4 : 3;
}

int abs(int x)
{
    return x > 0 ? x : -1*x;
}

void turnMotors(int left, int right)
{
    set_left_motor(abs(left), FORWARD);
    set_right_motor(abs(right), FORWARD);
}

void turnSameQuadrant(int x, int y, int destX, int destY)
{
    int difference = destY/destX - y/x;
    //int difference = 0;
    turnMotors(100 - difference, 100 + difference);
}

void determineTurn(int curX, int curY, int magX, int magY, int destX, int destY)
{
    int gpsX = destX - curX, gpsY = destY - curY, dirX = -magX, dirY = magY;
    int gpsQuad = determineQuadrant(gpsX, gpsY)%4;
    int dirQuad = determineQuadrant(dirX, dirY)%4;

    if(gpsQuad == dirQuad)
        turnSameQuadrant(dirX, dirY, gpsX, gpsY);
    else if(gpsQuad == 0 && dirQuad == 3)
        turnMotors(50, 100);
    else if(gpsQuad > dirQuad) // turn left
        turnMotors(50, 100);
    else
        turnMotors(100, 50);
}
