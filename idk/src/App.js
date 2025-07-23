import React, { useState, useEffect } from 'react';
import './App.css';

const weatherTypes = [
  { name: 'Sunny', emoji: '☀️' },
  { name: 'Rainy', emoji: '🌧️' },
  { name: 'Cloudy', emoji: '☁️' },
  { name: 'Hurricane', emoji: '🌀' },
];

const upgradeOptions = [
  { name: 'Reinforced Roof', effect: 'Reduces hurricane damage' },
  { name: 'Sandbags', effect: 'Reduces flood damage' },
];

const initialBuildings = [
  { id: 1, name: 'House', destroyed: false },
  { id: 2, name: 'School', destroyed: false },
  { id: 3, name: 'Shop', destroyed: false },
]

function App() {
  const [weather, setWeather] = useState(weatherTypes[0]);
  const [upgrades, setUpgrades] = useState([]);
  const [buildings, setBuildings] = useState(initialBuildings);

  useEffect(() => {
    if (weather.name === 'Hurricane') {
      // If no Reinforced Roof, destroy buildings
      if (!upgrades.includes('Reinforced Roof')) {
        setBuildings(buildings.map(b => ({ ...b, destroyed: true })));
      }
    }
  }, [weather, upgrades]);

  const randomWeather = () => {
    const idx = Math.floor(Math.random() * weatherTypes.length);
    setWeather(weatherTypes[idx]);
  };

  const addUpgrade = (upgrade) => {
    if (!upgrades.includes(upgrade.name)) {
      setUpgrades([...upgrades, upgrade.name]);
    }
  };

  const resetAll = () => {
    setWeather(weatherTypes[0]);
    setUpgrades([]);
    setBuildings(initialBuildings);
  };

  return (
    <div className={`App weather-${weather.name.toLowerCase()}`}>
      <h1>Weather Simulator</h1>
      <div className="weather-display">
        <span className="weather-emoji">{weather.emoji}</span>
        <span className="weather-name">{weather.name}</span>
      </div>
      <div className="buildings">
        <h2>Buildings</h2>
        <div className="buildings-row">
          {buildings.map(b => (
            <div
              key={b.id}
              className={`building${b.destroyed ? ' destroyed' : ''}`}
              title={b.name}
            >
              {b.name}
            </div>
          ))}
        </div>
      </div>
      <button onClick={randomWeather}>Change Weather</button>
      <button onClick={resetAll} style={{marginLeft: '10px'}}>Reset</button>
      <div className="upgrades">
        <h2>Upgrades</h2>
        {upgradeOptions.map(upg => (
          <button
            key={upg.name}
            onClick={() => addUpgrade(upg)}
            disabled={upgrades.includes(upg.name)}
            style={{margin: '5px'}}
          >
            {upg.name}
          </button>
        ))}
        <div>
          {upgrades.length === 0 ? (
            <span>No upgrades yet.</span>
          ) : (
            <ul>
              {upgrades.map(u => <li key={u}>{u}</li>)}
            </ul>
          )}
        </div>
      </div>
      {weather.name === 'Hurricane' && (
        <div className="hurricane-animation">
          <div className="eye"></div>
          <div className="swirl swirl1"></div>
          <div className="swirl swirl2"></div>
          <div className="swirl swirl3"></div>
          {/* Debris elements */}
          <div className="debris debris1"></div>
          <div className="debris debris2"></div>
          <div className="debris debris3"></div>
          <div className="debris debris4"></div>
        </div>
      )}
    </div>
  );
}

export default App;
