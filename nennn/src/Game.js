import AudioManager from './Audio';
import Leaderboard from './Leaderboard';

class Game {
  constructor(canvas) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d');
    this.width = canvas.width;
    this.height = canvas.height;
    
    this.gameState = 'playing';
    this.score = 0;
    this.lives = 3;
    this.lastTime = 0;
    this.invulnerable = false;
    this.invulnerableTime = 0;
    
    this.player = new Player(this.width / 2, this.height - 50);
    this.bullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.particles = [];
    
    this.keys = {};
    this.lastShotTime = 0;
    this.shotCooldown = 150;
    
    this.waveController = new WaveController(this);
    this.combo = 0;
    this.comboMultiplier = 1;
    this.lastHitTime = 0;
    
    this.audio = new AudioManager();
    this.starfield = this.generateStarfield();
    this.leaderboard = new Leaderboard();
    
    this.gameStartTime = Date.now();
    this.enemiesKilled = 0;
    this.showLeaderboard = false;
    this.nameInput = '';
    this.isNewHighScore = false;
    
    this.bindEvents();
  }
  
  bindEvents() {
    window.addEventListener('keydown', (e) => {
      this.keys[e.code] = true;
      if (e.code === 'Space') {
        e.preventDefault();
      }
      if (e.code === 'KeyP' && this.gameState === 'playing') {
        this.gameState = 'paused';
      } else if (e.code === 'KeyP' && this.gameState === 'paused') {
        this.gameState = 'playing';
      }
      if (e.code === 'Space' && this.gameState === 'gameOver' && !this.isNewHighScore) {
        this.restart();
      }
      if (e.code === 'KeyL' && this.gameState === 'gameOver') {
        this.showLeaderboard = !this.showLeaderboard;
      }
      if (this.gameState === 'gameOver' && this.isNewHighScore) {
        this.handleNameInput(e);
      }
    });
    
    window.addEventListener('keyup', (e) => {
      this.keys[e.code] = false;
    });
  }
  
  handleNameInput(e) {
    if (e.code === 'Enter') {
      this.submitScore();
    } else if (e.code === 'Backspace') {
      this.nameInput = this.nameInput.slice(0, -1);
    } else if (e.key.length === 1 && this.nameInput.length < 12) {
      this.nameInput += e.key.toUpperCase();
    }
  }
  
  submitScore() {
    const timeAlive = Date.now() - this.gameStartTime;
    this.leaderboard.addScore(
      this.nameInput || 'ANONYMOUS',
      this.score,
      Math.floor(this.waveController.threatLevel),
      Math.floor(this.combo),
      this.enemiesKilled,
      timeAlive
    );
    
    this.isNewHighScore = false;
    this.showLeaderboard = true;
  }
  
  update(deltaTime) {
    if (this.gameState !== 'playing') return;
    
    if (this.invulnerable) {
      this.invulnerableTime -= deltaTime;
      if (this.invulnerableTime <= 0) {
        this.invulnerable = false;
      }
    }
    
    this.updatePlayer(deltaTime);
    this.updateBullets(deltaTime);
    this.updateEnemies(deltaTime);
    this.updatePowerUps(deltaTime);
    this.updateParticles(deltaTime);
    this.waveController.update(deltaTime);
    this.updateCombo(deltaTime);
    this.checkCollisions();
  }
  
  updatePlayer(deltaTime) {
    let dx = 0, dy = 0;
    
    if (this.keys['ArrowLeft'] || this.keys['KeyA']) dx = -1;
    if (this.keys['ArrowRight'] || this.keys['KeyD']) dx = 1;
    if (this.keys['ArrowUp'] || this.keys['KeyW']) dy = -1;
    if (this.keys['ArrowDown'] || this.keys['KeyS']) dy = 1;
    
    if (dx !== 0 && dy !== 0) {
      dx *= 0.707;
      dy *= 0.707;
    }
    
    this.player.update(dx, dy, deltaTime, this.width, this.height);
    
    if (this.keys['Space'] && Date.now() - this.lastShotTime > this.shotCooldown) {
      this.bullets.push(new Bullet(this.player.x, this.player.y - 10, 0, -400, 'player'));
      this.audio.playShoot();
      this.lastShotTime = Date.now();
    }
  }
  
  updateBullets(deltaTime) {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      bullet.update(deltaTime);
      
      if (bullet.y < -10 || bullet.y > this.height + 10) {
        this.bullets.splice(i, 1);
      }
    }
  }
  
  updateEnemies(deltaTime) {
    for (let i = this.enemies.length - 1; i >= 0; i--) {
      const enemy = this.enemies[i];
      enemy.update(deltaTime, this.player);
      
      if (enemy.y > this.height + 50) {
        this.enemies.splice(i, 1);
      }
    }
  }
  
  updatePowerUps(deltaTime) {
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      powerUp.update(deltaTime);
      
      if (powerUp.y > this.height + 20) {
        this.powerUps.splice(i, 1);
      }
    }
  }
  
  updateParticles(deltaTime) {
    for (let i = this.particles.length - 1; i >= 0; i--) {
      const particle = this.particles[i];
      particle.update(deltaTime);
      
      if (particle.life <= 0) {
        this.particles.splice(i, 1);
      }
    }
  }
  
  updateCombo(deltaTime) {
    if (Date.now() - this.lastHitTime > 3000) {
      this.combo = 0;
      this.comboMultiplier = 1;
    } else {
      this.comboMultiplier = Math.min(1 + this.combo * 0.1, 5);
    }
  }
  
  checkCollisions() {
    for (let i = this.bullets.length - 1; i >= 0; i--) {
      const bullet = this.bullets[i];
      if (bullet.owner !== 'player') continue;
      
      for (let j = this.enemies.length - 1; j >= 0; j--) {
        const enemy = this.enemies[j];
        
        if (this.checkCollision(bullet, enemy)) {
          this.bullets.splice(i, 1);
          
          // Ghost phasing
          if (enemy.type === 'ghost' && enemy.isPhased) {
            this.createArmorSpark(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            this.audio.createBeep(400, 0.05, 'sine');
            break;
          }
          
          let damage = 1;
          
          // Fortress and Titan shield system
          if ((enemy.type === 'fortress' || enemy.type === 'titan') && enemy.shieldHp > 0) {
            enemy.shieldHp--;
            this.createArmorSpark(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            this.audio.createBeep(500, 0.1, 'triangle');
            break;
          }
          
          // Phantom phasing
          if (enemy.type === 'phantom' && enemy.isPhased) {
            this.createArmorSpark(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            this.audio.createBeep(600, 0.05, 'sine');
            break;
          }
          
          // Regular armor
          if (enemy.armor && Math.random() < 0.3) {
            damage = 0;
            this.createArmorSpark(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
          }
          
          enemy.hp -= damage;
          
          if (damage > 0) {
            this.audio.playHit();
          } else {
            this.audio.createBeep(300, 0.05, 'square');
          }
          
          if (enemy.hp <= 0) {
            this.addScore(enemy.scoreValue);
            this.combo++;
            this.enemiesKilled++;
            this.lastHitTime = Date.now();
            
            // Splitter mechanics
            if ((enemy.type === 'splitter' || enemy.type === 'destroyer') && enemy.canSplit) {
              this.splitEnemy(enemy);
            }
            
            this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
            this.audio.playExplosion();
            this.enemies.splice(j, 1);
            
            const powerUpChance = enemy.armor || enemy.type === 'fortress' ? 0.25 : 0.1;
            if (Math.random() < powerUpChance) {
              this.powerUps.push(new PowerUp(enemy.x + enemy.width/2, enemy.y + enemy.height/2));
            }
          }
          break;
        }
      }
    }
    
    if (!this.invulnerable) {
      for (let i = this.enemies.length - 1; i >= 0; i--) {
        const enemy = this.enemies[i];
        
        if (this.checkCollision(this.player, enemy)) {
          this.takeDamage();
          this.enemies.splice(i, 1);
          this.createExplosion(enemy.x + enemy.width/2, enemy.y + enemy.height/2);
          this.audio.playExplosion();
          break;
        }
      }
    }
    
    for (let i = this.powerUps.length - 1; i >= 0; i--) {
      const powerUp = this.powerUps[i];
      
      if (this.checkCollision(this.player, powerUp)) {
        this.applyPowerUp(powerUp);
        this.audio.playPowerUp();
        this.powerUps.splice(i, 1);
      }
    }
  }
  
  checkCollision(a, b) {
    return a.x < b.x + b.width &&
           a.x + a.width > b.x &&
           a.y < b.y + b.height &&
           a.y + a.height > b.y;
  }
  
  takeDamage() {
    this.lives--;
    this.invulnerable = true;
    this.invulnerableTime = 2000;
    this.combo = 0;
    this.comboMultiplier = 1;
    this.audio.playDamage();
    
    if (this.lives <= 0) {
      this.gameState = 'gameOver';
      this.isNewHighScore = this.leaderboard.isHighScore(this.score);
    }
  }
  
  addScore(points) {
    this.score += Math.floor(points * this.comboMultiplier);
  }
  
  applyPowerUp(powerUp) {
    switch (powerUp.type) {
      case 'rapidFire':
        this.shotCooldown = 75;
        setTimeout(() => { this.shotCooldown = 150; }, 5000);
        break;
      case 'shield':
        this.invulnerable = true;
        this.invulnerableTime = 3000;
        break;
      default:
        break;
    }
  }
  
  createExplosion(x, y) {
    for (let i = 0; i < 8; i++) {
      const angle = (i / 8) * Math.PI * 2;
      const speed = 100 + Math.random() * 100;
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ffff00'));
    }
  }
  
  createArmorSpark(x, y) {
    for (let i = 0; i < 4; i++) {
      const angle = Math.random() * Math.PI * 2;
      const speed = 150 + Math.random() * 100;
      this.particles.push(new Particle(x, y, Math.cos(angle) * speed, Math.sin(angle) * speed, '#ffffff', 200));
    }
  }
  
  splitEnemy(enemy) {
    const splitCount = enemy.type === 'destroyer' ? 3 : 2;
    const splitType = enemy.type === 'destroyer' ? 'tank' : 'grunt';
    
    for (let i = 0; i < splitCount; i++) {
      const splitEnemy = new Enemy(
        enemy.x + (i * 20) - 10,
        enemy.y,
        splitType
      );
      splitEnemy.speed = enemy.type === 'destroyer' ? 100 : 120;
      splitEnemy.color = enemy.type === 'destroyer' ? '#ff4444' : '#ff88ff';
      splitEnemy.scoreValue = enemy.type === 'destroyer' ? 25 : 15;
      this.enemies.push(splitEnemy);
    }
  }
  
  render() {
    this.ctx.fillStyle = '#000';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.renderStarfield();
    
    this.bullets.forEach(bullet => bullet.render(this.ctx));
    this.enemies.forEach(enemy => enemy.render(this.ctx));
    this.powerUps.forEach(powerUp => powerUp.render(this.ctx));
    this.particles.forEach(particle => particle.render(this.ctx));
    
    if (!this.invulnerable || Math.floor(Date.now() / 100) % 2) {
      this.player.render(this.ctx);
    }
    
    this.renderHUD();
    
    if (this.gameState === 'paused') {
      this.renderPauseScreen();
    } else if (this.gameState === 'gameOver') {
      this.renderGameOverScreen();
    }
  }
  
  generateStarfield() {
    const stars = [];
    for (let i = 0; i < 100; i++) {
      stars.push({
        x: Math.random() * this.width,
        y: Math.random() * this.height,
        speed: 0.5 + Math.random() * 2,
        brightness: Math.random()
      });
    }
    return stars;
  }
  
  renderStarfield() {
    this.ctx.fillStyle = '#333';
    
    for (let star of this.starfield) {
      star.y += star.speed;
      if (star.y > this.height) {
        star.y = 0;
        star.x = Math.random() * this.width;
      }
      
      this.ctx.globalAlpha = star.brightness;
      this.ctx.fillRect(star.x, star.y, 1, 1);
    }
    this.ctx.globalAlpha = 1;
  }
  
  renderHUD() {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '20px Arial';
    this.ctx.fillText(`Score: ${this.score}`, 10, 30);
    
    this.ctx.font = '16px Arial';
    this.ctx.fillText(`Wave: ${Math.floor(this.waveController.threatLevel)}`, 10, 55);
    
    if (this.comboMultiplier > 1) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.font = '18px Arial';
      this.ctx.fillText(`Combo: x${this.comboMultiplier.toFixed(1)}`, 10, 80);
    }
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px Arial';
    this.ctx.fillText('Lives:', this.width - 100, 25);
    
    for (let i = 0; i < this.lives; i++) {
      this.ctx.fillStyle = '#00ff00';
      this.ctx.fillRect(this.width - 50 - (i * 18), 10, 15, 15);
    }
    
    if (this.invulnerable) {
      this.ctx.fillStyle = '#00aaff';
      this.ctx.font = '12px Arial';
      this.ctx.fillText('INVULNERABLE', this.width - 120, 45);
    }
    
    this.renderMiniLeaderboard();
  }
  
  renderMiniLeaderboard() {
    const topScores = this.leaderboard.getTopScores(3);
    if (topScores.length === 0) return;
    
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.3)';
    this.ctx.fillRect(10, this.height - 120, 200, 110);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '14px Arial';
    this.ctx.fillText('TOP SCORES', 15, this.height - 100);
    
    for (let i = 0; i < topScores.length && i < 3; i++) {
      const score = topScores[i];
      const y = this.height - 80 + (i * 20);
      
      if (i === 0) this.ctx.fillStyle = '#ffd700';
      else if (i === 1) this.ctx.fillStyle = '#c0c0c0';
      else this.ctx.fillStyle = '#cd7f32';
      
      this.ctx.font = '12px Arial';
      this.ctx.fillText(`${i + 1}. ${score.name}`, 15, y);
      this.ctx.fillText(score.score.toLocaleString(), 130, y);
    }
    
    const currentRank = this.leaderboard.getRank(this.score);
    if (currentRank <= 10) {
      this.ctx.fillStyle = '#00ff00';
      this.ctx.font = '10px Arial';
      this.ctx.fillText(`Current rank: #${currentRank}`, 15, this.height - 25);
    }
  }
  
  renderPauseScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('PAUSED', this.width / 2, this.height / 2);
    this.ctx.font = '20px Arial';
    this.ctx.fillText('Press P to resume', this.width / 2, this.height / 2 + 40);
    this.ctx.textAlign = 'left';
  }
  
  renderGameOverScreen() {
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.9)';
    this.ctx.fillRect(0, 0, this.width, this.height);
    
    if (this.showLeaderboard) {
      this.renderLeaderboard();
      return;
    }
    
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '40px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('GAME OVER', this.width / 2, 80);
    
    if (this.isNewHighScore) {
      this.ctx.fillStyle = '#ffff00';
      this.ctx.font = '32px Arial';
      this.ctx.fillText('NEW HIGH SCORE!', this.width / 2, 130);
      
      this.ctx.fillStyle = '#fff';
      this.ctx.font = '20px Arial';
      this.ctx.fillText('Enter your name:', this.width / 2, 170);
      
      this.ctx.fillStyle = '#00aaff';
      this.ctx.font = '24px Arial';
      this.ctx.fillText(this.nameInput + '_', this.width / 2, 200);
      
      this.ctx.fillStyle = '#aaa';
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Press ENTER to submit', this.width / 2, 230);
    } else {
      this.ctx.font = '24px Arial';
      this.ctx.fillText(`Final Score: ${this.score}`, this.width / 2, 140);
      
      const timeAlive = this.leaderboard.formatTime(Date.now() - this.gameStartTime);
      this.ctx.font = '18px Arial';
      this.ctx.fillText(`Time Survived: ${timeAlive}`, this.width / 2, 170);
      this.ctx.fillText(`Enemies Destroyed: ${this.enemiesKilled}`, this.width / 2, 195);
      this.ctx.fillText(`Highest Wave: ${Math.floor(this.waveController.threatLevel)}`, this.width / 2, 220);
      
      this.ctx.font = '16px Arial';
      this.ctx.fillText('Press SPACE to restart', this.width / 2, 260);
      this.ctx.fillText('Press L for leaderboard', this.width / 2, 280);
    }
    
    this.ctx.textAlign = 'left';
  }
  
  renderLeaderboard() {
    this.ctx.fillStyle = '#fff';
    this.ctx.font = '32px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('LEADERBOARD', this.width / 2, 50);
    
    const scores = this.leaderboard.getTopScores(8);
    
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'left';
    
    const startY = 90;
    const lineHeight = 30;
    
    this.ctx.fillStyle = '#aaa';
    this.ctx.fillText('Rank', 50, startY);
    this.ctx.fillText('Name', 120, startY);
    this.ctx.fillText('Score', 250, startY);
    this.ctx.fillText('Wave', 350, startY);
    this.ctx.fillText('Time', 420, startY);
    this.ctx.fillText('Date', 500, startY);
    
    for (let i = 0; i < scores.length; i++) {
      const score = scores[i];
      const y = startY + (i + 1) * lineHeight + 10;
      
      if (i < 3) {
        this.ctx.fillStyle = ['#ffd700', '#c0c0c0', '#cd7f32'][i];
      } else {
        this.ctx.fillStyle = '#fff';
      }
      
      this.ctx.fillText(`${i + 1}.`, 50, y);
      this.ctx.fillText(score.name.substring(0, 10), 120, y);
      this.ctx.fillText(score.score.toLocaleString(), 250, y);
      this.ctx.fillText(score.wave.toString(), 350, y);
      this.ctx.fillText(this.leaderboard.formatTime(score.timeAlive), 420, y);
      this.ctx.fillText(score.date, 500, y);
    }
    
    this.ctx.fillStyle = '#aaa';
    this.ctx.font = '16px Arial';
    this.ctx.textAlign = 'center';
    this.ctx.fillText('Press L to close • Press SPACE to restart', this.width / 2, this.height - 30);
    this.ctx.textAlign = 'left';
  }
  
  restart() {
    this.gameState = 'playing';
    this.score = 0;
    this.lives = 3;
    this.invulnerable = false;
    this.combo = 0;
    this.comboMultiplier = 1;
    this.player = new Player(this.width / 2, this.height - 50);
    this.bullets = [];
    this.enemies = [];
    this.powerUps = [];
    this.particles = [];
    this.waveController = new WaveController(this);
    this.starfield = this.generateStarfield();
    
    this.gameStartTime = Date.now();
    this.enemiesKilled = 0;
    this.showLeaderboard = false;
    this.nameInput = '';
    this.isNewHighScore = false;
  }
  
  gameLoop(currentTime) {
    const deltaTime = currentTime - this.lastTime;
    this.lastTime = currentTime;
    
    this.update(deltaTime);
    this.render();
    
    requestAnimationFrame((time) => this.gameLoop(time));
  }
  
  start() {
    this.gameLoop(0);
  }
}

