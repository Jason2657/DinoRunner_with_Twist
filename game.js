const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

// Set canvas size
canvas.width = 800;
canvas.height = 300;

// Game variables
let score = 0;
let highScore = localStorage.getItem('dinoHighScore') || 0;
const gravity = 0.5;
const jumpForce = -12;
const obstacleSpeed = 5;

// Dino object
const dino = {
    x: 50,
    y: canvas.height - 60,
    width: 40,
    height: 60,
    velocityY: 0,
    isJumping: false
};

// Obstacles array
let obstacles = [];
let gameSpeed = 1;
let animationId;
let gameOver = false;

// Event listeners
document.addEventListener('keydown', (e) => {
    if ((e.code === 'Space' || e.key === ' ') && !dino.isJumping && !gameOver) {
        jump();
    }
    if (gameOver && (e.code === 'Space' || e.key === ' ')) {
        resetGame();
    }
});

function jump() {
    dino.velocityY = jumpForce;
    dino.isJumping = true;
}

function createObstacle() {
    const minGap = 700 / gameSpeed; // Decrease gap as speed increases
    if (obstacles.length === 0 || 
        canvas.width - obstacles[obstacles.length - 1].x >= minGap) {
        obstacles.push({
            x: canvas.width,
            y: canvas.height - 40,
            width: 20,
            height: 40
        });
    }
}

function updateDino() {
    dino.velocityY += gravity;
    dino.y += dino.velocityY;

    // Ground collision
    if (dino.y > canvas.height - dino.height) {
        dino.y = canvas.height - dino.height;
        dino.velocityY = 0;
        dino.isJumping = false;
    }
}

function updateObstacles() {
    for (let i = obstacles.length - 1; i >= 0; i--) {
        obstacles[i].x -= obstacleSpeed * gameSpeed;

        // Remove obstacles that are off screen
        if (obstacles[i].x + obstacles[i].width < 0) {
            obstacles.splice(i, 1);
        }

        // Collision detection
        if (checkCollision(dino, obstacles[i])) {
            gameOver = true;
            if (score > highScore) {
                highScore = score;
                localStorage.setItem('dinoHighScore', highScore);
            }
        }
    }
}

function checkCollision(dino, obstacle) {
    return dino.x < obstacle.x + obstacle.width &&
           dino.x + dino.width > obstacle.x &&
           dino.y < obstacle.y + obstacle.height &&
           dino.y + dino.height > obstacle.y;
}

function updateScore() {
    score++;
    // Increase game speed every 500 points
    gameSpeed = 1 + Math.floor(score / 500) * 0.5;
}

function drawGame() {
    // Clear canvas
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    // Draw ground
    ctx.beginPath();
    ctx.moveTo(0, canvas.height - 1);
    ctx.lineTo(canvas.width, canvas.height - 1);
    ctx.stroke();

    // Draw dino
    ctx.fillStyle = 'black';
    ctx.fillRect(dino.x, dino.y, dino.width, dino.height);

    // Draw obstacles
    obstacles.forEach(obstacle => {
        ctx.fillRect(obstacle.x, obstacle.y, obstacle.width, obstacle.height);
    });

    // Draw score
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${Math.floor(score)}`, 20, 30);
    ctx.fillText(`High Score: ${Math.floor(highScore)}`, canvas.width - 150, 30);

    if (gameOver) {
        ctx.font = '40px Arial';
        ctx.fillText('Game Over!', canvas.width/2 - 100, canvas.height/2);
        ctx.font = '20px Arial';
        ctx.fillText('Press Space to Restart', canvas.width/2 - 100, canvas.height/2 + 40);
    }
}

function gameLoop() {
    if (!gameOver) {
        updateDino();
        createObstacle();
        updateObstacles();
        updateScore();
    }
    drawGame();
    animationId = requestAnimationFrame(gameLoop);
}

function resetGame() {
    gameOver = false;
    score = 0;
    gameSpeed = 1;
    obstacles = [];
    dino.y = canvas.height - dino.height;
    dino.velocityY = 0;
    dino.isJumping = false;
    gameLoop();
}

// Start the game
gameLoop(); 