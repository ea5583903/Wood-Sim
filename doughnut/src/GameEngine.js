class Customer {
  constructor(id, type, arrivalTick) {
    this.id = id;
    this.type = type;
    this.arrivalTick = arrivalTick;
    this.order = this.generateOrder();
    this.patience = this.calculatePatience();
    this.maxPatience = this.patience;
    this.orderValue = this.calculateOrderValue();
    this.isServed = false;
    this.hasLeft = false;
  }

  generateOrder() {
    const recipes = ['Plain', 'Chocolate', 'Strawberry', 'Boston Cream', 'Jelly-Filled'];
    const orderSize = Math.random() < 0.7 ? 1 : Math.random() < 0.9 ? 2 : 3;
    const order = [];
    
    for (let i = 0; i < orderSize; i++) {
      const recipe = recipes[Math.floor(Math.random() * recipes.length)];
      order.push(recipe);
    }
    
    return order;
  }

  calculatePatience() {
    const basePatience = 30;
    const typeMultiplier = {
      'Casual': 1.2,
      'Business': 0.8,
      'Student': 1.5,
      'Tourist': 1.0,
      'Regular': 0.9
    };
    return Math.floor(basePatience * (typeMultiplier[this.type] || 1.0));
  }

  calculateOrderValue() {
    return this.order.length * 2.50;
  }

  decreasePatience() {
    this.patience = Math.max(0, this.patience - 1);
    return this.patience === 0;
  }

  getPatiencePercentage() {
    return (this.patience / this.maxPatience) * 100;
  }
}

class Shop {
  constructor() {
    this.cash = 50;
    this.reputation = 50;
    this.rent = 25;
    this.doughnuts = {
      'Plain': 0,
      'Chocolate': 0,
      'Strawberry': 0,
      'Boston Cream': 0,
      'Jelly-Filled': 0
    };
    this.ingredients = {
      'Dough': 20,
      'Sugar': 10,
      'Chocolate': 5,
      'Strawberry': 5,
      'Cream': 5,
      'Jelly': 5
    };
    this.prices = {
      'Plain': 2.00,
      'Chocolate': 2.50,
      'Strawberry': 2.50,
      'Boston Cream': 3.00,
      'Jelly-Filled': 3.00
    };
  }

  canMake(recipe, quantity = 1) {
    const recipes = {
      'Plain': { 'Dough': 1, 'Sugar': 1 },
      'Chocolate': { 'Dough': 1, 'Sugar': 1, 'Chocolate': 1 },
      'Strawberry': { 'Dough': 1, 'Sugar': 1, 'Strawberry': 1 },
      'Boston Cream': { 'Dough': 1, 'Sugar': 1, 'Cream': 1 },
      'Jelly-Filled': { 'Dough': 1, 'Sugar': 1, 'Jelly': 1 }
    };
    
    const required = recipes[recipe];
    if (!required) return false;
    
    for (const [ingredient, needed] of Object.entries(required)) {
      if (this.ingredients[ingredient] < needed * quantity) {
        return false;
      }
    }
    return true;
  }

  make(recipe, quantity = 1) {
    if (!this.canMake(recipe, quantity)) return false;
    
    const recipes = {
      'Plain': { 'Dough': 1, 'Sugar': 1 },
      'Chocolate': { 'Dough': 1, 'Sugar': 1, 'Chocolate': 1 },
      'Strawberry': { 'Dough': 1, 'Sugar': 1, 'Strawberry': 1 },
      'Boston Cream': { 'Dough': 1, 'Sugar': 1, 'Cream': 1 },
      'Jelly-Filled': { 'Dough': 1, 'Sugar': 1, 'Jelly': 1 }
    };
    
    const required = recipes[recipe];
    for (const [ingredient, needed] of Object.entries(required)) {
      this.ingredients[ingredient] -= needed * quantity;
    }
    
    this.doughnuts[recipe] += quantity;
    return true;
  }

  canServe(order) {
    for (const recipe of order) {
      if (this.doughnuts[recipe] < 1) {
        return false;
      }
    }
    return true;
  }