class Player {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 20;
    this.height = 20;
    this.speed = 300;
  }
  
  update(dx, dy, deltaTime, canvasWidth, canvasHeight) {
    this.x += dx * this.speed * (deltaTime / 1000);
    this.y += dy * this.speed * (deltaTime / 1000);
    
    this.x = Math.max(0, Math.min(canvasWidth - this.width, this.x));
    this.y = Math.max(0, Math.min(canvasHeight - this.height, this.y));
  }
  
  render(ctx) {
    ctx.fillStyle = '#00aaff';
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(this.x + 8, this.y - 5, 4, 8);
  }
}

class Bullet {
  constructor(x, y, vx, vy, owner) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.width = 4;
    this.height = 8;
    this.owner = owner;
  }
  
  update(deltaTime) {
    this.x += this.vx * (deltaTime / 1000);
    this.y += this.vy * (deltaTime / 1000);
  }
  
  render(ctx) {
    ctx.fillStyle = this.owner === 'player' ? '#ffff00' : '#ff0000';
    ctx.fillRect(this.x, this.y, this.width, this.height);
  }
}

class Enemy {
  constructor(x, y, type) {
    this.x = x;
    this.y = y;
    this.type = type;
    this.time = 0;
    
    switch (type) {
      case 'grunt':
        this.width = 15;
        this.height = 15;
        this.speed = 100;
        this.hp = 1;
        this.scoreValue = 10;
        this.color = '#ff4444';
        break;
      case 'zigzag':
        this.width = 12;
        this.height = 12;
        this.speed = 80;
        this.hp = 1;
        this.scoreValue = 15;
        this.color = '#ff8844';
        break;
      case 'tank':
        this.width = 25;
        this.height = 20;
        this.speed = 50;
        this.hp = 3;
        this.scoreValue = 25;
        this.color = '#ff0000';
        break;
      case 'kamikaze':
        this.width = 10;
        this.height = 10;
        this.speed = 120;
        this.hp = 1;
        this.scoreValue = 20;
        this.color = '#ff00ff';
        break;
      case 'bruiser':
        this.width = 35;
        this.height = 30;
        this.speed = 40;
        this.hp = 8;
        this.scoreValue = 50;
        this.color = '#8b0000';
        this.armor = true;
        break;
      case 'juggernaut':
        this.width = 45;
        this.height = 35;
        this.speed = 25;
        this.hp = 15;
        this.scoreValue = 100;
        this.color = '#4b0000';
        this.armor = true;
        this.maxHp = 15;
        break;
      case 'regenerator':
        this.width = 20;
        this.height = 20;
        this.speed = 60;
        this.hp = 5;
        this.scoreValue = 75;
        this.color = '#00aa00';
        this.maxHp = 5;
        this.lastRegen = 0;
        this.regenRate = 2000;
        break;
      case 'splitter':
        this.width = 30;
        this.height = 25;
        this.speed = 45;
        this.hp = 6;
        this.scoreValue = 60;
        this.color = '#aa00aa';
        this.canSplit = true;
        break;
      case 'ghost':
        this.width = 18;
        this.height = 18;
        this.speed = 90;
        this.hp = 3;
        this.scoreValue = 40;
        this.color = '#666666';
        this.phaseTime = 0;
        this.isPhased = false;
        break;
      case 'fortress':
        this.width = 50;
        this.height = 40;
        this.speed = 15;
        this.hp = 25;
        this.scoreValue = 200;
        this.color = '#333333';
        this.armor = true;
        this.maxHp = 25;
        this.shieldHp = 10;
        this.maxShieldHp = 10;
        this.shieldRegenTime = 0;
        break;
      case 'viper':
        this.width = 15;
        this.height = 15;
        this.speed = 150;
        this.hp = 1;
        this.scoreValue = 30;
        this.color = '#ffaa00';
        this.dashTime = 0;
        this.isDashing = false;
        break;
      case 'titan':
        this.width = 60;
        this.height = 50;
        this.speed = 10;
        this.hp = 40;
        this.scoreValue = 500;
        this.color = '#1a1a1a';
        this.armor = true;
        this.maxHp = 40;
        this.shieldHp = 20;
        this.maxShieldHp = 20;
        this.shieldRegenTime = 0;
        this.attackTime = 0;
        break;
      case 'phantom':
        this.width = 25;
        this.height = 25;
        this.speed = 70;
        this.hp = 10;
        this.scoreValue = 150;
        this.color = '#330066';
        this.phaseTime = 0;
        this.isPhased = true;
        this.teleportTime = 0;
        this.maxHp = 10;
        break;
      case 'destroyer':
        this.width = 40;
        this.height = 35;
        this.speed = 30;
        this.hp = 20;
        this.scoreValue = 300;
        this.color = '#660000';
        this.armor = true;
        this.maxHp = 20;
        this.canSplit = true;
        this.regenTime = 0;
        break;
      default:
        this.width = 15;
        this.height = 15;
        this.speed = 100;
        this.hp = 1;
        this.scoreValue = 10;
        this.color = '#ff4444';
        break;
    }
  }
  
