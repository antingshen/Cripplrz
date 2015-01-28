#include <msp430g2553.h>
#include "pinmap.h"

#ifndef MOTOR_H_
#define MOTOR_H_

#define FORWARD 0
#define REVERSE 1

/* Starts motor timer and defaults to off */
void motor_init();

/**
 * speed is an int between 0 to 100, with 0 being off and 100 full power
 * values in between will be pwm duty percent.
 *
 * direction is FORWARD or REVERSE
 * In FORWARD mode, current flows from MOTOR_HI pin to MOTOR_LO.
 * In REVERSE mode this is reversed.
 */
void set_left_motor(int speed, int direction);
void set_right_motor(int speed, int direction);


#define LMOTOR_DUTY TA1CCR1
#define RMOTOR_DUTY TA1CCR2

#endif /* MOTOR_H_ */
