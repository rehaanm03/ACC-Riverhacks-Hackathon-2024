class Ship extends Drawable
{
    constructor(x, y, image)
    {
        super(x, y, image);
        this.velocity = 10;
    }

    moveLeft()
    {
        this.x -= this.velocity * deltaTime;
        if (this.x < 0)
        {
            this.x = 0;
        }
    }

    moveLeft()
    {
        this.x += this.velocity * deltaTime;
        if (this.x + this.width > width)
        {
            this.x = width - this.width;
        }
    }
}