  update(deltaTime, player) {
    this.time += deltaTime;
    const dt = deltaTime / 1000;
    
    switch (this.type) {
      case 'grunt':
        this.y += this.speed * dt;
        break;
      case 'zigzag':
        this.y += this.speed * dt;
        this.x += Math.sin(this.time * 0.003) * 100 * dt;
        break;
      case 'tank':
        this.y += this.speed * dt;
        break;
      case 'kamikaze':
        const dx = player.x - this.x;
        const dy = player.y - this.y;
        const dist = Math.sqrt(dx * dx + dy * dy);
        if (dist < 150) {
          this.x += (dx / dist) * this.speed * 1.5 * dt;
          this.y += (dy / dist) * this.speed * 1.5 * dt;
        } else {
          this.y += this.speed * dt;
        }
        break;
      case 'bruiser':
        this.y += this.speed * dt;
        if (this.time > 2000) {
          this.x += Math.sin(this.time * 0.002) * 80 * dt;
        }
        break;
      case 'juggernaut':
        this.y += this.speed * dt;
        if (this.time > 1500 && this.time % 3000 < 500) {
          this.speed = 60;
        } else {
          this.speed = 25;
        }
        break;
      case 'regenerator':
        this.y += this.speed * dt;
        this.x += Math.sin(this.time * 0.004) * 50 * dt;
        
        if (this.hp < this.maxHp && Date.now() - this.lastRegen > this.regenRate) {
          this.hp = Math.min(this.maxHp, this.hp + 1);
          this.lastRegen = Date.now();
        }
        break;
      case 'splitter':
        this.y += this.speed * dt;
        this.x += Math.cos(this.time * 0.003) * 40 * dt;
        break;
      case 'ghost':
        this.phaseTime += deltaTime;
        
        if (this.phaseTime > 3000) {
          this.isPhased = !this.isPhased;
          this.phaseTime = 0;
        }
        
        this.y += this.speed * dt;
        this.x += Math.sin(this.time * 0.008) * 120 * dt;
        break;
      case 'fortress':
        this.y += this.speed * dt;
        
        if (this.shieldHp < this.maxShieldHp) {
          this.shieldRegenTime += deltaTime;
          if (this.shieldRegenTime > 5000) {
            this.shieldHp = Math.min(this.maxShieldHp, this.shieldHp + 1);
            this.shieldRegenTime = 0;
          }
        }
        break;
      case 'viper':
        this.dashTime += deltaTime;
        
        if (!this.isDashing && this.dashTime > 2000) {
          this.isDashing = true;
          this.dashTime = 0;
          this.speed = 300;
        } else if (this.isDashing && this.dashTime > 500) {
          this.isDashing = false;
          this.dashTime = 0;
          this.speed = 150;
        }
        
        if (this.isDashing) {
          const dx = player.x - this.x;
          const dy = player.y - this.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist > 0) {
            this.x += (dx / dist) * this.speed * dt;
            this.y += (dy / dist) * this.speed * dt;
          }
        } else {
          this.y += this.speed * dt;
        }
        break;
      case 'titan':
        this.y += this.speed * dt;
        this.attackTime += deltaTime;
        
        if (this.shieldHp < this.maxShieldHp) {
          this.shieldRegenTime += deltaTime;
          if (this.shieldRegenTime > 3000) {
            this.shieldHp = Math.min(this.maxShieldHp, this.shieldHp + 2);
            this.shieldRegenTime = 0;
          }
        }
        break;
      case 'phantom':
        this.phaseTime += deltaTime;
        this.teleportTime += deltaTime;
        
        if (this.phaseTime > 2000) {
          this.isPhased = !this.isPhased;
          this.phaseTime = 0;
        }
        
        if (this.teleportTime > 4000) {
          this.x = Math.random() * 700;
          this.teleportTime = 0;
        }
        
        this.y += this.speed * dt;
        this.x += Math.sin(this.time * 0.01) * 200 * dt;
        break;
      case 'destroyer':
        this.y += this.speed * dt;
        this.regenTime += deltaTime;
        
        if (this.hp < this.maxHp && this.regenTime > 3000) {
          this.hp = Math.min(this.maxHp, this.hp + 2);
          this.regenTime = 0;
        }
        
        this.x += Math.cos(this.time * 0.002) * 60 * dt;
        break;
      default:
        this.y += this.speed * dt;
        break;
    }
  }
  
  render(ctx) {
    // Ghost phasing effect
    if (this.type === 'ghost' && this.isPhased) {
      ctx.globalAlpha = 0.3;
    }
    
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    // Special enemy effects
    switch (this.type) {
      case 'regenerator':
        // Pulsing green glow
        const pulse = Math.sin(Date.now() * 0.01) * 0.3 + 0.7;
        ctx.shadowColor = '#00ff00';
        ctx.shadowBlur = 10 * pulse;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
        
        // Health bar
        const healthPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 6, this.width, 3);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 6, this.width * healthPercent, 3);
        break;
        
      case 'splitter':
        // Purple outline
        ctx.strokeStyle = '#ff00ff';
        ctx.lineWidth = 1;
        ctx.strokeRect(this.x, this.y, this.width, this.height);
        break;
        
      case 'fortress':
        // Shield system
        if (this.shieldHp > 0) {
          ctx.strokeStyle = '#00aaff';
          ctx.lineWidth = 3;
          ctx.strokeRect(this.x - 2, this.y - 2, this.width + 4, this.height + 4);
          
          // Shield bar
          const shieldPercent = this.shieldHp / this.maxShieldHp;
          ctx.fillStyle = '#0066ff';
          ctx.fillRect(this.x, this.y - 12, this.width, 3);
          ctx.fillStyle = '#00aaff';
          ctx.fillRect(this.x, this.y - 12, this.width * shieldPercent, 3);
        }
        
        // Health bar
        const fortressHpPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 8, this.width, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 8, this.width * fortressHpPercent, 4);
        break;
        
      case 'viper':
        if (this.isDashing) {
          // Trail effect when dashing
          ctx.shadowColor = '#ffaa00';
          ctx.shadowBlur = 15;
          ctx.fillStyle = '#ffff00';
          ctx.fillRect(this.x, this.y, this.width, this.height);
          ctx.shadowBlur = 0;
        }
        break;
        
      case 'titan':
        // Massive shield and health system
        if (this.shieldHp > 0) {
          ctx.strokeStyle = '#00aaff';
          ctx.lineWidth = 4;
          ctx.strokeRect(this.x - 3, this.y - 3, this.width + 6, this.height + 6);
          
          const shieldPercent = this.shieldHp / this.maxShieldHp;
          ctx.fillStyle = '#0066ff';
          ctx.fillRect(this.x, this.y - 16, this.width, 4);
          ctx.fillStyle = '#00aaff';
          ctx.fillRect(this.x, this.y - 16, this.width * shieldPercent, 4);
        }
        
        const titanHpPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 10, this.width, 6);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 10, this.width * titanHpPercent, 6);
        
        // Menacing glow
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 20;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
        break;
        
      case 'phantom':
        // Teleport effect
        ctx.shadowColor = '#6600ff';
        ctx.shadowBlur = 15;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
        
        // Health bar
        const phantomHpPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 8, this.width, 3);
        ctx.fillStyle = '#6600ff';
        ctx.fillRect(this.x, this.y - 8, this.width * phantomHpPercent, 3);
        break;
        
      case 'destroyer':
        // Destroyer aura
        const destroyerPulse = Math.sin(Date.now() * 0.008) * 0.5 + 0.5;
        ctx.shadowColor = '#ff0000';
        ctx.shadowBlur = 15 * destroyerPulse;
        ctx.fillStyle = this.color;
        ctx.fillRect(this.x, this.y, this.width, this.height);
        ctx.shadowBlur = 0;
        
        const destroyerHpPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 8, this.width, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 8, this.width * destroyerHpPercent, 4);
        break;
      default:
        break;
    }
    
    if (this.armor && this.type !== 'fortress') {
      ctx.strokeStyle = '#ffffff';
      ctx.lineWidth = 2;
      ctx.strokeRect(this.x + 2, this.y + 2, this.width - 4, this.height - 4);
      
      if (this.type === 'juggernaut') {
        const healthPercent = this.hp / this.maxHp;
        ctx.fillStyle = '#ff0000';
        ctx.fillRect(this.x, this.y - 8, this.width, 4);
        ctx.fillStyle = '#00ff00';
        ctx.fillRect(this.x, this.y - 8, this.width * healthPercent, 4);
      }
    }
    
    if (this.hp > 1) {
      ctx.fillStyle = '#ffffff';
      ctx.font = this.armor ? '12px Arial' : '10px Arial';
      const textX = this.x + (this.width / 2) - 5;
      const textY = this.armor || this.type === 'fortress' ? this.y + (this.height / 2) + 4 : this.y - 2;
      ctx.fillText(this.hp, textX, textY);
    }
    
    if (this.armor && this.type !== 'fortress') {
      ctx.fillStyle = '#ffaa00';
      ctx.font = '8px Arial';
      ctx.fillText('⚡', this.x + this.width - 10, this.y + 10);
    }
    
    ctx.globalAlpha = 1;
  }
}

