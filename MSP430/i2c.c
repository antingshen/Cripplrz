#include "i2c.h"

#define COMPASS_ADDRESS 0x1e
#define ACCELEROMETER_ADDRESS 0x1d    // SDO tied to Vcc, 0x53 otherwise

#define RGB_ADDRESS    0x62
#define LCD_ADDRESS 0x3e
#define LCD_NUL_ADDR 0x00

#define DATA_SEND_MODE    0    // Send i2c_data until i2c_bytes_remaining is 0. Then exit LPM0
#define DATA_RECV_MODE    1
#define LCD_INIT_MODE    2
#define LCD_WRITE_MODE    3
#define COMPASS_READ_MODE 4
int i2c_mode;
int i2c_bytes_remaining;
unsigned char* i2c_data;

static const unsigned char rgb_config_data[] = {0x80,
        0x80, 0x0d, // 0, 1
        0xff, 0xff, 0xff, 0x00, // B, G, R, NC
        0xff, 0x00,  // 6, 7
        0xaa, // 8
};
static const unsigned char lcd_config_data[] = {
        0x80, 0x3f,
        0x80, 0x3f,
        0x80, 0x3f,
        0x80, 0x0c,
        0x80, 0x01,
        0x80, 0x60,
};

void i2c_init() {
    P1SEL |= SDA_PIN | SCL_PIN;     // Set pins to I2C mode
    P1SEL2 |= SDA_PIN | SCL_PIN;

    UCB0CTL1 |= UCSWRST;            // I2C software reset
    UCB0CTL0 = UCMST | UCMODE_3 | UCSYNC;   // I2C Master
    UCB0CTL1 |= UCSSEL_2;           // Use SMCLK

    UCB0BR0 = 12;                   // 100 kHz I2C
    UCB0I2CIE = UCNACKIE;           // interrupt if Nack received

    UCB0CTL1 &= ~UCSWRST;           // re-enable
    IE2 |= UCB0TXIE | UCB0RXIE;
}

void i2c_send(unsigned char address, unsigned char* data, int bytes) {
    UCB0I2CSA = address;        // Set slave addr
    UCB0CTL1 |= UCTR;           // Transmit mode
    i2c_bytes_remaining = bytes;
    i2c_data = data;
    i2c_mode = DATA_SEND_MODE;
    UCB0CTL1 |= UCTXSTT;        // Start
}

void lcd_init() {
    i2c_send(RGB_ADDRESS, (unsigned char*)rgb_config_data, 10);
    LPM0;
    i2c_send(LCD_ADDRESS, (unsigned char*)lcd_config_data, 14);
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
    LPM0; // TODO: Remove
}

void compass_init() {
    i2c_send(COMPASS_ADDRESS, "\x00\x70", 2);
    LPM0;
    i2c_send(COMPASS_ADDRESS, "\x01\xA0", 2);
    LPM0;
    i2c_send(COMPASS_ADDRESS, "\x02\x00", 2);
    LPM0;
}

void compass_read() {
    i2c_send(COMPASS_ADDRESS, "\x03", 1);
    LPM0;
    UCB0CTL1 &= ~UCTR;
    i2c_bytes_remaining = 6;
    i2c_mode = COMPASS_READ_MODE;
    UCB0CTL1 |= UCTXSTT;
    LPM0; // TODO: Remove
}


#pragma vector = USCIAB0TX_VECTOR
__interrupt void USCIAB0TX_ISR(void) {
//    P1OUT ^= LED;
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
            __delay_cycles(50000);
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
        case COMPASS_READ_MODE:
            switch (i2c_bytes_remaining) {
                case 6:
                    compass_x = UCB0RXBUF;
                    compass_x <<= 8;
                    i2c_bytes_remaining--;
                    break;
                case 5:
                    compass_x |= UCB0RXBUF;
                    i2c_bytes_remaining--;
                    break;
                case 4:
                    compass_z = UCB0RXBUF;
                    compass_z <<= 8;
                    i2c_bytes_remaining--;
                    break;
                case 3:
                    compass_z |= UCB0RXBUF;
                    i2c_bytes_remaining--;
                    break;
                case 2:
                    compass_y = UCB0RXBUF;
                    compass_y <<= 8;
                    i2c_bytes_remaining--;
                    UCB0CTL1 |= UCTXSTP;
                    break;
                case 1:
                    compass_y |= UCB0RXBUF;
                    i2c_bytes_remaining--; // TODO: Remove
                    LPM0_EXIT;
                    break;
                case 0:
                    LPM0;
                    break;
            }
            break;
    }
}


#pragma vector = USCIAB0RX_VECTOR
__interrupt void USCIAB0RX_ISR(void) {
    if (UCB0STAT & UCNACKIFG) {
        P1OUT |= BIT0;
        LPM0;
        return;
    } else {
        P1OUT |= BIT0;
        LPM0;
        return;
    }
}

