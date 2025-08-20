class Ball {
  constructor(x, y, radius = 8, speed = 5) {
    this.x = x;
    this.y = y;
    this.radius = radius;
    this.speed = speed;
    this.dx = speed * (Math.random() > 0.5 ? 1 : -1);
    this.dy = -speed;
    this.maxSpeed = 8;
  }

  update() {
    this.x += this.dx;
    this.y += this.dy;
  }

  reverseX() {
    this.dx = -this.dx;
  }

  reverseY() {
    this.dy = -this.dy;
  }

  setDirection(dx, dy) {
    this.dx = dx;
    this.dy = dy;
  }

  increaseSpeed(factor = 1.05) {
    this.dx *= factor;
    this.dy *= factor;
    
    // Cap speeds at maxSpeed
    if (Math.abs(this.dx) > this.maxSpeed) {
      this.dx = this.maxSpeed * Math.sign(this.dx);
    }
    if (Math.abs(this.dy) > this.maxSpeed) {
      this.dy = this.maxSpeed * Math.sign(this.dy);
    }
  }

  reset(x, y) {
    this.x = x;
    this.y = y;
    this.dx = this.speed * (Math.random() > 0.5 ? 1 : -1);
    this.dy = -this.speed;
  }
}

class Paddle {
  constructor(x, y, width = 100, height = 15, speed = 8) {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.speed = speed;
    this.maxX = 0;
    this.minX = 0;
  }

  setBounds(minX, maxX) {
    this.minX = minX;
    this.maxX = maxX - this.width;
  }

  moveLeft() {
    this.x = Math.max(this.minX, this.x - this.speed);
  }

  moveRight() {
    this.x = Math.min(this.maxX, this.x + this.speed);
  }

  moveTo(x) {
    this.x = Math.max(this.minX, Math.min(this.maxX, x - this.width / 2));
  }

  getCenterX() {
    return this.x + this.width / 2;
  }

  contains(x, y) {
    return x >= this.x && x <= this.x + this.width && 
           y >= this.y && y <= this.y + this.height;
  }
}

class Brick {
  constructor(x, y, width = 75, height = 20, points = 100, color = '#FF6B6B') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.points = points;
    this.color = color;
    this.destroyed = false;
  }

  hit() {
    this.destroyed = true;
    return this.points;
  }

  contains(x, y) {
    return !this.destroyed && 
           x >= this.x && x <= this.x + this.width && 
           y >= this.y && y <= this.y + this.height;
  }

  intersects(ball) {
    if (this.destroyed) return false;
    
    return ball.x + ball.radius > this.x &&
           ball.x - ball.radius < this.x + this.width &&
           ball.y + ball.radius > this.y &&
           ball.y - ball.radius < this.y + this.height;
  }
}

class GameEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.gameState = {
      score: 0,
      lives: 3,
      level: 1,
      isRunning: false,
      gameOver: false,
      victory: false,
      paused: false
    };

    this.ball = new Ball(this.width / 2, this.height - 100);
    this.paddle = new Paddle(this.width / 2 - 50, this.height - 30);
    this.paddle.setBounds(0, this.width);
    
    this.bricks = [];
    this.keys = {};
    this.lastTime = 0;
    this.animationId = null;

    this.initializeBricks();
    this.setupEventListeners();
  }

  initializeBricks() {
    this.bricks = [];
    const brickWidth = 75;
    const brickHeight = 20;
    const brickPadding = 5;
    const brickOffsetTop = 60;
    const brickOffsetLeft = 35;
    const rows = 8;
    const cols = Math.floor((this.width - 2 * brickOffsetLeft) / (brickWidth + brickPadding));

    const colors = ['#FF6B6B', '#4ECDC4', '#45B7D1', '#96CEB4', '#FECA57', '#FF9FF3', '#54A0FF', '#5F27CD'];

    for (let row = 0; row < rows; row++) {
      for (let col = 0; col < cols; col++) {
        const x = brickOffsetLeft + col * (brickWidth + brickPadding);
        const y = brickOffsetTop + row * (brickHeight + brickPadding);
        const points = (rows - row) * 10;
        const color = colors[row % colors.length];
        
        this.bricks.push(new Brick(x, y, brickWidth, brickHeight, points, color));
      }
    }
  }

  setupEventListeners() {
    document.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
        this.togglePause();
      }
    });

    document.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });

    this.canvas.addEventListener('mousemove', (e) => {
      if (this.gameState.isRunning && !this.gameState.paused) {
        const rect = this.canvas.getBoundingClientRect();
        const mouseX = e.clientX - rect.left;
        this.paddle.moveTo(mouseX);
      }
    });
  }

  handleInput() {
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) {
      this.paddle.moveLeft();
    }
    if (this.keys['ArrowRight'] || this.keys['KeyD']) {
      this.paddle.moveRight();
    }
  }

  checkCollisions() {
    // Ball-wall collisions
    if (this.ball.x - this.ball.radius <= 0 || this.ball.x + this.ball.radius >= this.width) {
      this.ball.reverseX();
    }
    if (this.ball.y - this.ball.radius <= 0) {
      this.ball.reverseY();
    }

    // Ball-paddle collision
    if (this.ball.y + this.ball.radius >= this.paddle.y &&
        this.ball.x >= this.paddle.x &&
        this.ball.x <= this.paddle.x + this.paddle.width) {
      
      const hitPos = (this.ball.x - this.paddle.getCenterX()) / (this.paddle.width / 2);
      const angle = hitPos * Math.PI / 3;
      const speed = Math.sqrt(this.ball.dx * this.ball.dx + this.ball.dy * this.ball.dy);
      
      this.ball.setDirection(speed * Math.sin(angle), -speed * Math.cos(angle));
    }

    // Ball-brick collisions
    for (const brick of this.bricks) {
      if (brick.intersects(this.ball)) {
        this.gameState.score += brick.hit();
        this.ball.reverseY();
        this.ball.increaseSpeed();
        break;
      }
    }

    // Ball out of bounds
    if (this.ball.y > this.height) {
      this.gameState.lives--;
      if (this.gameState.lives <= 0) {
        this.gameOver();
      } else {
        this.resetBall();
      }
    }

    // Victory condition
    if (this.bricks.every(brick => brick.destroyed)) {
      this.victory();
    }
  }

  resetBall() {
    this.ball.reset(this.width / 2, this.height - 100);
  }

  gameOver() {
    this.gameState.gameOver = true;
    this.gameState.isRunning = false;
    this.stop();
  }

  victory() {
    this.gameState.victory = true;
    this.gameState.isRunning = false;
    this.stop();
  }

  start() {
    this.gameState.isRunning = true;
    this.gameState.gameOver = false;
    this.gameState.victory = false;
    this.gameState.paused = false;
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
    if (!this.gameState.isRunning) return;
    
    this.gameState.paused = !this.gameState.paused;
    if (!this.gameState.paused) {
      this.gameLoop();
    }
  }

  reset() {
    this.gameState = {
      score: 0,
      lives: 3,
      level: 1,
      isRunning: false,
      gameOver: false,
      victory: false,
      paused: false
    };
    
    this.ball.reset(this.width / 2, this.height - 100);
    this.paddle.x = this.width / 2 - this.paddle.width / 2;
    this.initializeBricks();
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
    this.ctx.fillStyle = '#1a1a2e';
    this.ctx.fillRect(0, 0, this.width, this.height);

    // Draw bricks
    this.bricks.forEach(brick => {
      if (!brick.destroyed) {
        this.ctx.fillStyle = brick.color;
        this.ctx.fillRect(brick.x, brick.y, brick.width, brick.height);
        
        // Brick border
        this.ctx.strokeStyle = '#fff';
        this.ctx.lineWidth = 1;
        this.ctx.strokeRect(brick.x, brick.y, brick.width, brick.height);
      }
    });

    // Draw paddle
    this.ctx.fillStyle = '#FFD93D';
    this.ctx.fillRect(this.paddle.x, this.paddle.y, this.paddle.width, this.paddle.height);

    // Draw ball
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.beginPath();
    this.ctx.arc(this.ball.x, this.ball.y, this.ball.radius, 0, Math.PI * 2);
    this.ctx.fill();

    // Draw UI
    this.drawUI();

    // Draw pause/game over overlays
    if (this.gameState.paused) {
      this.drawPauseOverlay();
    } else if (this.gameState.gameOver) {
      this.drawGameOverOverlay();
    } else if (this.gameState.victory) {
      this.drawVictoryOverlay();
    }
  }

  drawUI() {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.gameState.score}`, 20, 30);
    this.ctx.fillText(`Lives: ${this.gameState.lives}`, this.width - 100, 30);
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
    this.ctx.textAlign = 'left';
  }

  drawGameOverOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#FF6B6B';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.width / 2, this.height / 2);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Final Score: ${this.gameState.score}`, this.width / 2, this.height / 2 + 50);
    this.ctx.textAlign = 'left';
  }

  drawVictoryOverlay() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#4ECDC4';
    this.ctx.font = '48px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('VICTORY!', this.width / 2, this.height / 2);
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '24px Arial';
    this.ctx.fillText(`Score: ${this.gameState.score}`, this.width / 2, this.height / 2 + 50);
    this.ctx.textAlign = 'left';
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

export { Ball, Paddle, Brick, GameEngine };
export default GameEngine;