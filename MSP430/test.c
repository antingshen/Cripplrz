#include "test.h"
#include "util.h"

void compass_test() {
    char buffer[16] = "                ";
    compass_read();
    int i;
    for (i = 15; i != 0; i--) {
        buffer[i] = ' ';
    }
    itoa(compass_x, buffer);
    itoa(compass_y, buffer + 8);
    lcd_write(LCD_TOP_LINE, buffer, 16);
}
