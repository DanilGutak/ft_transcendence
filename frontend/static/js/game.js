game()

function game() {
    const canvas = document.getElementById('game-canvas');
    const context = canvas.getContext('2d');
    const netWidth = 4;
    const netHeight = canvas.height;
    
    const paddleWidth = 10;
    const paddleHeight = 100;
    const paddleSpeed = 10;
    
    const ballRadius = 10;
    
    
    const player1 = {
        x: 5,
        y: (canvas.height - paddleHeight) / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#FFF',
        score: 0
    };
    
    const player2 = {
        x: canvas.width - paddleWidth - 5,
        y: (canvas.height - paddleHeight) / 2,
        width: paddleWidth,
        height: paddleHeight,
        color: '#FFF',
        score: 0
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
        ball.dx = -ball.dx;
        ball.dy = -ball.dy;
    
    }
    
    function moveBall() {
        ball.x += ball.dx;
        ball.y += ball.dy;
    
        if (ball.y + ball.radius + 1 > canvas.height || ball.y - ball.radius - 1 < 0) {
            ball.dy = -ball.dy;
        }
        if (ball.x + ball.radius > canvas.width || ball.x - ball.radius < 0) {
            if (ball.x - ball.radius < 0) {
                player2.score++;
            }
            else {
                player1.score++;
            }
            resetBall();
        }
        if (ball.x + ball.radius > player2.x && ball.y > player2.y && ball.y < player2.y + paddleHeight) {
            // Collision with player2 paddle
            let paddleCenter = player2.y + paddleHeight / 2;
            let distanceFromCenter = ball.y - paddleCenter;
            let maxBounceAngle = Math.PI / 4; // 45 degrees
    
            let normalizedDistance = distanceFromCenter / (paddleHeight / 2);
            let bounceAngle = normalizedDistance * maxBounceAngle;
    
            let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy); // Maintain the same speed
            ball.dx = -speed * Math.cos(bounceAngle);
            ball.dy = speed * Math.sin(bounceAngle);
        }
        if (ball.x - ball.radius < player1.x + paddleWidth && ball.y > player1.y && ball.y < player1.y + paddleHeight) {
            // Collision with player1 paddle
            let paddleCenter = player1.y + paddleHeight / 2;
            let distanceFromCenter = ball.y - paddleCenter;
            let maxBounceAngle = Math.PI / 4; // 45 degrees
    
            let normalizedDistance = distanceFromCenter / (paddleHeight / 2);
            let bounceAngle = normalizedDistance * maxBounceAngle;
    
            let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy); // Maintain the same speed
            ball.dx = speed * Math.cos(bounceAngle);
            ball.dy = speed * Math.sin(bounceAngle);
        }
    }
    
    
    
    function render()
    {
        context.clearRect(0, 0, canvas.width, canvas.height);
        updatePaddles();
        drawPaddle(player1);
        drawPaddle(player2);
        moveBall();
        drawBall();
    
    }
    
    function checkGameOver() {
        if (player1.score >= 5 || player2.score >= 5) {
            gameState = 0;
        }
    
    }
    function gameLoop() {
    
        if (gameState) {
            render();
            checkGameOver();
            context.font = '30px Arial';
            context.fillText(player1.score, canvas.width / 4, 50);
            context.fillText(player2.score, 3 * canvas.width / 4, 50);
            requestAnimationFrame(gameLoop);
        }
        else
        {
            context.font = '50px Arial';
            context.fillText('Game Over', canvas.width / 2 - 150, canvas.height / 2 - 100);
            const gameButton = document.getElementById('game-button');
            gameButton.textContent = 'Restart Game';
        }
        
    
    }
    
    let gameState = 0;
    let keyState = {};
    
    document.addEventListener('keydown', event => {
        keyState[event.key] = true;
    });
    
    document.addEventListener('keyup', event => {
        keyState[event.key] = false;
        if (event.key === 'Enter') {
            startGame();
        }
    });
    
    const gameForm = document.getElementById('game-button');
    gameForm.addEventListener('click', function(event) {
        if (gameState === 0) {
            canvas.style.display = "block";
            document.getElementById('game-rules').style.display = 'none';
            startGame();
        }
      });
    
    function updatePaddles() {
        if (keyState['w'] && player1.y > 0) {
            player1.y -= paddleSpeed;
        }
        if (keyState['s'] && player1.y + paddleHeight < canvas.height) {
            player1.y += paddleSpeed;
        }
        if (keyState['ArrowUp'] && player2.y > 0) {
            player2.y -= paddleSpeed;
        }
        if (keyState['ArrowDown'] && player2.y + paddleHeight < canvas.height) {
            player2.y += paddleSpeed;
        }
    }
    
    
    
    function startGame() {
    
        if (gameState === 1) {
            return;
        }
        player1.score = 0;
        player2.score = 0;
        gameState = 1;
        requestAnimationFrame(gameLoop);
    }
}
