class Bird extends Drawable
{
    constructor(x, y, downImage, upImage)
    {
        super(x, y, downImage);
        this.downImage = downImage;
        this.upImage = upImage;
        this.gravity = 0.001;
        this.velocity = 0;
        this.terminalVelocity = 5;
    }

    applyGravity()
    {
        this.velocity += this.gravity * deltaTime;
        if (this.velocity > this.terminalVelocity)
        {
            this.velocity = this.terminalVelocity;
        }
        if (this.velocity <= 0)
        {
            this.image = this.downImage;
        }
        else
        {
            this.image = this.upImage;
        }
    }

    updateY()
    {
        this.y += this.velocity * deltaTime;
    }
}