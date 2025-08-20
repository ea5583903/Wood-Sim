// Game Engine - Core game state and logic
class GameEngine {
  constructor() {
    this.gameState = this.createInitialState();
    this.tickInterval = null;
    this.tickSpeed = 1000; // 1 second per tick
    this.isRunning = false;
  }

  createInitialState() {
    return {
      // Time
      currentTick: 0,
      currentDay: 1,
      ticksPerDay: 60,
      
      // Player state
      player: {
        cash: 1000,
        storageCap: 100,
        storageUsed: 0,
        inventory: {}, // goodId -> qty
        avgCost: {}, // goodId -> average cost per unit
        feesPercent: 0.5, // 0.5% per trade
        rentPerDay: 20,
        totalRent: 0,
        realizedPnL: 0,
        netWorth: 1000
      },
      
      // Market state
      market: {
        goods: [
          {
            id: 'wheat',
            name: 'Wheat',
            basePrice: 10,
            currentPrice: 10,
            minPrice: 5,
            maxPrice: 20,
            volatility: 0.02, // Low volatility
            meanReversion: 0.05,
            priceHistory: [],
            supplyState: 'normal'
          },
          {
            id: 'copper',
            name: 'Copper',
            basePrice: 40,
            currentPrice: 40,
            minPrice: 20,
            maxPrice: 80,
            volatility: 0.04, // Medium volatility
            meanReversion: 0.08,
            priceHistory: [],
            supplyState: 'normal'
          },
          {
            id: 'chips',
            name: 'Tech Chips',
            basePrice: 120,
            currentPrice: 120,
            minPrice: 60,
            maxPrice: 240,
            volatility: 0.06, // High volatility
            meanReversion: 0.12,
            priceHistory: [],
            supplyState: 'normal'
          }
        ],
        spreadPercent: 0.25, // 0.25% bid/ask spread
        eventsActive: []
      },
      
      // Game state
      gameStatus: 'playing', // 'playing', 'won', 'lost'
      orderHistory: [],
      dailySummary: null,
      alerts: []
    };
  }

  // Start the game loop
  start() {
    if (this.isRunning) return;
    
    this.isRunning = true;
    this.tickInterval = setInterval(() => {
      this.tick();
    }, this.tickSpeed);
  }

  // Stop the game loop
  stop() {
    this.isRunning = false;
    if (this.tickInterval) {
      clearInterval(this.tickInterval);
      this.tickInterval = null;
    }
  }

  // Main game tick
  tick() {
    this.gameState.currentTick++;
    
    // Update market prices
    this.updateMarketPrices();
    
    // Check for end of day
    if (this.gameState.currentTick % this.gameState.ticksPerDay === 0) {
      this.endOfDay();
    }
    
    // Update net worth
    this.updateNetWorth();
    
    // Check win/lose conditions
    this.checkGameEnd();
  }

  // Update all market prices
  updateMarketPrices() {
    this.gameState.market.goods.forEach(good => {
      const newPrice = this.calculateNewPrice(good);
      good.currentPrice = Math.max(good.minPrice, Math.min(good.maxPrice, newPrice));
      
      // Store price history (keep last 60 ticks for sparklines)
      good.priceHistory.push(good.currentPrice);
      if (good.priceHistory.length > 60) {
        good.priceHistory.shift();
      }
    });
  }

  // Calculate new price using mean reversion model
  calculateNewPrice(good) {
    const alpha = good.meanReversion;
    const mu = good.basePrice;
    const sigma = good.volatility;
    
    // Mean reversion: p(t+1) = p(t) + α*(μ - p(t)) + ε
    const meanReversionForce = alpha * (mu - good.currentPrice);
    const randomShock = (Math.random() - 0.5) * 2 * sigma * good.currentPrice;
    
    return good.currentPrice + meanReversionForce + randomShock;
  }

  // Calculate bid/ask prices with spread
  getBidAskPrices(goodId) {
    const good = this.gameState.market.goods.find(g => g.id === goodId);
    if (!good) return null;
    
    const spread = this.gameState.market.spreadPercent / 100;
    const bidPrice = good.currentPrice * (1 - spread);
    const askPrice = good.currentPrice * (1 + spread);
    
    return { bid: bidPrice, ask: askPrice };
  }

  // Execute buy order
  buyGood(goodId, quantity) {
    const good = this.gameState.market.goods.find(g => g.id === goodId);
    if (!good) return { success: false, message: 'Good not found' };
    
    const prices = this.getBidAskPrices(goodId);
    const totalCost = prices.ask * quantity;
    const fees = totalCost * (this.gameState.player.feesPercent / 100);
    const totalCostWithFees = totalCost + fees;
    
    // Check constraints
    if (totalCostWithFees > this.gameState.player.cash) {
      return { success: false, message: 'Insufficient cash' };
    }
    
    if (this.gameState.player.storageUsed + quantity > this.gameState.player.storageCap) {
      return { success: false, message: 'Insufficient storage' };
    }
    
    // Execute trade
    this.gameState.player.cash -= totalCostWithFees;
    this.gameState.player.storageUsed += quantity;
    
    // Update inventory and average cost
    const currentQty = this.gameState.player.inventory[goodId] || 0;
    const currentAvgCost = this.gameState.player.avgCost[goodId] || 0;
    const newQty = currentQty + quantity;
    const newAvgCost = (currentAvgCost * currentQty + totalCost) / newQty;
    
    this.gameState.player.inventory[goodId] = newQty;
    this.gameState.player.avgCost[goodId] = newAvgCost;
    
    // Record transaction
    this.addToOrderHistory('buy', goodId, quantity, prices.ask, fees);
    
    return { success: true, message: `Bought ${quantity} ${good.name}` };
  }

