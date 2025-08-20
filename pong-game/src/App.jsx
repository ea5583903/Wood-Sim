import PongGame from './PongGame';
import DebugPong from './DebugPong';
import './App.css';

function App() {
  return (
    <div className="App">
      <div style={{ margin: '20px 0' }}>
        <h2>Debug Version:</h2>
        <DebugPong />
      </div>
      <hr />
      <div style={{ margin: '20px 0' }}>
        <h2>Full Game:</h2>
        <PongGame />
      </div>
    </div>
  );
}

export default App;
