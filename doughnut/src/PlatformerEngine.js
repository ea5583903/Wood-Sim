class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 32;
    this.height = 32;
    this.velocityX = 0;
    this.velocityY = 0;
    this.speed = 5;
    this.jumpPower = 12;
    this.onGround = false;
    this.lives = 3;
    this.invulnerable = false;
    this.invulnerabilityTime = 0;
    this.direction = 1; // 1 for right, -1 for left
  }

  update(platforms, enemies, collectibles) {
    // Apply gravity
    this.velocityY += 0.5;
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Apply friction
    this.velocityX *= 0.8;
    
    // Reset ground state
    this.onGround = false;
    
    // Platform collision
    this.checkPlatformCollisions(platforms);
    
    // Enemy collision
    this.checkEnemyCollisions(enemies);
    
    // Collectible collision
    this.checkCollectibleCollisions(collectibles);
    
    // Update invulnerability
    if (this.invulnerable) {
      this.invulnerabilityTime--;
      if (this.invulnerabilityTime <= 0) {
        this.invulnerable = false;
      }
    }
    
    // Limit fall speed
    if (this.velocityY > 15) {
      this.velocityY = 15;
    }
  }

  checkPlatformCollisions(platforms) {
    for (const platform of platforms) {
      if (this.intersects(platform)) {
        // Vertical collision (landing on platform or hitting ceiling)
        if (this.velocityY > 0 && this.y < platform.y) {
          // Landing on top
          this.y = platform.y - this.height;
          this.velocityY = 0;
          this.onGround = true;
        } else if (this.velocityY < 0 && this.y > platform.y) {
          // Hit ceiling
          this.y = platform.y + platform.height;
          this.velocityY = 0;
        }
        
        // Horizontal collision
        if (this.velocityX > 0 && this.x < platform.x) {
          // Hit left side of platform
          this.x = platform.x - this.width;
          this.velocityX = 0;
        } else if (this.velocityX < 0 && this.x > platform.x) {
          // Hit right side of platform
          this.x = platform.x + platform.width;
          this.velocityX = 0;
        }
      }
    }
  }

  checkEnemyCollisions(enemies) {
    if (this.invulnerable) return;
    
    for (const enemy of enemies) {
      if (this.intersects(enemy) && enemy.active) {
        // Check if player is falling on enemy
        if (this.velocityY > 0 && this.y < enemy.y - 10) {
          // Player defeats enemy by jumping on it
          enemy.active = false;
          this.velocityY = -8; // Bounce
          return { type: 'enemyDefeated', enemy };
        } else {
          // Player takes damage
          this.takeDamage();
          return { type: 'playerHit' };
        }
      }
    }
    return null;
  }

  checkCollectibleCollisions(collectibles) {
    for (let i = collectibles.length - 1; i >= 0; i--) {
      const collectible = collectibles[i];
      if (this.intersects(collectible)) {
        collectibles.splice(i, 1);
        return { type: 'collected', collectible };
      }
    }
    return null;
  }

  intersects(obj) {
    return this.x < obj.x + obj.width &&
           this.x + this.width > obj.x &&
           this.y < obj.y + obj.height &&
           this.y + this.height > obj.y;
  }

  moveLeft() {
    this.velocityX = -this.speed;
    this.direction = -1;
  }

  moveRight() {
    this.velocityX = this.speed;
    this.direction = 1;
  }

  jump() {
    if (this.onGround) {
      this.velocityY = -this.jumpPower;
      this.onGround = false;
    }
  }

  takeDamage() {
    if (!this.invulnerable) {
      this.lives--;
      this.invulnerable = true;
      this.invulnerabilityTime = 120; // 2 seconds at 60fps
      // Knockback
      this.velocityY = -5;
      this.velocityX = -this.direction * 3;
    }
  }
}

class Enemy {
  constructor(x, y, type = 'walker') {
    this.x = x;
    this.y = y;
    this.width = 24;
    this.height = 24;
    this.type = type;
    this.velocityX = type === 'walker' ? -1 : 0;
    this.velocityY = 0;
    this.active = true;
    this.direction = -1;
    this.patrolDistance = 100;
    this.startX = x;
  }

