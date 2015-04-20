/*
include libraries for current reading here
*/
#include "../timer.h"
#include "../motor.h"

#define ADJUSTMENT_VALUE 5 //how much to adjust a turn
#define FORWARD_SECONDS 5 //how long to go forwards for
#define TURN_TRIES 10 //how many times to try a turn before spinning
#define ROTATIONAL_TRIES 2 //how many times to spin before just giving up
#define SPIN_SECONDS 5 //how long to spin for
#define WIGGLE_SECONDS 1 //how long to wiggle for
#define WIGGLE_TRIES 5
#define BACKWARD_SPEED -200
#define BACKWARD_SECONDS 2 //how long to go backwards

#ifndef UNSTU_H_
#define UNSTU_H_

int is_stuck();

void unstuck_procedure(int initial_left, int initial_right);

#endif /* UNSTU_H_ */
