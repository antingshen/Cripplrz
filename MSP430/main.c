#include <msp430g2553.h>

#include "pinmap.h"
#include "i2c.h"
#include "motor.h"

void init() {
    WDTCTL = WDTPW | WDTHOLD;        // Stop watchdog timer
    __enable_interrupt();
    P3REN = ~0;

//    i2c_init();
//    lcd_init();
//    motor_init();
//    compass_init();
}

int main(void) {
    init();

}







