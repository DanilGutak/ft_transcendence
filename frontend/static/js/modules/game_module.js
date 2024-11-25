function drawBall(context, ball) {
    context.fillStyle = ball.color;
    context.beginPath();
    context.arc(ball.x, ball.y, ball.radius, 0, Math.PI * 2, true);
    context.closePath();
    context.fill();
}

function resetBall(ifFourPlayersMode, canvas, ball) {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    ball.speed = 6;
    
    // Randomly choose a direction: 0 = right, 1 = left, 2 = up, 3 = down
    const direction = Math.floor(Math.random() * (ifFourPlayersMode + 1) * 2);
    
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

export {drawBall, resetBall};
