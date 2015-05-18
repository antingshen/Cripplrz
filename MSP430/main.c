#include <msp430g2553.h>
#include <string.h>

#include "config.h"
#include "i2c.h"
#include "motor.h"
#include "gps.h"
#include "timer.h"

//#define TEST_MOTOR
#define TEST_GPS
//#define TEST_FINAL

void init() {
    WDTCTL = WDTPW | WDTHOLD;    // Stop watchdog timer
    P1DIR = 0;
    P2DIR = 0;
    __enable_interrupt();
    BCSCTL1 = CALBC1_16MHZ;      // Set CPU clock
    DCOCTL = CALDCO_16MHZ;
    P3REN = ~0;
    P1DIR |= LED_PIN;
    led_on;

    timer_init();

#if defined(TEST_GPS) || defined(TEST_FINAL)
    gps_init();
    i2c_init();
    lcd_init();
#endif

#if defined(TEST_MOTOR) || defined(TEST_FINAL)
    motor_init();
#endif

#ifdef TEST_FINAL
    compass_init();
#endif
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

void gps_test() {
    P1DIR &= ~(LBUTTON);
    P1REN |= LBUTTON;
    P1OUT |= LBUTTON;
    P1IES |= LBUTTON;

    while (1) {
        P1IFG &= ~LBUTTON;
        P1IE |= LBUTTON;
        gps_receive();
        lcd_write(LCD_TOP_LINE, display_buffer, 16);
        lcd_write(LCD_BOT_LINE, display_buffer+16, 16);
    }
}

int main(void) {
    init();

#ifdef TEST_MOTOR
    motor_test();
#endif

#ifdef TEST_GPS
    gps_test();
#endif
}


#pragma vector=PORT1_VECTOR
__interrupt void Port_1(void) {
    P1IE &= ~(LBUTTON | RBUTTON);
    __enable_interrupt();
    if (P1IFG & LBUTTON) {
#ifdef TEST_MOTOR
       set_left_motor(100, ~left_motor_dir);
#endif
#ifdef TEST_GPS
       LPM0_EXIT;
#endif
    } else if (P1IFG & RBUTTON) {
#ifdef TEST_MOTOR
        set_right_motor(100, ~right_motor_dir);
#endif
    }
    wait_milis(500);
    P1IFG &= ~(LBUTTON | RBUTTON);
    P1IE |= (LBUTTON | RBUTTON);
}

