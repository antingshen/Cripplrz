#include "config.h"

#ifndef GPS_H_
#define GPS_H_

#define GPS_ON  (P1DIR &= ~GPS_PWR)
#define GPS_OFF (P1DIR |= ~GPS_PWR)

char display_buffer[32];
int display_index;

void gps_init();
void gps_receive();
int uart_receive();

#endif /* GPS_H_ */
