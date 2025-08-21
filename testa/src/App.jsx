import './App.css';

const games = [
  {
    name: "Blackjack & Go Fish",
    path: "../Black_jack",
    description: "Classic card games - play Blackjack or switch to Go Fish!",
    emoji: "🃏",
    port: 3001
  },
  {
    name: "Pong Game",
    path: "../pong-game", 
    description: "Classic arcade Pong with debug mode and full game",
    emoji: "🏓",
    port: 3002
  },
  {
    name: "Doughnut Dash Platformer",
    path: "../doughnut",
    description: "Jump, run, and collect doughnuts in this exciting platformer!",
    emoji: "🍩",
    port: 3003
  },
  {
    name: "Breakout Game",
    path: "../breakout-game",
    description: "Break bricks with your paddle and ball",
    emoji: "🧱",
    port: 3004
  },
  {
    name: "UNO Online",
    path: "../Uno-onlin",
    description: "The classic card game UNO",
    emoji: "🔴",
    port: 3005
  },
  {
    name: "Trading Game",
    path: "../gaeme",
    description: "Business simulation trading game",
    emoji: "💼",
    port: 3006
  },
  {
    name: "Music Game",
    path: "../nennn",
    description: "Musical rhythm game with audio features",
    emoji: "🎵",
    port: 3007
  },
  {
    name: "Shot Put",
    path: "../shot-put",
    description: "Athletic throwing game",
    emoji: "🏃‍♂️",
    port: 3008
  },
  {
    name: "Chat App",
    path: "../chat-eee",
    description: "Real-time chat application",
    emoji: "💬",
    port: 3009
  }
];

function App() {
  const openGame = (game) => {
    const gameUrl = `http://localhost:${game.port}`;
    
    // Try to open the game in a new tab
    const newWindow = window.open(gameUrl, '_blank');
    
    // If popup was blocked or failed, show instructions
    if (!newWindow || newWindow.closed || typeof newWindow.closed === 'undefined') {
      alert(`🎮 To play ${game.name}:\n\n1. Navigate to: ${game.path}\n2. Run: npm start\n3. The game will open on port ${game.port}\n\nOr visit: ${gameUrl}`);
    }
  };

  const copyInstructions = (game) => {
    const instructions = `cd ${game.path} && PORT=${game.port} npm start`;
    if (navigator.clipboard) {
      navigator.clipboard.writeText(instructions);
      alert(`📋 Copied to clipboard!\n\nRun this command:\n${instructions}`);
    } else {
      alert(`💡 Run this command to start the game:\n\n${instructions}`);
    }
  };

  return (
    <div className="App">
      <header className="App-header">
        <h1>🎮 Elia's Game Hub</h1>
        <p className="subtitle">Collection of games built with Claude!</p>
        
        <div className="games-grid">
          {games.map((game, index) => (
            <div key={index} className="game-card">
              <div className="game-emoji">{game.emoji}</div>
              <h3 className="game-name">{game.name}</h3>
              <p className="game-description">{game.description}</p>
              <div className="game-path">📁 {game.path}</div>
              <div className="game-actions">
                <button 
                  className="game-button primary" 
                  onClick={() => openGame(game)}
                >
                  🚀 Play Game
                </button>
                <button 
                  className="game-button secondary" 
                  onClick={() => copyInstructions(game)}
                >
                  📋 Copy Command
                </button>
              </div>
            </div>
          ))}
        </div>
        
        <footer className="footer">
          <p>All games created collaboratively with Claude AI</p>
          <p className="instructions">💡 Click "Play Game" to open in new tab, or "Copy Command" to run manually</p>
        </footer>
      </header>
    </div>
  );
}

export default App;
