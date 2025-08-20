export class Ball {
  constructor(x, y, radius = 8, speedX = 3, speedY = 3) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speedX = speedX;
    this.speedY = speedY;
    this.initialSpeedX = speedX;
    this.initialSpeedY = speedY;
  }

  update() {
    this.x += this.speedX;
    this.y += this.speedY;
  }

  reverseX() {
    this.speedX = -this.speedX;
  }

  reverseY() {
    this.speedY = -this.speedY;
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.speedX = this.initialSpeedX * (Math.random() > 0.5 ? 1 : -1);
    this.speedY = this.initialSpeedY * (Math.random() > 0.5 ? 1 : -1);
  }

  increaseSpeed(factor = 1.05) {
    this.speedX *= factor;
    this.speedY *= factor;
  }
}

export class Paddle {
  constructor(x, y, width = 15, height = 80, speed = 5) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.minY = 0;
    this.maxY = 0;
  }

  setBounds(minY, maxY) {
    this.minY = minY;
    this.maxY = maxY - this.height;
  }

  moveUp() {
    this.y = Math.max(this.minY, this.y - this.speed);
  }

  moveDown() {
    this.y = Math.min(this.maxY, this.y + this.speed);
  }

  moveTo(y) {
    this.y = Math.max(this.minY, Math.min(this.maxY, y - this.height / 2));
  }

  getCenterY() {
    return this.y + this.height / 2;
  }

  intersects(ball) {
    return ball.x + ball.radius >= this.x &&
           ball.x - ball.radius <= this.x + this.width &&
           ball.y + ball.radius >= this.y &&
           ball.y - ball.radius <= this.y + this.height;
  }
}

