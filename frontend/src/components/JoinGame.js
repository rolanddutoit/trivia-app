import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const socket = io('http://localhost:5000');

const JoinGame = () => {
  const { gameId } = useParams();
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    socket.on('joinedGame', () => {
      navigate(`/play/${gameId}`);
    });

    return () => {
      socket.off('joinedGame');
    };
  }, [gameId, navigate]);

  const handleJoin = (e) => {
    e.preventDefault();
    socket.emit('joinGame', { gameId, playerName });
  };

  return (
    <div className="join-game">
      <h1>Join Trivia Game</h1>
      <p>Game ID: {gameId}</p>
      <form onSubmit={handleJoin}>
        <div>
          <label>Enter your name:</label>
          <input
            type="text"
            value={playerName}
            onChange={(e) => setPlayerName(e.target.value)}
            required
          />
        </div>
        <button type="submit">Join Game</button>
      </form>
    </div>
  );
};

export default JoinGame;