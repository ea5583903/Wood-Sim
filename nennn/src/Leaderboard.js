class Leaderboard {
  constructor() {
    this.maxEntries = 10;
    this.storageKey = 'spaceShooterLeaderboard';
    this.scores = this.loadScores();
  }
  
  loadScores() {
    try {
      const stored = localStorage.getItem(this.storageKey);
      if (stored) {
        return JSON.parse(stored);
      }
    } catch (e) {
      console.warn('Failed to load leaderboard from localStorage');
    }
    return [];
  }
  
  saveScores() {
    try {
      localStorage.setItem(this.storageKey, JSON.stringify(this.scores));
    } catch (e) {
      console.warn('Failed to save leaderboard to localStorage');
    }
  }
  
  addScore(playerName, score, wave, combo, enemiesKilled, timeAlive) {
    const entry = {
      name: playerName || 'Anonymous',
      score: score,
      wave: wave,
      combo: combo,
      enemiesKilled: enemiesKilled,
      timeAlive: timeAlive,
      date: new Date().toLocaleDateString()
    };
    
    this.scores.push(entry);
    this.scores.sort((a, b) => b.score - a.score);
    
    if (this.scores.length > this.maxEntries) {
      this.scores = this.scores.slice(0, this.maxEntries);
    }
    
    this.saveScores();
    
    return this.scores.findIndex(s => s === entry) + 1;
  }
  
  getTopScores(count = 10) {
    return this.scores.slice(0, count);
  }
  
  isHighScore(score) {
    if (this.scores.length < this.maxEntries) {
      return true;
    }
    return score > this.scores[this.scores.length - 1].score;
  }
  
  getRank(score) {
    for (let i = 0; i < this.scores.length; i++) {
      if (score > this.scores[i].score) {
        return i + 1;
      }
    }
    return this.scores.length + 1;
  }
  
  clearLeaderboard() {
    this.scores = [];
    this.saveScores();
  }
  
  formatTime(milliseconds) {
    const seconds = Math.floor(milliseconds / 1000);
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    
    if (minutes > 0) {
      return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
    }
    return `${seconds}s`;
  }
}

export default Leaderboard;