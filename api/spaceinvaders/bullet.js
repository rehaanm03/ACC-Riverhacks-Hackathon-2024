class Bullet
{
    constructor(x)
    {
        this.x = x;
        this.y = height;
        this.velocity = 1;
        this.alive = true;
    }

    draw()
    {
        push();
        noStroke();
        fill(255, 0, 0);
        rect(this.x, this.y, 5, 15);
        pop();
    }

    move()
    {
        this.y -= this.velocity * deltaTime;
    }
}