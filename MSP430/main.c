#include <msp430g2553.h>

#define SDA_PIN BIT7
#define SCL_PIN BIT6
#define RGB_ADDRESS (0xc4 >> 1)

int i2c_bytes_remaining;
unsigned char* i2c_data;

void i2c_init() {
	__enable_interrupt();
	P1SEL |= SDA_PIN | SCL_PIN;		// Set pins to I2C mode
	P1SEL2 |= SDA_PIN | SCL_PIN;

	UCB0CTL1 |= UCSWRST;			// I2C software reset
	UCB0CTL0 = UCMST | UCMODE_3 | UCSYNC;	// I2C Master
	UCB0CTL1 |= UCSSEL_2;			// Use SMCLK

	UCB0BR0 = 12;					// 15 Hz I2C

	UCB0CTL1 &= ~UCSWRST;			// re-enable
	IE2 |= UCB0TXIE;
}

void i2c_send(unsigned char address, unsigned char* data, int bytes) {
	UCB0I2CSA = address;		// Set slave addr
	UCB0CTL1 |= UCTR; 			// Transmit mode
	i2c_bytes_remaining = bytes;
	i2c_data = data;
	UCB0CTL1 |= UCTXSTT;		// Start
}

static const unsigned char rgb_default_data[] = {0x80,
		0x80, 0x0d, // 0, 1
		0xff, 0xff, 0xff, 0x00, // B, G, R, NC
		0xff, 0x00,  // 6, 7
		0xaa, // 8
};
void turn_on_led() {
	i2c_send(RGB_ADDRESS, rgb_default_data, 10);
}

int main(void) {
    WDTCTL = WDTPW | WDTHOLD;		// Stop watchdog timer

    P1DIR |= BIT0;

	i2c_init();
	turn_on_led();

	for (;;);
}

#pragma vector = USCIAB0TX_VECTOR
__interrupt void USCIAB0TX_ISR(void) {
	P1OUT ^= BIT0;
	if (i2c_bytes_remaining == 0) {
		UCB0CTL1 |= UCTXSTP;
		return;
	}
	UCB0TXBUF = *i2c_data;
	i2c_data++;
	i2c_bytes_remaining--;
}
