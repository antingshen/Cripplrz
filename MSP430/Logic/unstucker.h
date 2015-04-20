/*
include libraries for current reading here
*/
#include "../timer.h"
#include "../motor.h"

#define STUCK_THRESHOLD 200 //value for stall current
#define ADJUSTMENT_VALUE 5 //how much to adjust a turn
#define FORWARD_SECONDS 5 //how long to go forwards for
#define TURN_TRIES 10 //how many times to try a turn before spinning
#define ROTATIONAL_TRIES 2 //how many times to spin before just giving up
#define SPIN_SECONDS 5 //how long to spin for
#define BACKWARD_SPEED -200
#define BACKWARD_SECONDS 2 //how long to go backwards

#ifndef UNSTU_H_
#define UNSTU_H_

void unstuck_procedure(int initial_left, int initial_right);

#endif /* UNSTU_H_ */
