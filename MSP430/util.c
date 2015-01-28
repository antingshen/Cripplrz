#include "util.h"

unsigned int itoa(int n, char * buffer) {
    unsigned char i = 0;
    unsigned int div = 10000;
    unsigned int f;
    unsigned char leading_zero = 1;
    char c;
    if (n < 0) {
        buffer[i] = '-';
        i++;
        n = -n;
    }
    for (div = 10000; div >= 1; div = div / 10) {
        f = n / div;
        if (leading_zero) {
            if (f != 0 || div == 10) {
                leading_zero = 0;
                c = f + 48;
                buffer[i] = c;
                i += 1;
            }
        } else {
            c = f + 48;
            buffer[i] = c;
            i++;
        }
        n = n - (f * div);
    }
    return (i);
}
