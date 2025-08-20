import { describe, it, expect, beforeEach, vi } from 'vitest';
import { Ball, Paddle, PongEngine } from './PongEngine';

describe('Ball', () => {
  let ball;

  beforeEach(() => {
    ball = new Ball(100, 100, 8, 3, 3);
  });

  it('should initialize with correct properties', () => {
    expect(ball.x).toBe(100);
    expect(ball.y).toBe(100);
    expect(ball.radius).toBe(8);
    expect(ball.speedX).toBe(3);
    expect(ball.speedY).toBe(3);
    expect(ball.initialSpeedX).toBe(3);
    expect(ball.initialSpeedY).toBe(3);
  });

  it('should update position correctly', () => {
    const initialX = ball.x;
    const initialY = ball.y;
    
    ball.update();
    
    expect(ball.x).toBe(initialX + 3);
    expect(ball.y).toBe(initialY + 3);
  });

  it('should reverse X direction', () => {
    const initialSpeedX = ball.speedX;
    ball.reverseX();
    expect(ball.speedX).toBe(-initialSpeedX);
  });

  it('should reverse Y direction', () => {
    const initialSpeedY = ball.speedY;
    ball.reverseY();
    expect(ball.speedY).toBe(-initialSpeedY);
  });

  it('should reset to position with random direction', () => {
    ball.update();
    ball.reverseX();
    
    ball.reset(200, 200);
    
    expect(ball.x).toBe(200);
    expect(ball.y).toBe(200);
    expect(Math.abs(ball.speedX)).toBe(3);
    expect(Math.abs(ball.speedY)).toBe(3);
  });

  it('should increase speed correctly', () => {
    const initialSpeedX = ball.speedX;
    const initialSpeedY = ball.speedY;
    
    ball.increaseSpeed(1.1);
    
    expect(ball.speedX).toBeCloseTo(initialSpeedX * 1.1, 2);
    expect(ball.speedY).toBeCloseTo(initialSpeedY * 1.1, 2);
  });
});

describe('Paddle', () => {
  let paddle;

  beforeEach(() => {
    paddle = new Paddle(100, 200, 15, 80, 5);
    paddle.setBounds(0, 400);
  });

  it('should initialize with correct properties', () => {
    expect(paddle.x).toBe(100);
    expect(paddle.y).toBe(200);
    expect(paddle.width).toBe(15);
    expect(paddle.height).toBe(80);
    expect(paddle.speed).toBe(5);
  });

  it('should set bounds correctly', () => {
    paddle.setBounds(10, 500);
    expect(paddle.minY).toBe(10);
    expect(paddle.maxY).toBe(420); // 500 - 80 (height)
  });

  it('should move up within bounds', () => {
    paddle.y = 50;
    paddle.moveUp();
    expect(paddle.y).toBe(45);
    
    paddle.y = 3;
    paddle.moveUp();
    expect(paddle.y).toBe(0); // Should not go below minY
  });

  it('should move down within bounds', () => {
    paddle.y = 300;
    paddle.moveDown();
    expect(paddle.y).toBe(305);
    
    paddle.y = 317;
    paddle.moveDown();
    expect(paddle.y).toBe(320); // Should not exceed maxY
  });

  it('should move to specific position within bounds', () => {
    paddle.moveTo(250);
    expect(paddle.y).toBe(210); // 250 - 40 (half height)
    
    paddle.moveTo(30);
    expect(paddle.y).toBe(0); // Should respect minY
    
    paddle.moveTo(400);
    expect(paddle.y).toBe(320); // Should respect maxY
  });

  it('should calculate center Y correctly', () => {
    paddle.y = 200;
    expect(paddle.getCenterY()).toBe(240);
  });

  it('should detect ball intersection', () => {
    const ball = new Ball(107, 240, 8); // Ball touching paddle
    expect(paddle.intersects(ball)).toBe(true);
    
    const farBall = new Ball(200, 300, 8); // Ball far away
    expect(paddle.intersects(farBall)).toBe(false);
  });
});

