#include "unstucker.h"

int abs(int x)
{
    return x > 0 ? x : -1*x;
}

void turnMotors(int left, int right)
{
    set_left_motor(abs(left), left > 0 ? FORWARD : BACKWARD);
    set_right_motor(abs(right), right > 0 ? FORWARD : BACKWARD);
}

void rotateMotors()
{
    set_left_motor(255, FORWARD);
    set_right_motor(255, BACKWARD);
    wait_seconds(SPIN_SECONDS);
}

void goBackwards()
{
    turnMotors(BACKWARD_SPEED,BACKWARD_SPEED);
    wait_seconds(BACKWARD_SECONDS);
}

void goForwards(int left, int right)
{
    turnMotors(left, right);
    wait_seconds(FORWARD_SECONDS);
}

void unstuck_procedure(int initial_left, int initial_right)
{
    int i=0, j=0;
    for(j; j < ROTATIONAL_TRIES; j++)
    {
        for(i; get_stall_current() > STUCK_THRESHOLD && i < TURN_TRIES; i++)
        {
            goBackwards();
            initial_left += ADJUSTMENT_THRESHOLD;
            initial_right -= ADJUSTMENT_THRESHOLD;
            goForwards(initial_left, initial_right);
        }

        if(get_stall_current() > STUCK_THRESHOLD)
            rotateMotors();
        else
            return;
    }

    //we're stuck and dead and wat now
}