  update(platforms) {
    if (!this.active) return;

    // Apply gravity
    this.velocityY += 0.5;
    
    // Update position
    this.x += this.velocityX;
    this.y += this.velocityY;
    
    // Platform collision
    this.checkPlatformCollisions(platforms);
    
    // Patrol behavior
    if (this.type === 'walker') {
      if (Math.abs(this.x - this.startX) > this.patrolDistance) {
        this.direction *= -1;
        this.velocityX = this.direction;
      }
    }
  }

  checkPlatformCollisions(platforms) {
    for (const platform of platforms) {
      if (this.intersects(platform)) {
        if (this.velocityY > 0 && this.y < platform.y) {
          this.y = platform.y - this.height;
          this.velocityY = 0;
        }
      }
    }
  }

  intersects(obj) {
    return this.x < obj.x + obj.width &&
           this.x + this.width > obj.x &&
           this.y < obj.y + obj.height &&
           this.y + this.height > obj.y;
  }
}

class Collectible {
  constructor(x, y, type = 'doughnut') {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.type = type;
    this.value = type === 'doughnut' ? 100 : type === 'cherry' ? 500 : 1000;
    this.bobOffset = Math.random() * Math.PI * 2;
    this.bobSpeed = 0.1;
    this.originalY = y;
  }

  update() {
    // Bobbing animation
    this.y = this.originalY + Math.sin(Date.now() * this.bobSpeed + this.bobOffset) * 3;
  }
}

class Platform {
  constructor(x, y, width, height, type = 'normal') {
    this.x = x;
    this.y = y;
    this.width = width;
    this.height = height;
    this.type = type;
  }
}

class Level {
  constructor(levelData) {
    this.platforms = levelData.platforms.map(p => new Platform(p.x, p.y, p.width, p.height, p.type));
    this.enemies = levelData.enemies.map(e => new Enemy(e.x, e.y, e.type));
    this.collectibles = levelData.collectibles.map(c => new Collectible(c.x, c.y, c.type));
    this.startX = levelData.startX || 50;
    this.startY = levelData.startY || 300;
    this.exitX = levelData.exitX || 750;
    this.exitY = levelData.exitY || 300;
    this.background = levelData.background || '#87CEEB';
  }
}

class PlatformerEngine {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.canvas.width = 800;
    this.canvas.height = 600;
    
    this.gameState = {
      currentLevel: 0,
      score: 0,
      lives: 3,
      isRunning: false,
      gameOver: false,
      victory: false,
      level: null,
      player: null,
      camera: { x: 0, y: 0 },
      keys: {},
      alerts: []
    };
    
    this.levels = this.createLevels();
    this.loadLevel(0);
    
