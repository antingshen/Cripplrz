#include "timer.h"

void timer_init() {
    seconds_since_startup = 0;
    BCSCTL3 = XCAP_3;   // Crystal capacitance to 12.5pF
    TA0CCTL0 = CCIE;    // Enable TimerA interrupt
    TA0CCR0 = 32767;    // Interrupt after this many ticks
    TA0CTL = TASSEL_1    // Use ACLK (crystal)
            | MC_1      // Timer counts up to TACCR0
            | ID_0;     // Divide clock input by 1
}

static int seconds_to_sleep = 0;
void wait_seconds(int seconds) {
    seconds_to_sleep = seconds + 1;
    LPM0;
}

void wait_milis(int milis) {
    __delay_cycles(16000*milis);
}

#pragma vector=TIMER0_A0_VECTOR
__interrupt void Timer_A(void) {
    seconds_since_startup += 1;
    if (seconds_to_sleep != 0) {
        seconds_to_sleep -= 1;
        if (seconds_to_sleep == 0) {
            LPM0_EXIT;
        }
    }
}
