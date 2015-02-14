#include <msp430g2553.h>
#include "gps.h"

void gps_init() {
    P1SEL |= RXD_PIN | TXD_PIN;
    P1SEL2 |= RXD_PIN | TXD_PIN;

    UCA0CTL1 |= UCSSEL_2;   // SMCLK

    UCA0BR0 = 52;
    UCA0BR1 = 0;
    UCA0MCTL = 0x10 | UCOS16;   // What does this do??
}

void gps_receive() {
    IE2 |= UCA0RXIE;
    display_index = 0;
    LPM0;
}

// Called from USCIAB0RX_ISR when UCA0RXIE is set
inline int uart_receive() {
    if (display_index == 32) {
        return 1;
    }
    display_buffer[display_index] = UCA0RXBUF;
    display_index++;
    return 0;
}
