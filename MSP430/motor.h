#include <msp430g2553.h>
#include "config.h"

#ifndef MOTOR_H_
#define MOTOR_H_

#define FORWARD 0
#define REVERSE (~FORWARD)

/* Starts motor timer and defaults to off */
void motor_init();

/**
 * Current motor directions
 */
int left_motor_dir;
int right_motor_dir;

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

#endif /* MOTOR_H_ */