describe('PongEngine', () => {
  let canvas;
  let pongEngine;

  beforeEach(() => {
    // Mock canvas and context
    canvas = {
      width: 800,
      height: 400,
      getContext: vi.fn(() => ({
        clearRect: vi.fn(),
        fillRect: vi.fn(),
        strokeRect: vi.fn(),
        fillText: vi.fn(),
        beginPath: vi.fn(),
        arc: vi.fn(),
        fill: vi.fn(),
        stroke: vi.fn(),
        moveTo: vi.fn(),
        lineTo: vi.fn(),
        setLineDash: vi.fn()
      }))
    };

    // Mock DOM methods
    global.document = {
      addEventListener: vi.fn(),
      removeEventListener: vi.fn()
    };

    global.requestAnimationFrame = vi.fn();
    global.cancelAnimationFrame = vi.fn();

    pongEngine = new PongEngine(canvas);
  });

  afterEach(() => {
    if (pongEngine) {
      pongEngine.destroy();
    }
  });

  it('should initialize with correct properties', () => {
    expect(pongEngine.width).toBe(800);
    expect(pongEngine.height).toBe(400);
    expect(pongEngine.gameState.leftScore).toBe(0);
    expect(pongEngine.gameState.rightScore).toBe(0);
    expect(pongEngine.gameState.isRunning).toBe(false);
    expect(pongEngine.gameState.gameOver).toBe(false);
    expect(pongEngine.gameState.maxScore).toBe(11);
  });

  it('should initialize ball at center', () => {
    expect(pongEngine.ball.x).toBe(400); // width / 2
    expect(pongEngine.ball.y).toBe(200); // height / 2
  });

  it('should initialize paddles at correct positions', () => {
    expect(pongEngine.leftPaddle.x).toBe(30);
    expect(pongEngine.leftPaddle.y).toBe(160); // height / 2 - 40

    expect(pongEngine.rightPaddle.x).toBe(755); // width - 45
    expect(pongEngine.rightPaddle.y).toBe(160);
  });

  it('should start game correctly', () => {
    pongEngine.start();
    expect(pongEngine.gameState.isRunning).toBe(true);
    expect(pongEngine.gameState.gameOver).toBe(false);
    expect(pongEngine.gameState.winner).toBe(null);
    expect(pongEngine.gameState.paused).toBe(false);
  });

  it('should stop game correctly', () => {
    pongEngine.start();
    pongEngine.stop();
    expect(pongEngine.gameState.isRunning).toBe(false);
  });

  it('should toggle pause correctly', () => {
    pongEngine.start();
    
    pongEngine.togglePause();
    expect(pongEngine.gameState.paused).toBe(true);
    
    pongEngine.togglePause();
    expect(pongEngine.gameState.paused).toBe(false);
  });

  it('should not pause when game is not running', () => {
    pongEngine.togglePause();
    expect(pongEngine.gameState.paused).toBe(false);
  });

  it('should reset game state correctly', () => {
    pongEngine.gameState.leftScore = 5;
    pongEngine.gameState.rightScore = 3;
    pongEngine.gameState.gameOver = true;
    pongEngine.ball.x = 200;
    
    pongEngine.reset();
    
    expect(pongEngine.gameState.leftScore).toBe(0);
    expect(pongEngine.gameState.rightScore).toBe(0);
    expect(pongEngine.gameState.gameOver).toBe(false);
    expect(pongEngine.ball.x).toBe(400);
  });

  it('should handle ball-wall collisions', () => {
    pongEngine.ball.y = 5;
    pongEngine.ball.speedY = -3;
    
    pongEngine.checkCollisions();
    expect(pongEngine.ball.speedY).toBe(3); // Should reverse
    
    pongEngine.ball.y = 395;
    pongEngine.ball.speedY = 3;
    
    pongEngine.checkCollisions();
    expect(pongEngine.ball.speedY).toBe(-3); // Should reverse
  });

  it('should handle ball-paddle collision', () => {
    pongEngine.ball.x = 50;
    pongEngine.ball.y = 200;
    pongEngine.ball.speedX = -3;
    pongEngine.leftPaddle.y = 160;
    
    pongEngine.checkCollisions();
    expect(pongEngine.ball.speedX).toBeGreaterThan(0); // Should go right
  });

  it('should handle scoring', () => {
    const initialLeftScore = pongEngine.gameState.leftScore;
    pongEngine.ball.x = -10; // Ball goes off left side
    
    pongEngine.checkCollisions();
    
    expect(pongEngine.gameState.rightScore).toBe(1);
    expect(pongEngine.ball.x).toBe(400); // Ball should reset to center
  });

  it('should handle game over', () => {
    pongEngine.gameState.leftScore = 10;
    pongEngine.ball.x = 900; // Right side scores
    
    pongEngine.checkCollisions();
    
    expect(pongEngine.gameState.gameOver).toBe(true);
    expect(pongEngine.gameState.winner).toBe('left');
    expect(pongEngine.gameState.isRunning).toBe(false);
  });

  it('should handle key input for paddle movement', () => {
    pongEngine.keys['KeyW'] = true;
    const initialY = pongEngine.leftPaddle.y;
    
    pongEngine.handleInput();
    expect(pongEngine.leftPaddle.y).toBeLessThan(initialY);
    
    pongEngine.keys['KeyW'] = false;
    pongEngine.keys['ArrowDown'] = true;
    const rightInitialY = pongEngine.rightPaddle.y;
    
    pongEngine.handleInput();
    expect(pongEngine.rightPaddle.y).toBeGreaterThan(rightInitialY);
  });

  it('should not update when game is paused', () => {
    pongEngine.gameState.isRunning = true;
    pongEngine.gameState.paused = true;
    
    const initialBallX = pongEngine.ball.x;
    pongEngine.update(16);
    
    expect(pongEngine.ball.x).toBe(initialBallX); // Should not move
  });

  it('should not update when game is not running', () => {
    pongEngine.gameState.isRunning = false;
    
    const initialBallX = pongEngine.ball.x;
    pongEngine.update(16);
    
    expect(pongEngine.ball.x).toBe(initialBallX); // Should not move
  });

  it('should reset ball position correctly', () => {
    pongEngine.ball.x = 200;
    pongEngine.ball.y = 300;
    
    pongEngine.resetBall();
    
    expect(pongEngine.ball.x).toBe(400);
    expect(pongEngine.ball.y).toBe(200);
  });
});