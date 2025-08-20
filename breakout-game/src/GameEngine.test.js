import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ball, Paddle, Brick, GameEngine } from './GameEngine';

describe('Ball', () => {
  let ball;

  beforeEach(() => {
    ball = new Ball(100, 100, 8, 5);
  });

  it('should initialize with correct properties', () => {
    expect(ball.x).toBe(100);
    expect(ball.y).toBe(100);
    expect(ball.radius).toBe(8);
    expect(ball.speed).toBe(5);
    expect(Math.abs(ball.dx)).toBe(5);
    expect(ball.dy).toBe(-5);
  });

  it('should update position correctly', () => {
    const initialX = ball.x;
    const initialY = ball.y;
    const dx = ball.dx;
    const dy = ball.dy;
    
    ball.update();
    
    expect(ball.x).toBe(initialX + dx);
    expect(ball.y).toBe(initialY + dy);
  });

  it('should reverse X direction', () => {
    const initialDx = ball.dx;
    ball.reverseX();
    expect(ball.dx).toBe(-initialDx);
  });

  it('should reverse Y direction', () => {
    const initialDy = ball.dy;
    ball.reverseY();
    expect(ball.dy).toBe(-initialDy);
  });

  it('should set direction correctly', () => {
    ball.setDirection(3, -4);
    expect(ball.dx).toBe(3);
    expect(ball.dy).toBe(-4);
  });

  it('should increase speed correctly', () => {
    const initialSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    ball.increaseSpeed(1.1);
    const newSpeed = Math.sqrt(ball.dx * ball.dx + ball.dy * ball.dy);
    expect(newSpeed).toBeCloseTo(initialSpeed * 1.1, 1);
  });

  it('should not exceed max speed', () => {
    ball.dx = 7;
    ball.dy = -7;
    ball.increaseSpeed(2);
    expect(Math.abs(ball.dx)).toBeLessThanOrEqual(ball.maxSpeed);
    expect(Math.abs(ball.dy)).toBeLessThanOrEqual(ball.maxSpeed);
  });

  it('should reset to initial position and speed', () => {
    ball.update();
    ball.reverseX();
    ball.reset(200, 200);
    
    expect(ball.x).toBe(200);
    expect(ball.y).toBe(200);
    expect(Math.abs(ball.dx)).toBe(ball.speed);
    expect(ball.dy).toBe(-ball.speed);
  });
});

describe('Paddle', () => {
  let paddle;

  beforeEach(() => {
    paddle = new Paddle(100, 500, 100, 15, 8);
    paddle.setBounds(0, 800);
  });

  it('should initialize with correct properties', () => {
    expect(paddle.x).toBe(100);
    expect(paddle.y).toBe(500);
    expect(paddle.width).toBe(100);
    expect(paddle.height).toBe(15);
    expect(paddle.speed).toBe(8);
  });

  it('should set bounds correctly', () => {
    paddle.setBounds(10, 600);
    expect(paddle.minX).toBe(10);
    expect(paddle.maxX).toBe(500); // 600 - 100 (width)
  });

  it('should move left within bounds', () => {
    paddle.x = 50;
    paddle.moveLeft();
    expect(paddle.x).toBe(42);
    
    paddle.x = 5;
    paddle.moveLeft();
    expect(paddle.x).toBe(0); // Should not go below minX
  });

  it('should move right within bounds', () => {
    paddle.x = 600;
    paddle.moveRight();
    expect(paddle.x).toBe(608);
    
    paddle.x = 695;
    paddle.moveRight();
    expect(paddle.x).toBe(700); // Should not exceed maxX
  });

  it('should move to specific position within bounds', () => {
    paddle.moveTo(400);
    expect(paddle.x).toBe(350); // 400 - 50 (half width)
    
    paddle.moveTo(50);
    expect(paddle.x).toBe(0); // Should respect minX
    
    paddle.moveTo(900);
    expect(paddle.x).toBe(700); // Should respect maxX
  });

  it('should calculate center X correctly', () => {
    paddle.x = 100;
    expect(paddle.getCenterX()).toBe(150);
  });

  it('should detect if point is contained', () => {
    paddle.x = 100;
    paddle.y = 500;
    
    expect(paddle.contains(150, 510)).toBe(true);
    expect(paddle.contains(50, 510)).toBe(false);
    expect(paddle.contains(250, 510)).toBe(false);
    expect(paddle.contains(150, 450)).toBe(false);
  });
});

