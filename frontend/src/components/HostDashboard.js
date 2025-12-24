import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const HostDashboard = () => {
  const { gameId } = useParams();
  const [players, setPlayers] = useState([]);
  const [scores, setScores] = useState({});
  const [gameStarted, setGameStarted] = useState(false);

  useEffect(() => {
    socket.on('playerJoined', (updatedPlayers) => {
      setPlayers(updatedPlayers);
    });

    socket.on('gameStarted', () => {
      setGameStarted(true);
    });

    socket.on('scoresUpdate', (updatedScores) => {
      setScores(updatedScores);
    });

    socket.on('gameOver', (finalScores) => {
      setScores(finalScores);
      setGameStarted(false);
    });

    return () => {
      socket.off('playerJoined');
      socket.off('gameStarted');
      socket.off('scoresUpdate');
      socket.off('gameOver');
    };
  }, []);

  const handleStartGame = () => {
    socket.emit('startGame', gameId);
  };

  return (
    <div className="host-dashboard">
      <h1>Host Dashboard</h1>
      <p>Game ID: {gameId}</p>
      <h2>Players:</h2>
      <ul>
        {players.map(player => (
          <li key={player.id}>{player.name} - Score: {scores[player.id] || 0}</li>
        ))}
      </ul>
      {!gameStarted && (
        <button onClick={handleStartGame}>Start Game</button>
      )}
      {gameStarted && <p>Game in progress...</p>}
    </div>
  );
};

export default HostDashboard;