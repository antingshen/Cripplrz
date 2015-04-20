#include <msp430g2553.h>

#ifndef CONFIG_H_
#define CONFIG_H_

/**
 * Port 1 BIT6 maps to Pin 1.6, etc.
 */

// PORT 1
#define GPS_PWR BIT0
#define RXD_PIN BIT1
#define TXD_PIN BIT2
#define LBUTTON BIT3
#define LED_PIN BIT4
#define RBUTTON BIT5
#define SCL_PIN BIT6
#define SDA_PIN BIT7

// PORT 2
#define LMOTOR_HI BIT0
#define LMOTOR_EN BIT1
#define LMOTOR_LO BIT2
#define RMOTOR_LO BIT3
#define RMOTOR_EN BIT4
#define RMOTOR_HI BIT5

#define led_on      P1OUT |= LED_PIN
#define led_off     P1OUT &= ~LED_PIN
#define led_toggle  P1OUT ^= LED_PIN

#endif /* CONFIG_H_ */
