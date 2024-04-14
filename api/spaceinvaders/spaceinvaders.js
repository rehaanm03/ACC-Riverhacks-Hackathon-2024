let shipImage;
let ship;
let movingLeft;
let movingRight;

function preload()
{
    shipImage = loadImage("spaceinvaders/assets/ship.png");
}

function setup()
{
    createCanvas(800, 600);
    ship = new Ship(width / 2 - shipImage.width / 2, height - shipImage.height, shipImage);
}

function keyPressed()
{
    if (keyCode == LEFT_ARROW)
    {
        movingLeft = true;
    }
    if (keyCode == RIGHT_ARROW)
    {
        movingRight = true;
    }
}

function keyReleased()
{
    if (keyCode == LEFT_ARROW)
    {
        movingLeft = false;
    }
    if (keyCode == RIGHT_ARROW)
    {
        movingRight = false;
    }
}

function draw()
{
    background(0);
    if (movingLeft)
    {
        ship.moveLeft();
    }
    if (movingRight)
    {
        ship.moveRight();
    }
    ship.draw();
}