  serve(order) {
    if (!this.canServe(order)) return false;
    
    let total = 0;
    for (const recipe of order) {
      this.doughnuts[recipe] -= 1;
      total += this.prices[recipe];
    }
    
    this.cash += total;
    return total;
  }

  restockIngredient(ingredient, quantity) {
    const costs = {
      'Dough': 0.50,
      'Sugar': 0.30,
      'Chocolate': 1.00,
      'Strawberry': 1.00,
      'Cream': 1.20,
      'Jelly': 0.80
    };
    
    const cost = costs[ingredient] * quantity;
    if (this.cash >= cost) {
      this.cash -= cost;
      this.ingredients[ingredient] += quantity;
      return true;
    }
    return false;
  }

  spoilDoughnuts() {
    let spoiled = 0;
    for (const recipe in this.doughnuts) {
      const toSpoil = Math.floor(this.doughnuts[recipe] * 0.2);
      this.doughnuts[recipe] -= toSpoil;
      spoiled += toSpoil;
    }
    return spoiled;
  }
}

class GameEngine {
  constructor() {
    this.gameState = {
      isRunning: false,
      currentDay: 1,
      currentTick: 0,
      customerId: 0,
      customers: [],
      customerQueue: [],
      shop: new Shop(),
      alerts: [],
      stats: {
        totalRevenue: 0,
        totalCustomers: 0,
        satisfiedCustomers: 0,
        lostCustomers: 0,
        totalDoughnutsMade: 0,
        totalIngredientsBought: 0
      }
    };
    
    this.gameLoop = null;
    this.customerSpawnRate = 0.3;
    this.maxQueueSize = 8;
    this.ticksPerDay = 60;
  }

  start() {
    this.gameState.isRunning = true;
    this.gameLoop = setInterval(() => {
      this.tick();
    }, 1000);
  }

  stop() {
    this.gameState.isRunning = false;
    if (this.gameLoop) {
      clearInterval(this.gameLoop);
      this.gameLoop = null;
    }
  }

  tick() {
    if (!this.gameState.isRunning) return;

    this.gameState.currentTick++;
    
    this.spawnCustomers();
    this.updateCustomers();
    this.updateQueue();
    
    if (this.gameState.currentTick >= this.ticksPerDay) {
      this.endDay();
    }

    this.checkGameEnd();
  }

  spawnCustomers() {
    if (this.gameState.customerQueue.length >= this.maxQueueSize) return;
    
    if (Math.random() < this.customerSpawnRate) {
      const types = ['Casual', 'Business', 'Student', 'Tourist', 'Regular'];
      const type = types[Math.floor(Math.random() * types.length)];
      
      const customer = new Customer(
        this.gameState.customerId++,
        type,
        this.gameState.currentTick
      );
      
      this.gameState.customers.push(customer);
      this.gameState.customerQueue.push(customer);
      this.gameState.stats.totalCustomers++;
    }
  }

  updateCustomers() {
    for (let i = this.gameState.customerQueue.length - 1; i >= 0; i--) {
      const customer = this.gameState.customerQueue[i];
      
      if (customer.decreasePatience()) {
        this.gameState.customerQueue.splice(i, 1);
        customer.hasLeft = true;
        this.gameState.stats.lostCustomers++;
        this.gameState.shop.reputation = Math.max(0, this.gameState.shop.reputation - 2);
        this.addAlert(`${customer.type} customer left due to long wait!`, 'warning');
      }
    }
  }

  updateQueue() {
    const nextCustomer = this.gameState.customerQueue[0];
    if (nextCustomer && this.gameState.shop.canServe(nextCustomer.order)) {
      this.autoServeCustomer(nextCustomer);
    }
  }

