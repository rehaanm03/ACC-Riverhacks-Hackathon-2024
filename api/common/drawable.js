class Drawable
{
    constructor(x, y, image)
    {
        this.x = x;
        this.y = y;
        this.width = image.width;
        this.height = image.height;
        this.image = image;
    }

    draw()
    {
        image(this.image, this.x, this.y);
    }
}