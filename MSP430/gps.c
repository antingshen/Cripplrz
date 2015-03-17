#include <msp430g2553.h>
#include "gps.h"

void gps_init() {
//    P1OUT &= ~GPS_PWR;
//    P1DIR |= GPS_PWR;
    P1SEL |= RXD_PIN | TXD_PIN;
    P1SEL2 |= RXD_PIN | TXD_PIN;

    UCA0CTL1 |= UCSSEL_2;   // SMCLK

    UCA0BR0 = 104;
    UCA0BR1 = 0;
    UCA0MCTL = 0x30 | UCOS16;   // BRF0 = 3, Oversample
    UCA0CTL1 &= ~UCSWRST;
}

void gps_receive() {
//    GPS_ON;
    int i;
    for (i = 0; i < 32; i++) {
        display_buffer[i] = 63;
    }
    IE2 |= UCA0RXIE;
    display_index = 0;
    LPM0;
//    GPS_OFF;
}


// Called from USCIAB0RX_ISR when UCA0RXIE is set
inline int uart_receive() {
    char data = UCA0RXBUF;

    if (display_index != 0 && data == '$') {
        display_index = 0;
        return 0;
    }
    switch (display_index) {
        case 0:
            if (data != '$') {
                return 0;
            }
            break;
        case 3:
            if (data == 'T') {      // Filter $GPTXT
                display_index = 0;
                return 0;
            }
            break;
        case 32:
            IFG2 &= ~UCA0RXIFG;
            IE2 &= ~UCA0RXIE;
            return 1;
        default:
            break;
    }
    if (display_index >= 0) {
        display_buffer[display_index] = data;
    }
    display_index++;
    return 0;
}