export class PongEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.gameState = {
      leftScore: 0,
      rightScore: 0,
      isRunning: false,
      gameOver: false,
      winner: null,
      paused: false,
      maxScore: 11
    };

    this.ball = new Ball(this.width / 2, this.height / 2);
    this.leftPaddle = new Paddle(30, this.height / 2 - 40);
    this.rightPaddle = new Paddle(this.width - 45, this.height / 2 - 40);
    
    this.leftPaddle.setBounds(0, this.height);
    this.rightPaddle.setBounds(0, this.height);
    
    this.keys = {};
    this.lastTime = 0;
    this.animationId = null;

    this.setupEventListeners();
  }

  setupEventListeners() {
    this.handleKeyDown = (e) => {
      this.keys[e.code] = true;
    };

    this.handleKeyUp = (e) => {
      this.keys[e.code] = false;
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      }
    };

    document.addEventListener('keydown', this.handleKeyDown);
    document.addEventListener('keyup', this.handleKeyUp);
  }

  handleInput() {
    // Left paddle controls (W/S)
    if (this.keys['KeyW']) {
      this.leftPaddle.moveUp();
    }
    if (this.keys['KeyS']) {
      this.leftPaddle.moveDown();
    }

    // Right paddle controls (Arrow keys)
    if (this.keys['ArrowUp']) {
      this.rightPaddle.moveUp();
    }
    if (this.keys['ArrowDown']) {
      this.rightPaddle.moveDown();
    }
  }

  checkCollisions() {
    // Ball collision with top/bottom walls
    if (this.ball.y <= this.ball.radius || this.ball.y >= this.height - this.ball.radius) {
      this.ball.reverseY();
    }

    // Ball collision with paddles
    if (this.leftPaddle.intersects(this.ball)) {
      this.ball.speedX = Math.abs(this.ball.speedX); // Ensure ball goes right
      this.ball.increaseSpeed(1.02);
      
      // Add angle based on where ball hits paddle
      const hitPosition = (this.ball.y - this.leftPaddle.getCenterY()) / (this.leftPaddle.height / 2);
      this.ball.speedY += hitPosition * 2;
    }
    
    if (this.rightPaddle.intersects(this.ball)) {
      this.ball.speedX = -Math.abs(this.ball.speedX); // Ensure ball goes left
      this.ball.increaseSpeed(1.02);
      
      // Add angle based on where ball hits paddle
      const hitPosition = (this.ball.y - this.rightPaddle.getCenterY()) / (this.rightPaddle.height / 2);
      this.ball.speedY += hitPosition * 2;
    }

    // Ball out of bounds (scoring)
    if (this.ball.x < 0) {
      this.gameState.rightScore++;
      this.resetBall();
    } else if (this.ball.x > this.width) {
      this.gameState.leftScore++;
      this.resetBall();
    }

    // Check for game over
    if (this.gameState.leftScore >= this.gameState.maxScore) {
      this.gameOver('left');
    } else if (this.gameState.rightScore >= this.gameState.maxScore) {
      this.gameOver('right');
    }
  }

  resetBall() {
    this.ball.reset(this.width / 2, this.height / 2);
  }

  gameOver(winner) {
    this.gameState.gameOver = true;
    this.gameState.winner = winner;
    this.gameState.isRunning = false;
    this.stop();
  }

  start() {
    this.gameState.isRunning = true;
    this.gameState.gameOver = false;
    this.gameState.winner = null;
    this.gameState.paused = false;
    this.resetBall();
    this.gameLoop();
  }

  stop() {
    this.gameState.isRunning = false;
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
      this.animationId = null;
    }
  }

  togglePause() {
    if (!this.gameState.isRunning || this.gameState.gameOver) return;
    
    this.gameState.paused = !this.gameState.paused;
    if (!this.gameState.paused) {
      this.gameLoop();
    }
  }

  reset() {
    this.gameState = {
      leftScore: 0,
      rightScore: 0,
      isRunning: false,
      gameOver: false,
      winner: null,
      paused: false,
      maxScore: 11
    };
    
    this.ball.reset(this.width / 2, this.height / 2);
    this.leftPaddle.y = this.height / 2 - this.leftPaddle.height / 2;
    this.rightPaddle.y = this.height / 2 - this.rightPaddle.height / 2;
  }

  update(deltaTime) {
    if (!this.gameState.isRunning || this.gameState.paused) return;

    this.handleInput();
    this.ball.update();
    this.checkCollisions();
  }

  render() {
    // Clear canvas
    this.ctx.clearRect(0, 0, this.width, this.height);

    // Draw background
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw center line
    this.ctx.setLineDash([5, 15]);
    this.ctx.beginPath();
    this.ctx.moveTo(this.width / 2, 0);
    this.ctx.lineTo(this.width / 2, this.height);
    this.ctx.strokeStyle = '#fff';
    this.ctx.stroke();
    this.ctx.setLineDash([]);

    // Draw paddles
    this.ctx.fillStyle = '#fff';
    this.ctx.fillRect(this.leftPaddle.x, this.leftPaddle.y, this.leftPaddle.width, this.leftPaddle.height);
    this.ctx.fillRect(this.rightPaddle.x, this.rightPaddle.y, this.rightPaddle.width, this.rightPaddle.height);

    // Draw ball
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw scores
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(this.gameState.leftScore.toString(), this.width / 4, 60);
    this.ctx.fillText(this.gameState.rightScore.toString(), (this.width * 3) / 4, 60);

    // Draw overlays
    if (this.gameState.paused) {
      this.drawPauseOverlay();
    } else if (this.gameState.gameOver) {
      this.drawGameOverOverlay();
    }
  }

  drawPauseOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Press SPACE to resume', this.width / 2, this.height / 2 + 40);
  }

  drawGameOverOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText(`${this.gameState.winner.toUpperCase()} WINS!`, this.width / 2, this.height / 2);
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`${this.gameState.leftScore} - ${this.gameState.rightScore}`, this.width / 2, this.height / 2 + 50);
  }

  gameLoop(currentTime = 0) {
    if (!this.gameState.isRunning || this.gameState.paused) return;

    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;

    this.update(deltaTime);
    this.render();

    this.animationId = requestAnimationFrame((time) => this.gameLoop(time));
  }

  destroy() {
    this.stop();
    document.removeEventListener('keydown', this.handleKeyDown);
    document.removeEventListener('keyup', this.handleKeyUp);
  }
}

export default PongEngine;