    this.gameLoop = null;
    this.setupControls();
  }

  createLevels() {
    return [
      // Level 1 - Tutorial
      {
        platforms: [
          { x: 0, y: 550, width: 200, height: 50 },
          { x: 250, y: 500, width: 100, height: 20 },
          { x: 400, y: 450, width: 100, height: 20 },
          { x: 550, y: 400, width: 100, height: 20 },
          { x: 700, y: 350, width: 200, height: 50 }
        ],
        enemies: [
          { x: 300, y: 480, type: 'walker' }
        ],
        collectibles: [
          { x: 275, y: 460, type: 'doughnut' },
          { x: 425, y: 410, type: 'doughnut' },
          { x: 575, y: 360, type: 'cherry' },
          { x: 750, y: 310, type: 'doughnut' }
        ],
        startX: 50,
        startY: 500,
        exitX: 750,
        exitY: 300
      },
      // Level 2 - More Complex
      {
        platforms: [
          { x: 0, y: 550, width: 150, height: 50 },
          { x: 200, y: 500, width: 80, height: 20 },
          { x: 320, y: 450, width: 80, height: 20 },
          { x: 450, y: 500, width: 80, height: 20 },
          { x: 580, y: 400, width: 80, height: 20 },
          { x: 720, y: 350, width: 80, height: 20 },
          { x: 650, y: 550, width: 150, height: 50 }
        ],
        enemies: [
          { x: 250, y: 480, type: 'walker' },
          { x: 500, y: 480, type: 'walker' },
          { x: 680, y: 530, type: 'walker' }
        ],
        collectibles: [
          { x: 225, y: 460, type: 'doughnut' },
          { x: 345, y: 410, type: 'doughnut' },
          { x: 475, y: 460, type: 'doughnut' },
          { x: 605, y: 360, type: 'cherry' },
          { x: 745, y: 310, type: 'doughnut' },
          { x: 700, y: 510, type: 'doughnut' }
        ],
        startX: 50,
        startY: 500,
        exitX: 750,
        exitY: 300
      },
      // Level 3 - Challenge
      {
        platforms: [
          { x: 0, y: 550, width: 120, height: 50 },
          { x: 150, y: 480, width: 60, height: 20 },
          { x: 250, y: 420, width: 60, height: 20 },
          { x: 350, y: 360, width: 60, height: 20 },
          { x: 450, y: 420, width: 60, height: 20 },
          { x: 550, y: 480, width: 60, height: 20 },
          { x: 650, y: 360, width: 60, height: 20 },
          { x: 720, y: 300, width: 80, height: 20 },
          { x: 400, y: 550, width: 200, height: 50 }
        ],
        enemies: [
          { x: 180, y: 460, type: 'walker' },
          { x: 280, y: 400, type: 'walker' },
          { x: 480, y: 400, type: 'walker' },
          { x: 450, y: 530, type: 'walker' }
        ],
        collectibles: [
          { x: 175, y: 440, type: 'doughnut' },
          { x: 275, y: 380, type: 'doughnut' },
          { x: 375, y: 320, type: 'cherry' },
          { x: 475, y: 380, type: 'doughnut' },
          { x: 575, y: 440, type: 'doughnut' },
          { x: 675, y: 320, type: 'doughnut' },
          { x: 745, y: 260, type: 'golden' }
        ],
        startX: 50,
        startY: 500,
        exitX: 750,
        exitY: 250
      }
    ];
  }

  loadLevel(levelIndex) {
    if (levelIndex >= this.levels.length) {
      this.gameState.victory = true;
      return;
    }
    
    this.gameState.currentLevel = levelIndex;
    this.gameState.level = new Level(this.levels[levelIndex]);
    this.gameState.player = new Player(
      this.gameState.level.startX,
      this.gameState.level.startY
    );
    this.gameState.player.lives = this.gameState.lives;
    this.gameState.camera.x = 0;
    this.gameState.camera.y = 0;
  }

  setupControls() {
    document.addEventListener('keydown', (e) => {
      this.gameState.keys[e.code] = true;
      
      if (e.code === 'Space') {
        e.preventDefault();
      }
    });
    
    document.addEventListener('keyup', (e) => {
      this.gameState.keys[e.code] = false;
    });
  }

  start() {
    this.gameState.isRunning = true;
    this.gameLoop = setInterval(() => {
      this.update();
      this.render();
    }, 1000 / 60); // 60 FPS
  }

  stop() {
    this.gameState.isRunning = false;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  update() {
    if (!this.gameState.isRunning || this.gameState.gameOver || this.gameState.victory) {
      return;
    }
    
    const { player, level, keys } = this.gameState;
    
    // Handle input
    if (keys['ArrowLeft'] || keys['KeyA']) {
      player.moveLeft();
    }
    if (keys['ArrowRight'] || keys['KeyD']) {
      player.moveRight();
    }
    if (keys['Space'] || keys['ArrowUp'] || keys['KeyW']) {
      player.jump();
    }
    
    // Update game objects
    player.update(level.platforms, level.enemies, level.collectibles);
    
    level.enemies.forEach(enemy => {
      enemy.update(level.platforms);
    });
    
    level.collectibles.forEach(collectible => {
      collectible.update();
    });
    
    // Check collisions and events
    const playerCollision = player.checkEnemyCollisions(level.enemies);
    if (playerCollision) {
      if (playerCollision.type === 'enemyDefeated') {
        this.gameState.score += 200;
        this.addAlert('Enemy defeated! +200 points', 'success');
      } else if (playerCollision.type === 'playerHit') {
        this.addAlert('Ouch! Life lost!', 'error');
      }
    }
    
    const collectibleCollision = player.checkCollectibleCollisions(level.collectibles);
    if (collectibleCollision) {
      this.gameState.score += collectibleCollision.collectible.value;
      const points = collectibleCollision.collectible.value;
      this.addAlert(`+${points} points!`, 'success');
    }
    
    // Update camera
    this.updateCamera();
    
    // Check for level completion
    if (Math.abs(player.x - level.exitX) < 30 && Math.abs(player.y - level.exitY) < 30) {
      this.completeLevel();
    }
    
    // Check for death
    if (player.y > 700) {
      player.takeDamage();
      if (player.lives <= 0) {
        this.gameOver();
      } else {
        // Respawn
        player.x = level.startX;
        player.y = level.startY;
        player.velocityX = 0;
        player.velocityY = 0;
      }
    }
    
    this.gameState.lives = player.lives;
    
    if (player.lives <= 0) {
      this.gameOver();
    }
  }

  updateCamera() {
    const { player, camera } = this.gameState;
    
    // Follow player horizontally
    const targetX = player.x - this.canvas.width / 2;
    camera.x = Math.max(0, Math.min(targetX, 800 - this.canvas.width));
    
    // Keep camera steady vertically, but adjust if player goes too high
    const targetY = Math.max(0, player.y - this.canvas.height * 0.7);
    camera.y = Math.max(0, Math.min(targetY, 600 - this.canvas.height));
  }

  completeLevel() {
    this.gameState.score += 1000;
    this.addAlert('Level Complete! +1000 points!', 'success');
    
    setTimeout(() => {
      this.loadLevel(this.gameState.currentLevel + 1);
      if (this.gameState.victory) {
        this.addAlert('Congratulations! You won!', 'success');
        this.stop();
      }
    }, 1000);
  }

  gameOver() {
    this.gameState.gameOver = true;
    this.addAlert('Game Over!', 'error');
    this.stop();
  }

  render() {
    const { ctx, canvas } = this;
    const { player, level, camera } = this.gameState;
    
    // Clear canvas
    ctx.fillStyle = level.background;
    ctx.fillRect(0, 0, canvas.width, canvas.height);
    
    // Save context for camera transform
    ctx.save();
    ctx.translate(-camera.x, -camera.y);
    
    // Draw platforms
    ctx.fillStyle = '#8B4513';
    level.platforms.forEach(platform => {
      ctx.fillRect(platform.x, platform.y, platform.width, platform.height);
      
      // Add some detail to platforms
      ctx.fillStyle = '#A0522D';
      ctx.fillRect(platform.x, platform.y, platform.width, 5);
      ctx.fillStyle = '#8B4513';
    });
    
    // Draw collectibles
    level.collectibles.forEach(collectible => {
      if (collectible.type === 'doughnut') {
        ctx.fillStyle = '#DEB887';
        ctx.beginPath();
        ctx.arc(collectible.x + 10, collectible.y + 10, 10, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#8B4513';
        ctx.beginPath();
        ctx.arc(collectible.x + 10, collectible.y + 10, 4, 0, Math.PI * 2);
        ctx.fill();
      } else if (collectible.type === 'cherry') {
        ctx.fillStyle = '#FF0000';
        ctx.beginPath();
        ctx.arc(collectible.x + 10, collectible.y + 10, 8, 0, Math.PI * 2);
        ctx.fill();
      } else if (collectible.type === 'golden') {
        ctx.fillStyle = '#FFD700';
        ctx.beginPath();
        ctx.arc(collectible.x + 10, collectible.y + 10, 12, 0, Math.PI * 2);
        ctx.fill();
        
        ctx.fillStyle = '#FFA500';
        ctx.beginPath();
        ctx.arc(collectible.x + 10, collectible.y + 10, 5, 0, Math.PI * 2);
        ctx.fill();
      }
    });
    
    // Draw enemies
    level.enemies.forEach(enemy => {
      if (enemy.active) {
        ctx.fillStyle = '#FF4500';
        ctx.fillRect(enemy.x, enemy.y, enemy.width, enemy.height);
        
        // Eyes
        ctx.fillStyle = '#FFFFFF';
        ctx.fillRect(enemy.x + 4, enemy.y + 4, 4, 4);
        ctx.fillRect(enemy.x + 16, enemy.y + 4, 4, 4);
        
        ctx.fillStyle = '#000000';
        ctx.fillRect(enemy.x + 5, enemy.y + 5, 2, 2);
        ctx.fillRect(enemy.x + 17, enemy.y + 5, 2, 2);
      }
    });
    
    // Draw exit
    ctx.fillStyle = '#00FF00';
    ctx.fillRect(level.exitX - 15, level.exitY - 30, 30, 30);
    ctx.fillStyle = '#008000';
    ctx.fillRect(level.exitX - 10, level.exitY - 25, 20, 20);
    
    // Draw player
    const flashAlpha = player.invulnerable && Math.floor(Date.now() / 100) % 2 ? 0.5 : 1;
    ctx.globalAlpha = flashAlpha;
    
    ctx.fillStyle = '#4169E1';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    
    // Player face
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(player.x + 6, player.y + 6, 4, 4);
    ctx.fillRect(player.x + 22, player.y + 6, 4, 4);
    
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 7, player.y + 7, 2, 2);
    ctx.fillRect(player.x + 23, player.y + 7, 2, 2);
    
    // Smile
    ctx.fillStyle = '#000000';
    ctx.fillRect(player.x + 12, player.y + 18, 8, 2);
    ctx.fillRect(player.x + 10, player.y + 16, 2, 2);
    ctx.fillRect(player.x + 20, player.y + 16, 2, 2);
    
    ctx.globalAlpha = 1;
    
    // Restore context
    ctx.restore();
    
    // Draw UI
    this.renderUI();
  }

  renderUI() {
    const { ctx } = this;
    const { score, lives, currentLevel } = this.gameState;
    
    // Score
    ctx.fillStyle = '#000000';
    ctx.font = '20px Arial';
    ctx.fillText(`Score: ${score}`, 10, 30);
    
    // Lives
    ctx.fillText(`Lives: ${lives}`, 10, 60);
    
    // Level
    ctx.fillText(`Level: ${currentLevel + 1}`, 10, 90);
    
    // Controls
    ctx.font = '14px Arial';
    ctx.fillStyle = '#666666';
    ctx.fillText('Arrow keys or WASD to move, Space to jump', 10, this.canvas.height - 10);
    
    // Game over/victory messages
    if (this.gameState.gameOver) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      ctx.fillStyle = '#FF0000';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('GAME OVER', this.canvas.width / 2, this.canvas.height / 2);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
      ctx.textAlign = 'left';
    }
    
    if (this.gameState.victory) {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
      ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
      
      ctx.fillStyle = '#00FF00';
      ctx.font = '48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('VICTORY!', this.canvas.width / 2, this.canvas.height / 2);
      
      ctx.fillStyle = '#FFFFFF';
      ctx.font = '24px Arial';
      ctx.fillText(`Final Score: ${score}`, this.canvas.width / 2, this.canvas.height / 2 + 50);
      ctx.textAlign = 'left';
    }
  }

  addAlert(message, type = 'info') {
    this.gameState.alerts.unshift({
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (this.gameState.alerts.length > 5) {
      this.gameState.alerts.pop();
    }
  }

  resetGame() {
    this.stop();
    this.gameState = {
      currentLevel: 0,
      score: 0,
      lives: 3,
      isRunning: false,
      gameOver: false,
      victory: false,
      level: null,
      player: null,
      camera: { x: 0, y: 0 },
      keys: {},
      alerts: []
    };
    this.loadLevel(0);
  }
}

export default PlatformerEngine;