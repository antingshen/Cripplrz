#include "motor.h"

#define LMOTOR_DUTY TA1CCR1
#define RMOTOR_DUTY TA1CCR2

void motor_init() {
    TA1CCR0 = 99;
    TA1CCTL1 = OUTMOD_7;
    TA1CCTL2 = OUTMOD_7;
    LMOTOR_DUTY = 0xffff;   // Start as off
    RMOTOR_DUTY = 0xffff;
    P2OUT = 0;
    P2DIR = 0xff;
    P2SEL = LMOTOR_EN | RMOTOR_EN;
    TA1CTL = TASSEL_2       // Use SMCLK (system clock)
            | MC_1          // Timer counts up to TACCR0
            | ID_3;         // Divide clock input by 8
    set_left_motor(100, FORWARD);
    set_right_motor(100, FORWARD);
}

void set_left_motor(int speed, int direction) {
    LMOTOR_DUTY = speed;
    if (direction == FORWARD) {
        P2OUT |= LMOTOR_HI;
        P2OUT &= ~LMOTOR_LO;
    } else {
        P2OUT &= ~LMOTOR_HI;
        P2OUT |= LMOTOR_LO;
    }
    left_motor_dir = direction;
}

void set_right_motor(int speed, int direction) {
    RMOTOR_DUTY = speed;
    if (direction == FORWARD) {
        P2OUT |= RMOTOR_HI;
        P2OUT &= ~RMOTOR_LO;
    } else {
        P2OUT &= ~RMOTOR_HI;
        P2OUT |= RMOTOR_LO;
    }
    right_motor_dir = direction;
}
