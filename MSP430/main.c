#include <msp430g2553.h>

#include "config.h"
#include "i2c.h"
#include "motor.h"
#include "gps.h"
#include "timer.h"

void init() {
    WDTCTL = WDTPW | WDTHOLD;    // Stop watchdog timer
    __enable_interrupt();
    BCSCTL1 = CALBC1_16MHZ;      // Set CPU clock
    DCOCTL = CALDCO_16MHZ;
    P3REN = ~0;

    timer_init();
//    gps_init();
//    i2c_init();
//    lcd_init();

    motor_init();
//    compass_init();
}

void motor_test() {
    P1DIR &= ~(LBUTTON | RBUTTON);
    P1REN |= LBUTTON | RBUTTON;
    P1OUT |= LBUTTON | RBUTTON;
    P1IFG &= ~(LBUTTON | RBUTTON);
    P1IE |= LBUTTON | RBUTTON;
    P1IES |= LBUTTON | RBUTTON;
    set_left_motor(100, FORWARD);
    set_right_motor(100, FORWARD);
    LPM0;
}

int main(void) {
    init();
    motor_test();

//    P1DIR &= ~(LBUTTON);
//    P1REN |= LBUTTON;
//    P1OUT |= LBUTTON;
//    P1IES |= LBUTTON;
//
//    while (1) {
//        P1IFG &= ~LBUTTON;
//        P1IE |= LBUTTON;
//        gps_receive();
//        lcd_write(LCD_TOP_LINE, display_buffer, 16);
//        lcd_write(LCD_BOT_LINE, display_buffer+16, 16);
//        LPM0;
//    }
}


#pragma vector=PORT1_VECTOR
__interrupt void Port_1(void) {
    __delay_cycles(1000);
    if (P1IN & LBUTTON && P1IN & RBUTTON) {
        P1IFG &= ~(LBUTTON | RBUTTON);
        return;
    }
    P1IE &= ~(LBUTTON | RBUTTON);
    __enable_interrupt();
    if (P1IFG & LBUTTON) {
       set_left_motor(100, ~left_motor_dir);
    } else if (P1IFG & RBUTTON) {
        set_right_motor(100, ~right_motor_dir);
    }
    __delay_cycles(100000);
    P1IFG &= ~(LBUTTON | RBUTTON);
    P1IE |= (LBUTTON | RBUTTON);
}


