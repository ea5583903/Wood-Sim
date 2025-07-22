import logo from './logo.svg';
import './App.css';
import { useState, useEffect } from 'react';

function App() {
  const [wood, setWood] = useState(0);
  const [axes, setAxes] = useState(1);
  const [trees, setTrees] = useState(0);
  const [axeUpgrade, setAxeUpgrade] = useState(false);
  const [treeUpgrade, setTreeUpgrade] = useState(false);
  const [goldenAxe, setGoldenAxe] = useState(false);
  const [lumberjackHelper, setLumberjackHelper] = useState(0);

  const [hasHouse, setHasHouse] = useState(false);
  const [houseColor, setHouseColor] = useState('#b5651d');
  const [furniture, setFurniture] = useState([]);

  // Passive wood from trees, upgrades, and helpers
  useEffect(() => {
    const interval = setInterval(() => {
      let passive = trees * (treeUpgrade ? 2 : 1);
      passive += lumberjackHelper * 5;
      setWood(w => w + passive);
    }, 1000);
    return () => clearInterval(interval);
  }, [trees, treeUpgrade, lumberjackHelper]);

  const chopWood = () => {
    let amount = axes * (axeUpgrade ? 2 : 1);
    if (goldenAxe) amount *= 3;
    setWood(wood + amount);
  };

  const buyAxe = () => {
    if (wood >= 10) {
      setWood(wood - 10);
      setAxes(axes + 1);
    }
  };

  const buyTree = () => {
    if (wood >= 25) {
      setWood(wood - 25);
      setTrees(trees + 1);
    }
  };

  const buyAxeUpgrade = () => {
    if (!axeUpgrade && wood >= 100) {
      setWood(wood - 100);
      setAxeUpgrade(true);
    }
  };

  const buyTreeUpgrade = () => {
    if (!treeUpgrade && wood >= 200) {
      setWood(wood - 200);
      setTreeUpgrade(true);
    }
  };

  const buyGoldenAxe = () => {
    if (!goldenAxe && wood >= 500) {
      setWood(wood - 500);
      setGoldenAxe(true);
    }
  };

  const buyLumberjackHelper = () => {
    if (wood >= 150) {
      setWood(wood - 150);
      setLumberjackHelper(lumberjackHelper + 1);
    }
  };

  const buyHouse = () => {
    if (!hasHouse && wood >= 50) {
      setWood(wood - 50);
      setHasHouse(true);
    }
  };

  const handleColorChange = (e) => {
    setHouseColor(e.target.value);
  };

  // Furniture shop
  const buyFurniture = (item, cost) => {
    if (hasHouse && wood >= cost && !furniture.includes(item)) {
      setWood(wood - cost);
      setFurniture([...furniture, item]);
    }
  };

  return (
    <div className="App">
      <h1>
        <img src={logo} className="App-logo" alt="logo" />
      </h1>
      <h2>Wood Chopping Game</h2>
      <p>Wood Collected: {wood}</p>
      <button onClick={chopWood}>
        Chop Wood 🪓 (+{axes * (axeUpgrade ? 2 : 1) * (goldenAxe ? 3 : 1)})
      </button>
      
      <div className="shop-section">
        <h3>Shop</h3>
        <button onClick={buyAxe} disabled={wood < 10}>
          Buy Axe (10 wood) - You have {axes}
        </button>
        <br />
        <button onClick={buyTree} disabled={wood < 25}>
          Buy Tree (25 wood) - You have {trees}
        </button>
        <br />
        <button onClick={buyLumberjackHelper} disabled={wood < 150}>
          Hire Lumberjack Helper (150 wood) - You have {lumberjackHelper}
        </button>
        <p>
          Trees: +{treeUpgrade ? 2 : 1} wood/sec each.<br />
          Lumberjack Helper: +5 wood/sec each.
        </p>
      </div>

      <div className="upgrade-section">
        <h3>Upgrades</h3>
        <button onClick={buyAxeUpgrade} disabled={axeUpgrade || wood < 100}>
          Sharpen Axe (100 wood) {axeUpgrade && "✓"}
        </button>
        <br />
        <button onClick={buyTreeUpgrade} disabled={treeUpgrade || wood < 200}>
          Fertilize Trees (200 wood) {treeUpgrade && "✓"}
        </button>
        <br />
        <button onClick={buyGoldenAxe} disabled={goldenAxe || wood < 500}>
          Golden Axe (500 wood, 3x chop) {goldenAxe && "✓"}
        </button>
      </div>

      <div className="house-section">
        <h3>House</h3>
        {!hasHouse ? (
          <button onClick={buyHouse} disabled={wood < 50}>
            Build House (50 wood)
          </button>
        ) : (
          <div>
            <div
              style={{
                width: 80,
                height: 80,
                margin: "0 auto 10px auto",
                background: houseColor,
                border: "4px solid #7a4a13",
                borderRadius: 12,
                boxShadow: "0 2px 8px #0002",
                position: "relative"
              }}
            >
              {/* Furniture icons */}
              {furniture.includes("Bed") && (
                <span role="img" aria-label="bed" style={{position: "absolute", left: 8, bottom: 8, fontSize: 28}}>🛏️</span>
              )}
              {furniture.includes("Table") && (
                <span role="img" aria-label="table" style={{position: "absolute", right: 8, bottom: 8, fontSize: 28}}>🪑</span>
              )}
            </div>
            <label>
              House Color:{" "}
              <input
                type="color"
                value={houseColor}
                onChange={handleColorChange}
                style={{ width: 40, height: 40, border: "none", background: "none", cursor: "pointer" }}
              />
            </label>
            <div style={{marginTop: 10}}>
              <h4>Furniture Shop</h4>
              <button
                onClick={() => buyFurniture("Bed", 60)}
                disabled={wood < 60 || furniture.includes("Bed")}
              >
                Buy Bed 🛏️ (60 wood) {furniture.includes("Bed") && "✓"}
              </button>
              <button
                onClick={() => buyFurniture("Table", 40)}
                disabled={wood < 40 || furniture.includes("Table")}
              >
                Buy Table 🪑 (40 wood) {furniture.includes("Table") && "✓"}
              </button>
            </div>
            <div style={{marginTop: 10}}>
              <strong>Your Furniture:</strong>{" "}
              {furniture.length === 0 ? "None" : furniture.join(", ")}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default App;
