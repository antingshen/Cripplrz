#include <msp430g2553.h>

#include "config.h"
#include "i2c.h"
#include "motor.h"
#include "gps.h"

void init() {
    WDTCTL = WDTPW | WDTHOLD;        // Stop watchdog timer
    __enable_interrupt();
    P3REN = ~0;

    i2c_init();
    __delay_cycles(50000);
    lcd_init();
//    motor_init();
//    compass_init();
    gps_init();
}

int main(void) {
    while (1) {
        gps_receive();
        lcd_write(LCD_TOP_LINE, display_buffer, 16);
        lcd_write(LCD_BOT_LINE, display_buffer+16, 16);
        P1IE |= BUTTON;
        LPM0;
    }
}

#pragma vector=PORT1_VECTOR
__interrupt void Port_1(void) {
    P1IFG &= ~BUTTON;
    P1IE &= ~BUTTON;
    LPM0_EXIT;
}




