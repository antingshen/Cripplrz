#include <msp430g2553.h>

#include "config.h"
#include "i2c.h"
#include "motor.h"
#include "gps.h"

void init() {
    WDTCTL = WDTPW | WDTHOLD;    // Stop watchdog timer
    __enable_interrupt();
    BCSCTL1 = CALBC1_8MHZ;      // Set CPU clock
    DCOCTL = CALDCO_8MHZ;
    BCSCTL3 = XCAP_3;           // Crystal capacitance to 12.5pF
    P3REN = ~0;

    gps_init();
    i2c_init();
    lcd_init();

//    motor_init();
//    compass_init();
}

void motor_test() {
    set_left_motor(100, FORWARD);
    set_right_motor(100, REVERSE);
    LPM0;
}

int main(void) {
    init();

    P1DIR &= ~(BUTTON);
    P1REN |= BUTTON;
    P1OUT |= BUTTON;

    P1DIR |= LED;
    P1OUT |= LED;
    while (1) {
        gps_receive();
        P1OUT &= ~LED;
        lcd_write(LCD_TOP_LINE, display_buffer, 16);
        lcd_write(LCD_BOT_LINE, display_buffer+16, 16);
        LPM0;
    }
}





