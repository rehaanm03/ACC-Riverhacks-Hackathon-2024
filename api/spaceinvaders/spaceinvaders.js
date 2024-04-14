let shipImage;
let alienImage;
let aliens;
let alienSpawnTimer;
let alienSpawnMaxTime;
let ship;
let movingLeft;
let movingRight;
let gameState;
let lives;
let bullets;
let score;
let highScore;

function preload()
{
    shipImage = loadImage("/api/spaceinvaders/assets/ship.png");
    alienImage = loadImage("/api/spaceinvaders/assets/alien.png");
}

async function findHighScore(id) {
    try {
        const response = await fetch(`http://localhost:3232/getScore?id=${id}&game=spaceInvader`, {
            method: "GET", // Set the request method to GET
            headers: {
                "Content-Type": "application/json", // Set the content type to JSON
            }
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Score update response:", responseData);
        console.log(highScore)
        highScore = responseData.highestScore
        if (!responseData.highestScore) highScore = 0
        console.log(highScore)

    } catch (error) {
        console.error("Error sending score update:", error);
    }
}

async function updateScore(newScore) {
    const data = {
        DiscordID: id, // Replace with the actual Discord ID if needed
        Game: "spaceInvader",
        newScore: newScore,
    };

    try {
        const response = await fetch("http://localhost:3232/updateScore", {
            method: "POST", // Set the request method to POST
            headers: {
                "Content-Type": "application/json", // Set the content type to JSON
            },
            body: JSON.stringify(data), // Convert the data object to a JSON string
        });

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const responseData = await response.json();
        console.log("Score update response:", responseData);

    } catch (error) {
        console.error("Error sending score update:", error);
    }
}



function setup()
{
    createCanvas(800, 600);
    ship = new Ship(width / 2 - shipImage.width / 2, height - shipImage.height, shipImage);
    aliens = [];
    bullets = [];
    alienSpawnTimer = 0;
    lives = 3;
    alienSpawnMaxTime = 1000;
    gameState = GameState.TITLE;
    score = 0;
    highScore = 0;
    urlParams = new URLSearchParams(window.location.search);

    // Extract the value of the 'id' parameter
    id = urlParams.get('id');

    console.log("The query ID is:", id)
    findHighScore(id)

}

function keyPressed()
{
    switch (gameState)
    {
        case GameState.TITLE:
            if (keyCode == ENTER)
            {
                gameState = GameState.PLAYING;
            }
            break;
        case GameState.PLAYING:
            if (keyCode == LEFT_ARROW)
            {
                movingLeft = true;
            }
            if (keyCode == RIGHT_ARROW)
            {
                movingRight = true;
            }
            if (key == ' ')
            {
                bullets.push(new Bullet(ship.x + ship.width / 2));
            }
            break;
        case GameState.GAMEOVER:
            if (key == 'r')
            {
                movingLeft = false;
                movingRight = false;
                alienSpawnTimer = 0;
                alienSpawnMaxTime = 1000;
                lives = 3;
                score = 0;
                ship.x = width / 2 - ship.width / 2;
                while (aliens.length > 0)
                {
                    aliens.pop();
                }
                while (bullets.length > 0)
                {
                    bullets.pop();
                }
                gameState = GameState.PLAYING;
            }
    }
    
}

function bulletCollision()
{
    for (alien of aliens)
    {
        for (bullet of bullets)
        {
            if (bullet.y >= alien.y && bullet.y <= alien.y + alien.height)
            {
                if (bullet.x >= alien.x & bullet.x <= alien.x + alien.width)
                {
                    bullet.alive = false;
                    alien.alive = false;
                    score += 100;
                    updateScore(score)
                }
            }
        }
    }
}

function keyReleased()
{
    switch (gameState)
    {
        case GameState.PLAYING:
            if (keyCode == LEFT_ARROW)
            {
                movingLeft = false;
            }
            if (keyCode == RIGHT_ARROW)
            {
                movingRight = false;
            }
            break;
    }
}

function draw()
{
    background(0);
    switch (gameState)
    {
        case GameState.TITLE:
            push();
            fill(255);
            textSize(32);
            textAlign(CENTER);
            text("SPACE INVADERS", width / 2, height / 2);
            textSize(12);
            text("Press left or right arrows to move and space to fire. Press enter to start.", width / 2, 3 * height / 4);
            pop();
            break;
        case GameState.PLAYING:
            alienSpawnTimer += deltaTime;
            if (alienSpawnTimer >= alienSpawnMaxTime)
            {
                aliens.push(new Alien(random() * (width - alienImage.width), -alienImage.height, alienImage));
                alienSpawnTimer -= alienSpawnMaxTime;
                alienSpawnMaxTime -= 10;
            }

            for (alien of aliens)
            {
                alien.move();
                if (alien.y + alien.height >= height)
                {
                    lives -= 1;
                    alien.alive = false;
                    if (lives <= 0)
                    {
                        if (score > highScore)
                        {
                            highScore = score;
                        }
                        gameState = GameState.GAMEOVER;
                    }
                }
            }

            for (let i = 0; i < aliens.length; ++i)
            {
                if (aliens[i].alive == false)
                {
                    aliens.splice(i, 1);
                    --i;
                }
            }

            for (bullet of bullets)
            {
                bullet.move();
                if (bullet.y + bullet.height < 0)
                {
                    bullet.alive = false;
                }
            }

            for (let i = 0; i < bullets.length; ++i)
            {
                if (bullets[i].alive == false)
                {
                    bullets.splice(i, 1);
                    --i;
                }
            }

            bulletCollision();

            if (movingLeft)
            {
                ship.moveLeft();
            }
            if (movingRight)
            {
                ship.moveRight();
            }
            break;
        case GameState.GAMEOVER:
            push();
            fill(255);
            textSize(32);
            textAlign(CENTER);
            text("Out of lives\nScore: " + score, width / 2, height / 2);
            textSize(12);
            text("Press 'R' to restart.", width / 2, 3 * height / 4);
            pop();
            break;
    }
    
    for (bullet of bullets)
    {
        bullet.draw();
    }

    ship.draw();
    for (alien of aliens)
    {
        alien.draw();
    }

    push();
    fill(255);
    text("Score: " + score + "\nHigh Score: " + highScore + "\nLives: " + lives, 20, 20);
    pop();
}