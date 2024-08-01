function gameFor4() {
    const canvas = document.getElementById('gameFor4-canvas');
const context = canvas.getContext('2d');

const paddleWidth = 100;
const paddleHeight = 10;
const paddleSpeed = 10;

const ballRadius = 10;

const startingPlayScore = 10;

const player1 = {
    x: (canvas.width - paddleWidth) / 2,
    y: canvas.height - paddleHeight - 5,
    width: paddleWidth,
    height: paddleHeight,
    color: '#FFF',
    score: startingPlayScore
};

const player2 = {
    x: (canvas.width - paddleWidth) / 2,
    y: 5,
    width: paddleWidth,
    height: paddleHeight,
    color: '#FFF',
    score: startingPlayScore
};

const player3 = {
    x: 5,
    y: (canvas.height - paddleHeight) / 2,
    width: paddleHeight,
    height: paddleWidth,
    color: '#FFF',
    score: startingPlayScore
};

const player4 = {
    x: canvas.width - paddleHeight - 5,
    y: (canvas.height - paddleHeight) / 2,
    width: paddleHeight,
    height: paddleWidth,
    color: '#FFF',
    score: startingPlayScore
};

const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    radius: ballRadius,
    speed: 6,
    dx: 4,
    dy: 4,
    color: '#FFF'
};

function drawBall() {
    context.fillStyle = ball.color;
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
}

function drawPaddle(player) {
    context.fillStyle = player.color;
    context.fillRect(player.x, player.y, player.width, player.height);
    context.lineWidth = 2;
    context.strokeStyle = 'black';
    context.strokeRect(player.x, player.y, player.width, player.height);
}

function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    
    // Randomly choose a direction: 0 = right, 1 = left, 2 = up, 3 = down
    const direction = Math.floor(Math.random() * 4);
    
    switch(direction) {
        case 0: // right
            ball.dx = ball.speed;
            ball.dy = Math.random() * ball.speed * 2 - ball.speed; // random vertical direction
            break;
        case 1: // left
            ball.dx = -ball.speed;
            ball.dy = Math.random() * ball.speed * 2 - ball.speed; // random vertical direction
            break;
        case 2: // up
            ball.dx = Math.random() * ball.speed * 2 - ball.speed; // random horizontal direction
            ball.dy = -ball.speed;
            break;
        case 3: // down
            ball.dx = Math.random() * ball.speed * 2 - ball.speed; // random horizontal direction
            ball.dy = ball.speed;
            break;
    }
}

function handlePaddleCollision(ball, paddle, paddleSide) {
    // const paddleCenter = (paddleSide === 'top' || paddleSide === 'bottom') 
    //     ? paddle.x + paddleWidth / 2 
    //     : paddle.y + paddleHeight / 2;
    
    // const distanceFromCenter = (paddleSide === 'top' || paddleSide === 'bottom') 
    //     ? ball.x - paddleCenter 
    //     : ball.y - paddleCenter;
    
    // const maxBounceAngle = Math.PI / 4; // 45 degrees
    // const normalizedDistance = distanceFromCenter / ((paddleSide === 'top' || paddleSide === 'bottom') ? paddleWidth / 2 : paddleHeight / 2);
    // const bounceAngle = normalizedDistance * maxBounceAngle;
    // const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    let paddleCenter, distanceFromCenter, normalizedDistance;

    if (paddleSide === 'top' || paddleSide === 'bottom') {
        paddleCenter = paddle.x + paddle.width / 2;
        distanceFromCenter = ball.x - paddleCenter;
        normalizedDistance = distanceFromCenter / (paddle.width / 2);
    } else { // 'left' or 'right'
        paddleCenter = paddle.y + paddle.height / 2;
        distanceFromCenter = ball.y - paddleCenter;
        normalizedDistance = distanceFromCenter / (paddle.height / 2);
    }

    const maxBounceAngle = Math.PI / 4; // 45 degrees
    const bounceAngle = normalizedDistance * maxBounceAngle;
    const speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    console.log(bounceAngle);
    switch (paddleSide) {
        case 'right':
            ball.dx = -speed * Math.cos(bounceAngle);
            ball.dy = speed * Math.sin(bounceAngle);
            break;
        case 'left':
            ball.dx = speed * Math.cos(bounceAngle);
            ball.dy = speed * Math.sin(bounceAngle);
            break;
        case 'top':
            ball.dx = speed * Math.sin(bounceAngle);
            ball.dy = speed * Math.cos(bounceAngle);
            break;
        case 'bottom':
            ball.dx = speed * Math.sin(bounceAngle);
            ball.dy = -speed * Math.cos(bounceAngle);
            break;
    }
}

function moveBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Collision with player1 (bottom)
    if (ball.y + ball.radius > player1.y && ball.x > player1.x && ball.x < player1.x + paddleWidth) {
        handlePaddleCollision(ball, player1, 'bottom');
        console.log(`bottom: x ${ball.x} y ${ball.y}`);
    }
    // Collision with player2 (top)
    else if (ball.y - ball.radius < player2.y + paddleHeight && ball.x > player2.x && ball.x < player2.x + paddleWidth) {
        handlePaddleCollision(ball, player2, 'top');
        console.log(`top: x ${ball.x} y ${ball.y}`);
    }
    // Collision with player3 (left)
    else if (ball.x - ball.radius < player3.x + paddleHeight && ball.y > player3.y && ball.y < player3.y + paddleWidth) {
        handlePaddleCollision(ball, player3, 'left');
        console.log(`left: x ${ball.x} y ${ball.y}`);
    }
    // Collision with player4 (right)
    else if (ball.x + ball.radius > player4.x && ball.y > player4.y && ball.y < player4.y + paddleWidth) {
        handlePaddleCollision(ball, player4, 'right');
        console.log(`right: x ${ball.x} y ${ball.y}`);
    }
    // Ball out of bounds
    else if (ball.y + ball.radius > canvas.height) {
        player1.score--;
        resetBall();
    }
    else if (ball.y - ball.radius < 0) {
        player2.score--;
        resetBall();
    }
    else if (ball.x - ball.radius < 0) {
        player3.score--;
        resetBall();
    }
    else if (ball.x + ball.radius > canvas.width) {
        player4.score--;
        resetBall();
    }
}

function render() {
    context.clearRect(0, 0, canvas.width, canvas.height);
    updatePaddles();
    drawPaddle(player1);
    drawPaddle(player2);
    drawPaddle(player3);
    drawPaddle(player4);
    moveBall();
    drawBall();
}

function checkGameOver() {
    if (player1.score == 0 || player2.score == 0
        || player3.score == 0 || player4.score == 0) {
        gameStateFor4 = 0;
    }
}

function gameLoop() {
    if (gameStateFor4) {
        render();
        checkGameOver();
        context.font = '30px Arial';
        context.fillText(player1.score, canvas.width / 2, canvas.height - 20);
        context.fillText(player2.score, canvas.width / 2, 30);
        context.fillText(player3.score, 20, canvas.height / 2);
        context.fillText(player4.score, canvas.width - 40, canvas.height / 2);
        requestAnimationFrame(gameLoop);
    } else {
        context.font = '50px Arial';
        context.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2 - 100);
    }
}

let gameStateFor4 = 0;
let keyStateFor4 = {};

document.addEventListener('keydown', event => {
    keyStateFor4[event.key] = true;
});

document.addEventListener('keyup', event => {
    keyStateFor4[event.key] = false;
    if (event.key === 'Enter') {
        startGame();
    }
});

const gameForm = document.getElementById('gameFor4-button');
gameForm.addEventListener('click', function(event) {
    if (gameStateFor4 === 0) {
        startGame();
    }
});

function updatePaddles() {
    if (keyStateFor4['d'] && player1.x + paddleWidth < canvas.width) {
        player1.x += paddleSpeed;
    }
    if (keyStateFor4['a'] && player1.x > 0) {
        player1.x -= paddleSpeed;
    }
    if (keyStateFor4['ArrowRight'] && player2.x + paddleWidth < canvas.width) {
        player2.x += paddleSpeed;
    }
    if (keyStateFor4['ArrowLeft'] && player2.x > 0) {
        player2.x -= paddleSpeed;
    }
    if (keyStateFor4['y'] && player3.y > 0) {
        player3.y -= paddleSpeed;
    }
    if (keyStateFor4['i'] && player3.y + paddleWidth < canvas.height) {
        player3.y += paddleSpeed;
    }
    if (keyStateFor4['b'] && player4.y > 0) {
        player4.y -= paddleSpeed;
    }
    if (keyStateFor4['m'] && player4.y + paddleWidth < canvas.height) {
        player4.y += paddleSpeed;
    }
}


function startGame() {
    if (gameStateFor4 === 1) {
        return;
    }
    player1.score = startingPlayScore;
    player2.score = startingPlayScore;
    player3.score = startingPlayScore;
    player4.score = startingPlayScore;
    gameStateFor4 = 1;
    requestAnimationFrame(gameLoop);
}
}

gameFor4();