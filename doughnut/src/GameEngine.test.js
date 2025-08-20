import { describe, it, expect, beforeEach, vi } from 'vitest';
import GameEngine from './GameEngine';

describe('GameEngine', () => {
  let gameEngine;

  beforeEach(() => {
    gameEngine = new GameEngine();
    vi.clearAllMocks();
  });

  describe('Customer class', () => {
    it('should create a customer with valid properties', () => {
      const Customer = gameEngine.constructor;
      const customer = new (class extends Customer {
        constructor() {
          super();
          this.id = 1;
          this.type = 'Casual';
          this.arrivalTick = 0;
          this.order = ['Plain'];
          this.patience = 36;
          this.maxPatience = 36;
          this.orderValue = 2.50;
          this.isServed = false;
          this.hasLeft = false;
        }
      })();

      expect(customer.id).toBe(1);
      expect(customer.type).toBe('Casual');
      expect(customer.isServed).toBe(false);
      expect(customer.hasLeft).toBe(false);
    });
  });

  describe('Shop class', () => {
    let shop;

    beforeEach(() => {
      shop = gameEngine.gameState.shop;
    });

    it('should initialize with correct starting values', () => {
      expect(shop.cash).toBe(50);
      expect(shop.reputation).toBe(50);
      expect(shop.rent).toBe(25);
      expect(shop.ingredients['Dough']).toBe(20);
      expect(shop.doughnuts['Plain']).toBe(0);
    });

    it('should check if recipe can be made', () => {
      expect(shop.canMake('Plain')).toBe(true);
      expect(shop.canMake('Chocolate')).toBe(true);
      
      shop.ingredients['Dough'] = 0;
      expect(shop.canMake('Plain')).toBe(false);
    });

    it('should make doughnuts when ingredients available', () => {
      const initialDough = shop.ingredients['Dough'];
      const initialSugar = shop.ingredients['Sugar'];
      
      expect(shop.make('Plain', 2)).toBe(true);
      expect(shop.doughnuts['Plain']).toBe(2);
      expect(shop.ingredients['Dough']).toBe(initialDough - 2);
      expect(shop.ingredients['Sugar']).toBe(initialSugar - 2);
    });

    it('should not make doughnuts when ingredients insufficient', () => {
      shop.ingredients['Dough'] = 0;
      expect(shop.make('Plain')).toBe(false);
      expect(shop.doughnuts['Plain']).toBe(0);
    });

    it('should serve orders when doughnuts available', () => {
      shop.doughnuts['Plain'] = 2;
      shop.doughnuts['Chocolate'] = 1;
      
      expect(shop.canServe(['Plain', 'Chocolate'])).toBe(true);
      
      const revenue = shop.serve(['Plain', 'Chocolate']);
      expect(revenue).toBe(4.50); // 2.00 + 2.50
      expect(shop.doughnuts['Plain']).toBe(1);
      expect(shop.doughnuts['Chocolate']).toBe(0);
      expect(shop.cash).toBe(54.50);
    });

    it('should restock ingredients when cash available', () => {
      const initialCash = shop.cash;
      const initialDough = shop.ingredients['Dough'];
      
      expect(shop.restockIngredient('Dough', 10)).toBe(true);
      expect(shop.ingredients['Dough']).toBe(initialDough + 10);
      expect(shop.cash).toBe(initialCash - 5.00); // 10 * 0.50
    });

    it('should not restock when insufficient cash', () => {
      shop.cash = 1;
      expect(shop.restockIngredient('Dough', 10)).toBe(false);
    });

    it('should spoil doughnuts correctly', () => {
      shop.doughnuts['Plain'] = 10;
      shop.doughnuts['Chocolate'] = 5;
      
      const spoiled = shop.spoilDoughnuts();
      expect(spoiled).toBe(3); // 20% of 15 total
      expect(shop.doughnuts['Plain']).toBe(8); // 10 - 2
      expect(shop.doughnuts['Chocolate']).toBe(4); // 5 - 1
    });
  });

  describe('GameEngine core functionality', () => {
    it('should initialize with correct default state', () => {
      expect(gameEngine.gameState.isRunning).toBe(false);
      expect(gameEngine.gameState.currentDay).toBe(1);
      expect(gameEngine.gameState.currentTick).toBe(0);
      expect(gameEngine.gameState.customers).toEqual([]);
      expect(gameEngine.gameState.customerQueue).toEqual([]);
      expect(gameEngine.gameState.alerts).toEqual([]);
    });

    it('should start and stop game correctly', () => {
      vi.useFakeTimers();
      
      gameEngine.start();
      expect(gameEngine.gameState.isRunning).toBe(true);
      expect(gameEngine.gameLoop).toBeTruthy();
      
      gameEngine.stop();
      expect(gameEngine.gameState.isRunning).toBe(false);
      expect(gameEngine.gameLoop).toBeNull();
      
      vi.useRealTimers();
    });

    it('should make doughnuts and update stats', () => {
      const result = gameEngine.makeDoughnut('Plain', 2);
      expect(result).toBe(true);
      expect(gameEngine.gameState.shop.doughnuts['Plain']).toBe(2);
      expect(gameEngine.gameState.stats.totalDoughnutsMade).toBe(2);
      expect(gameEngine.gameState.alerts.length).toBe(1);
    });

    it('should restock ingredients and update stats', () => {
      const result = gameEngine.restockIngredient('Dough', 5);
      expect(result).toBe(true);
      expect(gameEngine.gameState.shop.ingredients['Dough']).toBe(25);
      expect(gameEngine.gameState.stats.totalIngredientsBought).toBe(5);
    });

    it('should set prices within valid range', () => {
      gameEngine.setPrice('Plain', 15.00);
      expect(gameEngine.gameState.shop.prices['Plain']).toBe(10.00);
      
      gameEngine.setPrice('Plain', 0.50);
      expect(gameEngine.gameState.shop.prices['Plain']).toBe(1.00);
      
      gameEngine.setPrice('Plain', 5.00);
      expect(gameEngine.gameState.shop.prices['Plain']).toBe(5.00);
    });

    it('should add alerts correctly', () => {
      gameEngine.addAlert('Test message', 'info');
      
      expect(gameEngine.gameState.alerts.length).toBe(1);
      expect(gameEngine.gameState.alerts[0].message).toBe('Test message');
      expect(gameEngine.gameState.alerts[0].type).toBe('info');
      expect(gameEngine.gameState.alerts[0].timestamp).toBeTruthy();
    });

    it('should limit alerts to 10 items', () => {
      for (let i = 0; i < 15; i++) {
        gameEngine.addAlert(`Message ${i}`, 'info');
      }
      
      expect(gameEngine.gameState.alerts.length).toBe(10);
      expect(gameEngine.gameState.alerts[0].message).toBe('Message 14');
    });

    it('should reset game state correctly', () => {
      gameEngine.gameState.currentDay = 5;
      gameEngine.gameState.shop.cash = 100;
      gameEngine.addAlert('Test alert', 'info');
      
      gameEngine.resetGame();
      
      expect(gameEngine.gameState.currentDay).toBe(1);
      expect(gameEngine.gameState.shop.cash).toBe(50);
      expect(gameEngine.gameState.alerts.length).toBe(0);
      expect(gameEngine.gameState.isRunning).toBe(false);
    });
  });

  describe('Game progression', () => {
    it('should end day correctly', () => {
      gameEngine.gameState.currentTick = 60;
      gameEngine.gameState.shop.cash = 100;
      
      gameEngine.endDay();
      
      expect(gameEngine.gameState.currentDay).toBe(2);
      expect(gameEngine.gameState.currentTick).toBe(0);
      expect(gameEngine.gameState.shop.cash).toBe(75); // 100 - 25 rent
    });

    it('should check game end conditions', () => {
      gameEngine.gameState.shop.cash = -10;
      gameEngine.checkGameEnd();
      expect(gameEngine.gameState.isRunning).toBe(false);
      
      gameEngine.resetGame();
      gameEngine.gameState.shop.cash = 250;
      gameEngine.checkGameEnd();
      expect(gameEngine.gameState.isRunning).toBe(false);
      
      gameEngine.resetGame();
      gameEngine.gameState.currentDay = 8;
      gameEngine.checkGameEnd();
      expect(gameEngine.gameState.isRunning).toBe(false);
    });
  });

  describe('Save/Load functionality', () => {
    beforeEach(() => {
      localStorage.clear();
    });

    it('should save game state to localStorage', () => {
      gameEngine.gameState.currentDay = 3;
      gameEngine.gameState.shop.cash = 75;
      
      const result = gameEngine.saveGame();
      expect(result).toBe(true);
      
      const saved = localStorage.getItem('doughnutDashSave');
      expect(saved).toBeTruthy();
      
      const parsed = JSON.parse(saved);
      expect(parsed.currentDay).toBe(3);
      expect(parsed.shop.cash).toBe(75);
    });

    it('should load game state from localStorage', () => {
      const testState = {
        currentDay: 5,
        shop: { cash: 120, reputation: 75 }
      };
      
      localStorage.setItem('doughnutDashSave', JSON.stringify(testState));
      
      const result = gameEngine.loadGame();
      expect(result).toBe(true);
      expect(gameEngine.gameState.currentDay).toBe(5);
      expect(gameEngine.gameState.shop.cash).toBe(120);
      expect(gameEngine.gameState.shop.reputation).toBe(75);
    });

    it('should handle missing save data', () => {
      const result = gameEngine.loadGame();
      expect(result).toBe(false);
    });
  });
});