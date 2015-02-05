#include <msp430g2553.h>
#include "pinmap.h"

#ifndef I2C_H_
#define I2C_H_

int compass_x, compass_y, compass_z;

#define LCD_TOP_LINE 0x80
#define LCD_BOT_LINE 0xc0

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

#endif /* I2C_H_ */