class PowerUp {
  constructor(x, y) {
    this.x = x;
    this.y = y;
    this.width = 16;
    this.height = 16;
    this.speed = 80;
    this.time = 0;
    
    const types = ['rapidFire', 'shield'];
    this.type = types[Math.floor(Math.random() * types.length)];
    
    this.color = this.type === 'rapidFire' ? '#00ff00' : '#0088ff';
  }
  
  update(deltaTime) {
    this.time += deltaTime;
    this.y += this.speed * (deltaTime / 1000);
    this.x += Math.sin(this.time * 0.005) * 30 * (deltaTime / 1000);
  }
  
  render(ctx) {
    ctx.fillStyle = this.color;
    ctx.fillRect(this.x, this.y, this.width, this.height);
    
    ctx.fillStyle = '#ffffff';
    ctx.font = '8px Arial';
    const text = this.type === 'rapidFire' ? 'R' : 'S';
    ctx.fillText(text, this.x + 6, this.y + 10);
  }
}

class Particle {
  constructor(x, y, vx, vy, color = '#ffff00', maxLife = 500) {
    this.x = x;
    this.y = y;
    this.vx = vx;
    this.vy = vy;
    this.life = maxLife;
    this.maxLife = maxLife;
    this.color = color;
  }
  
  update(deltaTime) {
    this.x += this.vx * (deltaTime / 1000);
    this.y += this.vy * (deltaTime / 1000);
    this.life -= deltaTime;
  }
  
