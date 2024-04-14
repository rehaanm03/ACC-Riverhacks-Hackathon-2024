let birdImage;
let pipeOpeningImage;
let pipeBodyimage;
let bird;
let pipes;
let score;
let highScore;
let gameState;
let urlParams;
let id;

async function findHighScore(id) {
    try {
        const response = await fetch(`http://localhost:3232/getScore?id=${id}&game=flappyBird`, {
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
        console.log(highScore)

    } catch (error) {
        console.error("Error sending score update:", error);
    }
}

function preload()
{
    birdImage = loadImage("/api/flappybird/assets/bird.png");
    birdWingUpImage = loadImage("/api/flappybird/assets/birdwingup.png")
    pipeOpeningImage = loadImage("/api/flappybird/assets/pipe_opening.png");
    pipeBodyImage = loadImage("/api/flappybird/assets/pipe_body.png");
    urlParams = new URLSearchParams(window.location.search);

    // Extract the value of the 'id' parameter
    id = urlParams.get('id');

    console.log("The query ID is:", id)
    findHighScore(id)

}

function setup()
{
    score = 0;
    // highScore = 0;
    createCanvas(400, 400);
    bird = new Bird(30, height / 3 - birdImage.height, birdImage, birdWingUpImage);
    pipes = [];
    pipes.push(new Pipe(width - 100, height / 2, pipeOpeningImage, pipeBodyImage));
    pipes.push(new Pipe(width + 150, height / 2, pipeOpeningImage, pipeBodyImage));
    gameState = GameState.TITLE;

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
            if (key == ' ')
            {
                bird.velocity = -0.3 ;
            }
            break;
        case GameState.GAMEOVER:
            if (key == 'r')
            {
                score = 0;
                pipes[0].setX(width - 100);
                pipes[0].setY(height / 2);
                pipes[1].setX(width + 150);
                pipes[1].setY(height / 2);
                
                gameState = GameState.PLAYING;
            }
            break;
        default:
            console.log("Invalid game state");
    }
}

async function updateScore(newScore) {
    const data = {
        DiscordID: id, // Replace with the actual Discord ID if needed
        Game: "flappyBird",
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

// Example usage:
// updateScore(5); 

function draw()
{
    background(200, 240, 255);

    switch (gameState)
    {
        case GameState.TITLE:
            push();
            textSize(32);
            textAlign(CENTER);
            text("Flappy Bird", width / 2, height / 3);
            textSize(14);
            text("The spacebar flaps your wings. Press the enter key to start.", width / 2, height / 2);
            pop();
            break;
        case GameState.PLAYING:
            if (birdCollision())
            {
                gameState = GameState.GAMEOVER;
                if (score > highScore)
                {
                    highScore = score;
                }
            }
            else
            {
                for (pipe of pipes)
                {
                    pipe.move();
                }
                bird.applyGravity(deltaTime);
                bird.updateY(deltaTime);
                if (bird.y + bird.height > height)
                {
                    bird.y = height - bird.height;
                }
            }
            break;
    }
    
    bird.draw();
    for (pipe of pipes)
    {
        pipe.draw();
    }

    textWithBackground("Score: " + score + "\nHigh score: " + highScore, 45, 20, 2);
    // updateScore(score)



    if (gameState == GameState.GAMEOVER)
    {
        textWithBackground("You crashed! Press 'R' to restart.", width / 2, height / 2, 2);        
        // updateScore(score)
    }
}

function textWithBackground(message, x, y, padding)
{
    let lineCount = (message.match(/\n/g)||[]).length;
    let messageAscent = textAscent();
    let messageHeight = (messageAscent + textDescent()) * (1 + lineCount);
    let messageWidth = textWidth(message);
    let messageX = x - messageWidth / 2;

    push();
    noStroke();
    fill(255);
    rect(messageX - padding, y - messageAscent - padding, messageWidth + padding * 2, messageHeight + padding * 2);
    fill(0);
    text(message, messageX, y);
    pop();
} 

function birdCollision()
{
    let colliding = false;
    for (pipe of pipes)
    {
        if (bird.x + bird.width >= pipe.x && bird.x < pipe.x + pipe.body.width)
        {
            if (bird.y < pipe.y - pipe.gapSize / 2 || bird.y + bird.height > pipe.y + pipe.gapSize / 2)
            {
                colliding = true;
            }
        }
    }
    
    return colliding;
}