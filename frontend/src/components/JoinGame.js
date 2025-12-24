import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import io from 'socket.io-client';

const backendUrl = `${window.location.protocol}//${window.location.hostname.replace('3000', '5000')}`;
const socket = io(backendUrl);

const JoinGame = () => {
  const { gameId } = useParams();
  const [playerName, setPlayerName] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    console.log('JoinGame component mounted for gameId:', gameId);
    socket.on('joinedGame', () => {
      console.log('Joined game successfully');
      navigate(`/play/${gameId}`);
    });

    return () => {
      socket.off('joinedGame');
    };
  }, [gameId, navigate]);

  const handleJoin = (e) => {
    e.preventDefault();
    console.log('Emitting joinGame for gameId:', gameId, 'playerName:', playerName);
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