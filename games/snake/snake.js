const canvas = document.getElementById("gameCanvas");
const ctx = canvas.getContext("2d");
const scoreElement = document.getElementById("scoreVal");

// When this game is embedded in an iframe (as it is on the main hub), the
// parent page may still hold keyboard focus even after the modal opens,
// which makes arrow keys silently do nothing. Grabbing focus here — on load
// and again on any click inside the game — guarantees this window is the
// one that receives keydown events, regardless of who embeds it.
window.addEventListener('load', () => window.focus());
canvas.addEventListener('click', () => window.focus());

const grid = 20;
let count = 0;
let score = 0;

let snake = {
    x: 160,
    y: 160,
    dx: grid,
    dy: 0,
    cells: [],
    maxCells: 4
};

let apple = { x: 320, y: 320 };

function getRandomInt(min, max) {
    return Math.floor(Math.random() * (max - min)) + min;
}

function resetGame() {
    score = 0;
    scoreElement.textContent = score;
    snake.x = 160;
    snake.y = 160;
    snake.cells = [];
    snake.maxCells = 4;
    snake.dx = grid;
    snake.dy = 0;
    apple.x = getRandomInt(0, 20) * grid;
    apple.y = getRandomInt(0, 20) * grid;
}

function gameLoop() {
    requestAnimationFrame(gameLoop);

    // Run game logic at roughly 15 frames per second
    if (++count < 6) {
        return;
    }
    count = 0;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    snake.x += snake.dx;
    snake.y += snake.dy;

    // Wrap-around screen bounds
    if (snake.x < 0) snake.x = canvas.width - grid;
    else if (snake.x >= canvas.width) snake.x = 0;

    if (snake.y < 0) snake.y = canvas.height - grid;
    else if (snake.y >= canvas.height) snake.y = 0;

    snake.cells.unshift({ x: snake.x, y: snake.y });

    if (snake.cells.length > snake.maxCells) {
        snake.cells.pop();
    }

    // Draw target food piece
    ctx.fillStyle = '#ef4444';
    ctx.fillRect(apple.x, apple.y, grid - 1, grid - 1);

    // Draw snake body pieces
    ctx.fillStyle = '#10b981';
    snake.cells.forEach(function (cell, index) {
        ctx.fillRect(cell.x, cell.y, grid - 1, grid - 1);

        // Snake collision check with apple
        if (cell.x === apple.x && cell.y === apple.y) {
            snake.maxCells++;
            score += 10;
            scoreElement.textContent = score;

            apple.x = getRandomInt(0, 20) * grid;
            apple.y = getRandomInt(0, 20) * grid;
        }

        // Body piece self-collision check
        for (let i = index + 1; i < snake.cells.length; i++) {
            if (cell.x === snake.cells[i].x && cell.y === snake.cells[i].y) {
                resetGame();
            }
        }
    });
}

// Control listeners
document.addEventListener('keydown', function (e) {
    // Prevent arrow key scrolling standard browser window action
    if ([37, 38, 39, 40].indexOf(e.which) > -1) {
        e.preventDefault();
    }

    if (e.which === 37 && snake.dx === 0) { snake.dx = -grid; snake.dy = 0; }
    else if (e.which === 38 && snake.dy === 0) { snake.dy = -grid; snake.dx = 0; }
    else if (e.which === 39 && snake.dx === 0) { snake.dx = grid; snake.dy = 0; }
    else if (e.which === 40 && snake.dy === 0) { snake.dy = grid; snake.dx = 0; }
});

// Kickstart engine loop
requestAnimationFrame(gameLoop);