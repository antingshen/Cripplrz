#include <msp430g2553.h>
#include "gps.h"

void gps_init() {
    P1OUT &= ~GPS_PWR;
    P1DIR |= GPS_PWR;
    P1SEL |= RXD_PIN | TXD_PIN;
    P1SEL2 |= RXD_PIN | TXD_PIN;

    UCA0CTL1 |= UCSSEL_2;   // SMCLK

    UCA0BR0 = 52;
    UCA0BR1 = 0;
    UCA0MCTL = 0x10 | UCOS16;   // BRF0 = 1, Oversample
    UCA0CTL1 &= ~UCSWRST;
}

void gps_receive() {
    GPS_ON;
    IE2 |= UCA0RXIE;
    display_index = 0;
    LPM0;
    GPS_OFF;
}

// Called from USCIAB0RX_ISR when UCA0RXIE is set
inline int uart_receive() {
    if (display_index == 32) {
        IFG2 &= ~UCA0RXIFG;
        IE2 &= ~UCA0RXIE;
        return 1;
    }
    display_buffer[display_index] = UCA0RXBUF;
    display_index++;
    return 0;
}