  render(ctx) {
    const alpha = this.life / this.maxLife;
    const r = parseInt(this.color.slice(1, 3), 16);
    const g = parseInt(this.color.slice(3, 5), 16);
    const b = parseInt(this.color.slice(5, 7), 16);
    ctx.fillStyle = `rgba(${r}, ${g}, ${b}, ${alpha})`;
    ctx.fillRect(this.x, this.y, 2, 2);
  }
}

class WaveController {
  constructor(game) {
    this.game = game;
    this.waveTime = 0;
    this.lastSpawn = 0;
    this.spawnRate = 1000;
    this.threatLevel = 1;
  }
  
  update(deltaTime) {
    this.waveTime += deltaTime;
    
    this.threatLevel = 1 + Math.floor(this.waveTime / 30000);
    this.spawnRate = Math.max(300, 1000 - (this.threatLevel * 50));
    
    if (Date.now() - this.lastSpawn > this.spawnRate) {
      this.spawnEnemy();
      this.lastSpawn = Date.now();
    }
  }
  
  spawnEnemy() {
    const x = Math.random() * (this.game.width - 70);
    let type = 'grunt';
    
    const roll = Math.random();
    
    // Elite enemies (highest waves)
    if (this.threatLevel >= 8 && roll < 0.005) {
      type = 'titan';
    } else if (this.threatLevel >= 7 && roll < 0.01) {
      type = 'destroyer';
    } else if (this.threatLevel >= 6 && roll < 0.015) {
      type = 'phantom';
    
    // Advanced enemies (mid-high waves)
    } else if (this.threatLevel >= 5 && roll < 0.03) {
      type = 'fortress';
    } else if (this.threatLevel >= 4 && roll < 0.05) {
      type = 'regenerator';
    } else if (this.threatLevel >= 4 && roll < 0.08) {
      type = 'viper';
    } else if (this.threatLevel >= 3 && roll < 0.06) {
      type = 'splitter';
    } else if (this.threatLevel >= 3 && roll < 0.08) {
      type = 'ghost';
    
    // Basic buff enemies (early-mid waves)
    } else if (this.threatLevel >= 2 && roll < 0.06) {
      type = 'bruiser';
    } else if (this.threatLevel >= 4 && roll < 0.03) {
      type = 'juggernaut';
    
    // Standard enemies
    } else if (this.threatLevel >= 2 && roll < 0.4) {
      type = 'zigzag';
    } else if (this.threatLevel >= 3 && roll < 0.2) {
      type = 'tank';
    } else if (this.threatLevel >= 4 && roll < 0.3) {
      type = 'kamikaze';
    }
    
    const enemy = new Enemy(x, -20, type);
    if (enemy.width > 30) {
      enemy.x = Math.random() * (this.game.width - enemy.width);
    }
    
    if (enemy.armor || enemy.type === 'titan' || enemy.type === 'phantom' || enemy.type === 'destroyer') {
      this.game.audio.createBeep(150, 0.3, 'triangle');
      setTimeout(() => this.game.audio.createBeep(200, 0.2, 'triangle'), 200);
      
      if (enemy.type === 'titan') {
        setTimeout(() => this.game.audio.createBeep(100, 0.4, 'sawtooth'), 400);
      }
    }
    
    this.game.enemies.push(enemy);
  }
}

export default Game;