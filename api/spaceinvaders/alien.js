class Alien extends Drawable
{
    constructor(x, y, image)
    {
        super(x, y, image);
        this.velocity = 0.4;
        this.alive = true;
    }

    move()
    {
        this.y += this.velocity * deltaTime;
    }
}