  // Execute sell order
  sellGood(goodId, quantity) {
    const good = this.gameState.market.goods.find(g => g.id === goodId);
    if (!good) return { success: false, message: 'Good not found' };
    
    const currentQty = this.gameState.player.inventory[goodId] || 0;
    if (quantity > currentQty) {
      return { success: false, message: 'Insufficient inventory' };
    }
    
    const prices = this.getBidAskPrices(goodId);
    const totalRevenue = prices.bid * quantity;
    const fees = totalRevenue * (this.gameState.player.feesPercent / 100);
    const totalRevenueAfterFees = totalRevenue - fees;
    
    // Execute trade
    this.gameState.player.cash += totalRevenueAfterFees;
    this.gameState.player.storageUsed -= quantity;
    this.gameState.player.inventory[goodId] -= quantity;
    
    // Calculate realized P&L
    const avgCost = this.gameState.player.avgCost[goodId] || 0;
    const realizedGain = (prices.bid - avgCost) * quantity - fees;
    this.gameState.player.realizedPnL += realizedGain;
    
    // Clean up empty inventory
    if (this.gameState.player.inventory[goodId] === 0) {
      delete this.gameState.player.inventory[goodId];
      delete this.gameState.player.avgCost[goodId];
    }
    
    // Record transaction
    this.addToOrderHistory('sell', goodId, quantity, prices.bid, fees);
    
    return { success: true, message: `Sold ${quantity} ${good.name}` };
  }

  // Add transaction to order history
  addToOrderHistory(type, goodId, quantity, price, fees) {
    const good = this.gameState.market.goods.find(g => g.id === goodId);
    const order = {
      type,
      goodName: good.name,
      quantity,
      price: price.toFixed(2),
      fees: fees.toFixed(2),
      timestamp: `Day ${this.gameState.currentDay}, Tick ${this.gameState.currentTick % this.gameState.ticksPerDay}`
    };
    
    this.gameState.orderHistory.unshift(order);
    if (this.gameState.orderHistory.length > 20) {
      this.gameState.orderHistory.pop();
    }
  }

  // End of day processing
  endOfDay() {
    this.gameState.currentDay++;
    
    // Pay rent
    this.gameState.player.cash -= this.gameState.player.rentPerDay;
    this.gameState.player.totalRent += this.gameState.player.rentPerDay;
    
    // Calculate day summary
    this.calculateDailySummary();
    
    // Check if player is bankrupt
    if (this.gameState.player.cash < 0) {
      this.gameState.gameStatus = 'lost';
      this.addAlert('Game Over: Bankrupt!', 'error');
    }
  }

  // Calculate portfolio value and net worth
  updateNetWorth() {
    let portfolioValue = 0;
    
    Object.entries(this.gameState.player.inventory).forEach(([goodId, quantity]) => {
      const good = this.gameState.market.goods.find(g => g.id === goodId);
      if (good) {
        portfolioValue += good.currentPrice * quantity;
      }
    });
    
    this.gameState.player.netWorth = this.gameState.player.cash + portfolioValue;
  }

  // Calculate daily summary
  calculateDailySummary() {
    this.gameState.dailySummary = {
      day: this.gameState.currentDay - 1,
      startingCash: this.gameState.player.cash + this.gameState.player.rentPerDay,
      endingCash: this.gameState.player.cash,
      rent: this.gameState.player.rentPerDay,
      netWorth: this.gameState.player.netWorth,
      realizedPnL: this.gameState.player.realizedPnL
    };
  }

  // Check win/lose conditions
  checkGameEnd() {
    if (this.gameState.player.netWorth >= 5000) {
      this.gameState.gameStatus = 'won';
      this.addAlert('Victory! Net worth reached $5,000!', 'success');
      this.stop();
    } else if (this.gameState.currentDay > 10 && this.gameState.player.cash < 0) {
      this.gameState.gameStatus = 'lost';
      this.addAlert('Game Over: Survived 10 days but went bankrupt!', 'error');
      this.stop();
    }
  }

  // Add alert message
  addAlert(message, type = 'info') {
    this.gameState.alerts.unshift({ message, type, timestamp: Date.now() });
    if (this.gameState.alerts.length > 5) {
      this.gameState.alerts.pop();
    }
  }

  // Get maximum buyable quantity
  getMaxBuyQuantity(goodId) {
    const good = this.gameState.market.goods.find(g => g.id === goodId);
    if (!good) return 0;
    
    const prices = this.getBidAskPrices(goodId);
    const costPerUnit = prices.ask * (1 + this.gameState.player.feesPercent / 100);
    const maxFromCash = Math.floor(this.gameState.player.cash / costPerUnit);
    const maxFromStorage = this.gameState.player.storageCap - this.gameState.player.storageUsed;
    
    return Math.min(maxFromCash, maxFromStorage);
  }

  // Get maximum sellable quantity
  getMaxSellQuantity(goodId) {
    return this.gameState.player.inventory[goodId] || 0;
  }

  // Save game state
  saveGame() {
    try {
      localStorage.setItem('miniTycoonSave', JSON.stringify(this.gameState));
      return true;
    } catch (e) {
      console.error('Failed to save game:', e);
      return false;
    }
  }

  // Load game state
  loadGame() {
    try {
      const saved = localStorage.getItem('miniTycoonSave');
      if (saved) {
        this.gameState = JSON.parse(saved);
        return true;
      }
    } catch (e) {
      console.error('Failed to load game:', e);
    }
    return false;
  }

  // Reset game
  resetGame() {
    this.stop();
    this.gameState = this.createInitialState();
  }
}

export default GameEngine;