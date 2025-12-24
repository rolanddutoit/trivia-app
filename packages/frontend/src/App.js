import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import HostSetup from './components/HostSetup';
import JoinGame from './components/JoinGame';
import HostDashboard from './components/HostDashboard';
import PlayerGame from './components/PlayerGame';
import './App.css';

function App() {
  return (
    <Router>
      <div className="App">
        <Routes>
          <Route path="/" element={<HostSetup />} />
          <Route path="/join/:gameId" element={<JoinGame />} />
          <Route path="/host/:gameId" element={<HostDashboard />} />
          <Route path="/play/:gameId" element={<PlayerGame />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
