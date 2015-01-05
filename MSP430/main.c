#include <msp430g2553.h>

#define SDA_PIN BIT7
#define SCL_PIN BIT6
#define RGB_ADDRESS	0x62
#define LCD_ADDRESS 0x3e
#define LCD_TOP_LINE 0x80
#define LCD_BOT_LINE 0xc0
#define LCD_NUL_ADDR 0x00

#define DATA_SEND_MODE	0	// Send i2c_data until i2c_bytes_remaining is 0. Then exit LPM0
#define DATA_RECV_MODE	1
#define LCD_INIT_MODE	2
#define LCD_WRITE_MODE	3
int i2c_mode;
int i2c_bytes_remaining;
unsigned char* i2c_data;

void i2c_init() {
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
	i2c_mode = DATA_SEND_MODE;
	UCB0CTL1 |= UCTXSTT;		// Start
}

static const unsigned char rgb_default_data[] = {0x80,
		0x80, 0x0d, // 0, 1
		0xff, 0xff, 0xff, 0x00, // B, G, R, NC
		0xff, 0x00,  // 6, 7
		0xaa, // 8
};
static const unsigned char lcd_default_data[] = {
		0x80, 0x3f,
		0x80, 0x3f,
		0x80, 0x3f,
		0x80, 0x0c,
		0x80, 0x01,
		0x80, 0x60,
		0x80, LCD_TOP_LINE
};
void lcd_init() {
	i2c_send(RGB_ADDRESS, (unsigned char*)rgb_default_data, 10);
	LPM0;
	i2c_send(LCD_ADDRESS, (unsigned char*)lcd_default_data, 14);
	i2c_mode = LCD_INIT_MODE;
	LPM0;
	__delay_cycles(50000);
}
unsigned char lcd_addr;
void lcd_write(unsigned char addr, char* string, int bytes) {
	UCB0I2CSA = LCD_ADDRESS;
	UCB0CTL1 |= UCTR;
	i2c_bytes_remaining = ~bytes;
	lcd_addr = addr;
	i2c_data = (unsigned char*)string;
	i2c_mode = LCD_WRITE_MODE;
	UCB0CTL1 |= UCTXSTT;
	LPM0;
}

int main(void) {
    WDTCTL = WDTPW | WDTHOLD;		// Stop watchdog timer
    __enable_interrupt();

    P1DIR |= BIT0;

	i2c_init();
	lcd_init();
	lcd_write(LCD_BOT_LINE, "I am a catlol", 10);
	LPM0;
}

#pragma vector = USCIAB0TX_VECTOR
__interrupt void USCIAB0TX_ISR(void) {
//	P1OUT ^= BIT0;
	switch (i2c_mode) {
		case LCD_INIT_MODE:
			__delay_cycles(50000);
		case DATA_SEND_MODE:
			if (i2c_bytes_remaining == 0) {
				IFG2 &= ~UCB0TXIFG;
				UCB0CTL1 |= UCTXSTP;
				LPM0_EXIT;
				return;
			}
			UCB0TXBUF = *i2c_data;
			i2c_data++;
			i2c_bytes_remaining--;
			break;
		case DATA_RECV_MODE:
			break;
		case LCD_WRITE_MODE:
			if (i2c_bytes_remaining < 0) {
				UCB0TXBUF = 0x80;
				i2c_bytes_remaining = ~i2c_bytes_remaining;
				return;
			}
			if (lcd_addr != LCD_NUL_ADDR) {
				UCB0TXBUF = lcd_addr;
				lcd_addr = LCD_NUL_ADDR;
				return;
			}
			UCB0TXBUF = 0x40;
			i2c_mode = DATA_SEND_MODE;
			break;
	}
}