describe('Brick', () => {
  let brick;

  beforeEach(() => {
    brick = new Brick(100, 100, 75, 20, 100, '#FF6B6B');
  });

  it('should initialize with correct properties', () => {
    expect(brick.x).toBe(100);
    expect(brick.y).toBe(100);
    expect(brick.width).toBe(75);
    expect(brick.height).toBe(20);
    expect(brick.points).toBe(100);
    expect(brick.color).toBe('#FF6B6B');
    expect(brick.destroyed).toBe(false);
  });

  it('should be destroyed when hit and return points', () => {
    const points = brick.hit();
    expect(brick.destroyed).toBe(true);
    expect(points).toBe(100);
  });

  it('should detect if point is contained when not destroyed', () => {
    expect(brick.contains(120, 110)).toBe(true);
    expect(brick.contains(50, 110)).toBe(false);
    expect(brick.contains(200, 110)).toBe(false);
    
    brick.hit();
    expect(brick.contains(120, 110)).toBe(false); // Should not contain when destroyed
  });

  it('should detect intersection with ball', () => {
    const ball = new Ball(120, 110, 5);
    expect(brick.intersects(ball)).toBe(true);
    
    const farBall = new Ball(300, 300, 5);
    expect(brick.intersects(farBall)).toBe(false);
    
    brick.hit();
    expect(brick.intersects(ball)).toBe(false); // Should not intersect when destroyed
  });

  it('should handle edge case intersections', () => {
    const ball = new Ball(175, 110, 5); // Ball at right edge
    expect(brick.intersects(ball)).toBe(true);
    
    const ball2 = new Ball(120, 120, 5); // Ball at bottom edge
    expect(brick.intersects(ball2)).toBe(true);
    
    const ball3 = new Ball(180, 110, 5); // Ball just outside right edge
    expect(brick.intersects(ball3)).toBe(false);
  });
});

