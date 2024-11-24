import { drawBall } from './modules/game_module.js';

function tournament() {
    const canvas = document.getElementById('tournament-canvas');
    const context = canvas.getContext('2d');

    const paddleWidth = 10;
    const paddleHeight = 100;
    const paddleSpeed = 10;
    const ballRadius = 10;
    const maxScore = 5;

    // Define controls for left and right sides
    const controls = {
        left: { up: 'w', down: 's' },
        right: { up: 'ArrowUp', down: 'ArrowDown' }
    };

    // Create 4 player objects
    const players = [
        { name: 'Player 1', color: '#FF0000', score: 0 },
        { name: 'Player 2', color: '#00FF00', score: 0 },
        { name: 'Player 3', color: '#0000FF', score: 0 },
        { name: 'Player 4', color: '#FFFF00', score: 0 }
    ];

    const ball = {
        x: canvas.width / 2,
        y: canvas.height / 2,
        radius: ballRadius,
        speed: 6,
        dx: 4,
        dy: 4,
        color: '#FFF'
    };

    let currentMatch = { leftPlayer: null, rightPlayer: null };
    let tournamentStage = 'semi-finals';
    let remainingPlayers = [];
    let finalists = [];
    let thirdPlaceContenders = [];
    let tournamentResults = [];
    let gameState = 0; // 0: Not started, 1: Running, 2: Countdown
    let countdown = 3; // Countdown timer
    let keyState = {};

    function drawPaddle(x, y, color) {
        context.fillStyle = color;
        context.fillRect(x, y, paddleWidth, paddleHeight);
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

        if (ball.y + ball.radius > canvas.height || ball.y - ball.radius < 0) {
            ball.dy = -ball.dy;
        }

        if (ball.x + ball.radius > canvas.width) {
            currentMatch.leftPlayer.score++;
            resetBall();
        } else if (ball.x - ball.radius < 0) {
            currentMatch.rightPlayer.score++;
            resetBall();
        }

        // Left paddle collision
        if (
            ball.x - ball.radius < paddleWidth &&
            ball.y > currentMatch.leftPlayer.y &&
            ball.y < currentMatch.leftPlayer.y + paddleHeight
        ) {
            let paddleCenter = currentMatch.leftPlayer.y + paddleHeight / 2;
            let distanceFromCenter = ball.y - paddleCenter;
            let maxBounceAngle = Math.PI / 4; // 45 degrees

            let normalizedDistance = distanceFromCenter / (paddleHeight / 2);
            let bounceAngle = normalizedDistance * maxBounceAngle;

            let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy); // Maintain the same speed
            ball.dx = speed * Math.cos(bounceAngle);
            ball.dy = speed * Math.sin(bounceAngle);
        }

        // Right paddle collision
        if (
            ball.x + ball.radius > canvas.width - paddleWidth &&
            ball.y > currentMatch.rightPlayer.y &&
            ball.y < currentMatch.rightPlayer.y + paddleHeight
        ) {
            let paddleCenter = currentMatch.rightPlayer.y + paddleHeight / 2;
            let distanceFromCenter = ball.y - paddleCenter;
            let maxBounceAngle = Math.PI / 4; // 45 degrees

            let normalizedDistance = distanceFromCenter / (paddleHeight / 2);
            let bounceAngle = normalizedDistance * maxBounceAngle;

            let speed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy); // Maintain the same speed
            ball.dx = -speed * Math.cos(bounceAngle);
            ball.dy = speed * Math.sin(bounceAngle);
        }
    }

    function startTournament(event) {
        event.preventDefault(); // Prevent form submission

        // Get player names from input fields
        for (let i = 1; i <= 4; i++) {
            const inputValue = document.getElementById(`player${i}`).value.trim();
            players[i - 1].name = inputValue || `Player ${i}`;
        }

        document.getElementById('tournament-rules').style.display = 'none';
        gameState = 1;
        tournamentStage = 'semi-finals';
        remainingPlayers = [...players];
        finalists = [];
        thirdPlaceContenders = [];
        tournamentResults = [];

        startNextMatch();
        requestAnimationFrame(gameLoop);

        // Hide the form and show the canvas
        document.getElementById('player-names-form').style.display = 'none';
        document.getElementById('tournament-canvas').style.display = 'block';
    }

    function startNextMatch() {
        resetBall();
        if (tournamentStage === 'semi-finals') {
            if (remainingPlayers.length > 0) {
                currentMatch.leftPlayer = remainingPlayers.shift();
                currentMatch.rightPlayer = remainingPlayers.shift();
            } else {
                tournamentStage = 'third-place';
                currentMatch.leftPlayer = thirdPlaceContenders[0];
                currentMatch.rightPlayer = thirdPlaceContenders[1];
            }
        } else if (tournamentStage === 'third-place') {
            tournamentStage = 'final';
            currentMatch.leftPlayer = finalists[0];
            currentMatch.rightPlayer = finalists[1];
        } else if (tournamentStage === 'final') {
            endTournament();
            return;
        }

        resetMatch();

        // Start countdown
        countdown = 3;
        gameState = 2; // Countdown state
        displayCountdown();
    }

    function resetMatch() {
        currentMatch.leftPlayer.score = 0;
        currentMatch.rightPlayer.score = 0;
        currentMatch.leftPlayer.y = (canvas.height - paddleHeight) / 2;
        currentMatch.rightPlayer.y = (canvas.height - paddleHeight) / 2;
        resetBall();
    }

    function checkMatchOver() {
        if (
            currentMatch.leftPlayer.score >= maxScore ||
            currentMatch.rightPlayer.score >= maxScore
        ) {
            let winner =
                currentMatch.leftPlayer.score >= maxScore
                    ? currentMatch.leftPlayer
                    : currentMatch.rightPlayer;
            let loser =
                currentMatch.leftPlayer.score >= maxScore
                    ? currentMatch.rightPlayer
                    : currentMatch.leftPlayer;

            if (tournamentStage === 'semi-finals') {
                finalists.push(winner);
                thirdPlaceContenders.push(loser);
            } else if (tournamentStage === 'third-place') {
                tournamentResults[2] = winner;
                tournamentResults[3] = loser;
            } else if (tournamentStage === 'final') {
                tournamentResults[0] = winner;
                tournamentResults[1] = loser;
            }

            startNextMatch();
        }
    }

    function endTournament() {
        gameState = 0;
        context.clearRect(0, 0, canvas.width, canvas.height);
        context.font = '30px Arial';
        context.fillStyle = '#FFF';
        context.fillText('Tournament Results', canvas.width / 2 - 120, 50);
        for (let i = 0; i < 4; i++) {
            context.fillStyle = tournamentResults[i].color;
            context.fillText(
                `${i + 1}${getOrdinal(i + 1)} Place: ${tournamentResults[i].name}`,
                canvas.width / 2 - 100,
                100 + i * 50
            );
        }
        sendTournamentResults(tournamentResults);

        document.getElementById('return-button').style.display = 'block';
    }

    document.getElementById('return-button').addEventListener('click', function () {
        document.getElementById('tournament-canvas').style.display = 'none';
        document.getElementById('player-names-form').style.display = 'block';
        document.getElementById('return-button').style.display = 'none'; // Hide return button after clicking
    });

    function getOrdinal(n) {
        const s = ['th', 'st', 'nd', 'rd'];
        const v = n % 100;
        return s[(v - 20) % 10] || s[v] || s[0];
    }

    function updatePaddles() {
        if (keyState[controls.left.up] && currentMatch.leftPlayer.y > 0) {
            currentMatch.leftPlayer.y -= paddleSpeed;
        }
        if (keyState[controls.left.down] && currentMatch.leftPlayer.y + paddleHeight < canvas.height) {
            currentMatch.leftPlayer.y += paddleSpeed;
        }
        if (keyState[controls.right.up] && currentMatch.rightPlayer.y > 0) {
            currentMatch.rightPlayer.y -= paddleSpeed;
        }
        if (keyState[controls.right.down] && currentMatch.rightPlayer.y + paddleHeight < canvas.height) {
            currentMatch.rightPlayer.y += paddleSpeed;
        }
    }

    function render() {
        context.clearRect(0, 0, canvas.width, canvas.height);
        updatePaddles();
        drawPaddle(0, currentMatch.leftPlayer.y, currentMatch.leftPlayer.color);
        drawPaddle(canvas.width - paddleWidth, currentMatch.rightPlayer.y, currentMatch.rightPlayer.color);
        moveBall();
        drawBall(context, ball);

        context.font = '30px Arial';
        context.fillStyle = '#FFF';
        context.fillText(currentMatch.leftPlayer.score, canvas.width / 4, 50);
        context.fillText(currentMatch.rightPlayer.score, (3 * canvas.width) / 4, 50);
        context.fillText(
            `${currentMatch.leftPlayer.name} vs ${currentMatch.rightPlayer.name}`,
            canvas.width / 2 - 100,
            50
        );
        context.fillText(`Stage: ${tournamentStage}`, canvas.width / 2 - 70, canvas.height - 20);
    }

    function displayCountdown() {
        context.clearRect(0, 0, canvas.width, canvas.height); // Clear canvas
        context.font = '50px Arial';
        context.fillStyle = '#FFF';
        if (countdown > 0) {
            context.fillText(countdown, canvas.width / 2 - 15, canvas.height / 2); // Display countdown
            countdown--; // Decrease countdown value
            setTimeout(displayCountdown, 1000); // Call this function again after 1 second
        } else {
            // Countdown is over, start the game
            gameState = 1;
        }
    }

    function gameLoop() {
        if (gameState === 1) {
            render();
            checkMatchOver();
        }
        requestAnimationFrame(gameLoop);
    }

    document.addEventListener('keydown', (event) => {
        keyState[event.key] = true;
    });

    // document.addEventListener('keyup', (event) => {
    //     keyState[event.key] = false;
    //     if (event.key === 'Enter') {
    //         startTournament();
    //     }
    // });

    const gameForm = document.getElementById('player-names-form');
    gameForm.addEventListener('submit', startTournament);

    async function sendTournamentResults(results) {
        const data = {
            place1: results[0].name,
            place2: results[1].name,
            place3: results[2].name,
            place4: results[3].name,
        };

        const response = await fetch('/api/tournament/post', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                Authorization: 'Bearer ' + localStorage.getItem('access-token'),
            },
            body: JSON.stringify(data),
        });
        if (response.status === 401) {
            await refreshToken();
            const response2 = await fetch('/api/tournament/post', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: 'Bearer ' + localStorage.getItem('access-token'),
                },
                body: JSON.stringify(data),
            });
        }
    }

    document.getElementById('tournament-canvas').style.display = 'none';
    document.getElementById('return-button').style.display = 'none';
}

tournament();