  autoServeCustomer(customer) {
    const revenue = this.gameState.shop.serve(customer.order);
    if (revenue) {
      this.gameState.customerQueue.shift();
      customer.isServed = true;
      this.gameState.stats.satisfiedCustomers++;
      this.gameState.stats.totalRevenue += revenue;
      
      const tip = customer.getPatiencePercentage() > 80 ? revenue * 0.1 : 0;
      this.gameState.shop.cash += tip;
      
      if (tip > 0) {
        this.gameState.shop.reputation = Math.min(100, this.gameState.shop.reputation + 1);
      }
      
      this.addAlert(`Served ${customer.type} for $${revenue.toFixed(2)}${tip > 0 ? ` + $${tip.toFixed(2)} tip` : ''}`, 'success');
    }
  }

  makeDoughnut(recipe, quantity = 1) {
    if (this.gameState.shop.make(recipe, quantity)) {
      this.gameState.stats.totalDoughnutsMade += quantity;
      this.addAlert(`Made ${quantity} ${recipe} doughnut${quantity > 1 ? 's' : ''}`, 'info');
      return true;
    }
    this.addAlert(`Cannot make ${recipe} - missing ingredients`, 'error');
    return false;
  }

  restockIngredient(ingredient, quantity) {
    if (this.gameState.shop.restockIngredient(ingredient, quantity)) {
      this.gameState.stats.totalIngredientsBought += quantity;
      this.addAlert(`Restocked ${quantity} ${ingredient}`, 'info');
      return true;
    }
    this.addAlert(`Cannot afford ${quantity} ${ingredient}`, 'error');
    return false;
  }

  setPrice(recipe, price) {
    this.gameState.shop.prices[recipe] = Math.max(1.00, Math.min(10.00, price));
    this.addAlert(`Set ${recipe} price to $${price.toFixed(2)}`, 'info');
  }

  endDay() {
    const spoiled = this.gameState.shop.spoilDoughnuts();
    this.gameState.shop.cash -= this.gameState.shop.rent;
    
    this.addAlert(`Day ${this.gameState.currentDay} ended. Rent: $${this.gameState.shop.rent}${spoiled > 0 ? `, Spoiled: ${spoiled}` : ''}`, 'warning');
    
    this.gameState.currentDay++;
    this.gameState.currentTick = 0;
    
    if (this.gameState.shop.cash < 0) {
      this.addAlert('GAME OVER - Out of money!', 'error');
      this.stop();
    }
  }

  checkGameEnd() {
    if (this.gameState.shop.cash < 0) {
      this.addAlert('GAME OVER - Bankruptcy!', 'error');
      this.stop();
    } else if (this.gameState.currentDay > 7) {
      this.addAlert('SUCCESS - You survived a week!', 'success');
      this.stop();
    } else if (this.gameState.shop.cash >= 200) {
      this.addAlert('VICTORY - You built a successful business!', 'success');
      this.stop();
    }
  }

  addAlert(message, type = 'info') {
    this.gameState.alerts.unshift({
      id: Date.now(),
      message,
      type,
      timestamp: new Date().toLocaleTimeString()
    });
    
    if (this.gameState.alerts.length > 10) {
      this.gameState.alerts.pop();
    }
  }

  resetGame() {
    this.stop();
    this.gameState = {
      isRunning: false,
      currentDay: 1,
      currentTick: 0,
      customerId: 0,
      customers: [],
      customerQueue: [],
      shop: new Shop(),
      alerts: [],
      stats: {
        totalRevenue: 0,
        totalCustomers: 0,
        satisfiedCustomers: 0,
        lostCustomers: 0,
        totalDoughnutsMade: 0,
        totalIngredientsBought: 0
      }
    };
  }

  saveGame() {
    try {
      localStorage.setItem('doughnutDashSave', JSON.stringify(this.gameState));
      return true;
    } catch (error) {
      return false;
    }
  }

  loadGame() {
    try {
      const saved = localStorage.getItem('doughnutDashSave');
      if (saved) {
        const data = JSON.parse(saved);
        this.gameState = { ...this.gameState, ...data };
        this.gameState.shop = Object.assign(new Shop(), data.shop);
        return true;
      }
      return false;
    } catch (error) {
      return false;
    }
  }
}

export default GameEngine;