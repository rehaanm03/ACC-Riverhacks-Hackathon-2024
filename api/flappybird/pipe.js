class Pipe
{
    constructor(x, y, openingImage, bodyImage)
    {
        this.gapSize = 125;
        this.x = x;
        this.y = y;
        this.velocity = 0.1;
        this.openingUpper = new Drawable(x, y - this.gapSize / 2 - openingImage.height, openingImage);
        this.openingLower = new Drawable(x, y + this.gapSize / 2, openingImage);
        this.body = new Drawable(this.x + 5, this.y, bodyImage);
    }

    move()
    {
        let dx = this.velocity * deltaTime;
        this.x -= dx;
        this.openingUpper.x -= dx;
        this.openingLower.x -= dx;
        this.body.x -= dx;
        if (this.x + this.openingUpper.width < 0)
        {
            this.setX(width);
            let newY = Math.random() * height;
            this.setY(newY);
            ++score;
        }
    }

    setX(newX)
    {
        this.x = newX;
        this.openingUpper.x = newX;
        this.openingLower.x = newX;
        this.body.x = newX + 5;
    }

    setY(newY)
    {
        this.y = newY;
        this.openingUpper.y = newY - this.gapSize / 2 - this.openingUpper.height;
        this.openingLower.y = newY + this.gapSize / 2;
    }

    draw()
    {
        this.body.y = this.openingUpper.y;
        while (this.body.y > 0)
        {
            this.body.y -= this.body.height - 1;
            this.body.draw();
        }
        this.openingUpper.draw();
        this.openingLower.draw();
        this.body.y = this.openingLower.y + 1;
        while (this.body.y < height)
        {
            this.body.y += this.body.height - 1;
            this.body.draw();
        }
    }

}