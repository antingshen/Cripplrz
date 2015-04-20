#include <msp430g2553.h>

#ifndef TIMER_H_
#define TIMER_H_

/**
 * Number of seconds since timer init
 */
int seconds_since_startup;

void timer_init();

/**
 * Sleep for between [seconds] and [seconds]+1 seconds
 */
void wait_seconds(int seconds);

/**
 * Busy wait for [milis] miliseconds
 */
void wait_milis(int milis);

#endif /* TIMER_H_ */