describe('GameEngine', () => {
  let canvas;
  let gameEngine;

  beforeEach(() => {
    // Mock canvas and context
    canvas = {
      width: 800,
      height: 600,
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn()
      })),
      addEventListener: vi.fn()
    };

    // Mock DOM methods
    global.document = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    global.requestAnimationFrame = vi.fn();
    global.cancelAnimationFrame = vi.fn();

    gameEngine = new GameEngine(canvas);
  });

  afterEach(() => {
    if (gameEngine) {
      gameEngine.destroy();
    }
  });

  it('should initialize with correct properties', () => {
    expect(gameEngine.width).toBe(800);
    expect(gameEngine.height).toBe(600);
    expect(gameEngine.gameState.score).toBe(0);
    expect(gameEngine.gameState.lives).toBe(3);
    expect(gameEngine.gameState.level).toBe(1);
    expect(gameEngine.gameState.isRunning).toBe(false);
    expect(gameEngine.gameState.gameOver).toBe(false);
    expect(gameEngine.gameState.victory).toBe(false);
  });

  it('should initialize ball at correct position', () => {
    expect(gameEngine.ball.x).toBe(400); // width / 2
    expect(gameEngine.ball.y).toBe(500); // height - 100
  });

  it('should initialize paddle at correct position', () => {
    expect(gameEngine.paddle.x).toBe(350); // (width / 2) - 50
    expect(gameEngine.paddle.y).toBe(570); // height - 30
  });

  it('should initialize bricks correctly', () => {
    expect(gameEngine.bricks.length).toBeGreaterThan(0);
    expect(gameEngine.bricks.every(brick => !brick.destroyed)).toBe(true);
    
    // Check that bricks have different colors and points
    const colors = [...new Set(gameEngine.bricks.map(brick => brick.color))];
    expect(colors.length).toBeGreaterThan(1);
  });

  it('should start game correctly', () => {
    gameEngine.start();
    expect(gameEngine.gameState.isRunning).toBe(true);
    expect(gameEngine.gameState.gameOver).toBe(false);
    expect(gameEngine.gameState.victory).toBe(false);
    expect(gameEngine.gameState.paused).toBe(false);
  });

  it('should stop game correctly', () => {
    gameEngine.start();
    gameEngine.stop();
    expect(gameEngine.gameState.isRunning).toBe(false);
  });

  it('should toggle pause correctly', () => {
    gameEngine.start();
    
    gameEngine.togglePause();
    expect(gameEngine.gameState.paused).toBe(true);
    
    gameEngine.togglePause();
    expect(gameEngine.gameState.paused).toBe(false);
  });

  it('should not pause when game is not running', () => {
    gameEngine.togglePause();
    expect(gameEngine.gameState.paused).toBe(false);
  });

  it('should reset game state correctly', () => {
    gameEngine.gameState.score = 1000;
    gameEngine.gameState.lives = 1;
    gameEngine.gameState.gameOver = true;
    gameEngine.ball.x = 200;
    
    gameEngine.reset();
    
    expect(gameEngine.gameState.score).toBe(0);
    expect(gameEngine.gameState.lives).toBe(3);
    expect(gameEngine.gameState.gameOver).toBe(false);
    expect(gameEngine.ball.x).toBe(400);
  });

  it('should handle ball-wall collisions', () => {
    gameEngine.ball.x = 5;
    gameEngine.ball.dx = -3;
    
    gameEngine.checkCollisions();
    expect(gameEngine.ball.dx).toBe(3); // Should reverse
    
    gameEngine.ball.x = 795;
    gameEngine.ball.dx = 3;
    
    gameEngine.checkCollisions();
    expect(gameEngine.ball.dx).toBe(-3); // Should reverse
    
    gameEngine.ball.y = 5;
    gameEngine.ball.dy = -3;
    
    gameEngine.checkCollisions();
    expect(gameEngine.ball.dy).toBe(3); // Should reverse
  });

  it('should handle ball-paddle collision', () => {
    gameEngine.ball.x = 400;
    gameEngine.ball.y = 570;
    gameEngine.ball.dy = 3;
    gameEngine.paddle.x = 350;
    
    gameEngine.checkCollisions();
    expect(gameEngine.ball.dy).toBeLessThan(0); // Should reverse Y direction
  });

  it('should handle ball-brick collision', () => {
    const initialScore = gameEngine.gameState.score;
    const brick = gameEngine.bricks[0];
    
    gameEngine.ball.x = brick.x + brick.width / 2;
    gameEngine.ball.y = brick.y + brick.height / 2;
    
    gameEngine.checkCollisions();
    
    expect(brick.destroyed).toBe(true);
    expect(gameEngine.gameState.score).toBe(initialScore + brick.points);
  });

  it('should decrease lives when ball goes out of bounds', () => {
    const initialLives = gameEngine.gameState.lives;
    gameEngine.ball.y = 700; // Below canvas
    
    gameEngine.checkCollisions();
    
    expect(gameEngine.gameState.lives).toBe(initialLives - 1);
  });

  it('should trigger game over when lives reach zero', () => {
    gameEngine.gameState.lives = 1;
    gameEngine.ball.y = 700;
    
    gameEngine.checkCollisions();
    
    expect(gameEngine.gameState.gameOver).toBe(true);
    expect(gameEngine.gameState.isRunning).toBe(false);
  });

  it('should trigger victory when all bricks are destroyed', () => {
    gameEngine.bricks.forEach(brick => brick.hit());
    
    gameEngine.checkCollisions();
    
    expect(gameEngine.gameState.victory).toBe(true);
    expect(gameEngine.gameState.isRunning).toBe(false);
  });

  it('should reset ball position correctly', () => {
    gameEngine.ball.x = 200;
    gameEngine.ball.y = 300;
    
    gameEngine.resetBall();
    
    expect(gameEngine.ball.x).toBe(400);
    expect(gameEngine.ball.y).toBe(500);
  });

  it('should handle key input for paddle movement', () => {
    gameEngine.keys['ArrowLeft'] = true;
    const initialX = gameEngine.paddle.x;
    
    gameEngine.handleInput();
    expect(gameEngine.paddle.x).toBeLessThan(initialX);
    
    gameEngine.keys['ArrowLeft'] = false;
    gameEngine.keys['ArrowRight'] = true;
    const currentX = gameEngine.paddle.x;
    
    gameEngine.handleInput();
    expect(gameEngine.paddle.x).toBeGreaterThan(currentX);
  });

  it('should handle alternative key input (WASD)', () => {
    gameEngine.keys['KeyA'] = true;
    const initialX = gameEngine.paddle.x;
    
    gameEngine.handleInput();
    expect(gameEngine.paddle.x).toBeLessThan(initialX);
    
    gameEngine.keys['KeyA'] = false;
    gameEngine.keys['KeyD'] = true;
    const currentX = gameEngine.paddle.x;
    
    gameEngine.handleInput();
    expect(gameEngine.paddle.x).toBeGreaterThan(currentX);
  });

  it('should not update when game is paused', () => {
    gameEngine.gameState.isRunning = true;
    gameEngine.gameState.paused = true;
    
    const initialBallX = gameEngine.ball.x;
    gameEngine.update(16);
    
    expect(gameEngine.ball.x).toBe(initialBallX); // Should not move
  });

  it('should not update when game is not running', () => {
    gameEngine.gameState.isRunning = false;
    
    const initialBallX = gameEngine.ball.x;
    gameEngine.update(16);
    
    expect(gameEngine.ball.x).toBe(initialBallX); // Should not move
  });
});