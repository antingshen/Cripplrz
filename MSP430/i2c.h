#include <msp430g2553.h>
#include "pinmap.h"

#ifndef I2C_H_
#define I2C_H_

// Public Functions //

/* Call before using any other i2c commands */
void i2c_init();

/* Wait 300ms after lcd power-up before init */
void lcd_init();

/* addr is LCD_TOP_LINE or LCD_BOT_LINE, plus optional character offset */
void lcd_write(unsigned char addr, char* string, int bytes);

/* Call before using compass_read */
void compass_init();

/* After returning, compass_{xyz} will be updated with new values. */
void compass_read();

// End of Public Functions //

#define COMPASS_ADDRESS 0x1e
int compass_x, compass_y, compass_z;

#define ACCELEROMETER_ADDRESS 0x1d    // SDO tied to Vcc, 0x53 otherwise

#define RGB_ADDRESS    0x62
#define LCD_ADDRESS 0x3e
#define LCD_TOP_LINE 0x80
#define LCD_BOT_LINE 0xc0
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

void i2c_send(unsigned char address, unsigned char* data, int bytes);

#endif /* I2C_H_ */



