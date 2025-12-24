import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import io from 'socket.io-client';
import axios from 'axios';

const socket = io('http://localhost:5000');

const HostSetup = () => {
  const [numQuestions, setNumQuestions] = useState(10);
  const [category, setCategory] = useState(9); // General Knowledge
  const [difficulty, setDifficulty] = useState('easy');
  const [gameId, setGameId] = useState(null);
  const [qrCode, setQrCode] = useState(null);
  const navigate = useNavigate();

  const categories = [
    { id: 9, name: 'General Knowledge' },
    { id: 10, name: 'Entertainment: Books' },
    { id: 11, name: 'Entertainment: Film' },
    { id: 12, name: 'Entertainment: Music' },
    { id: 14, name: 'Entertainment: Television' },
    { id: 15, name: 'Entertainment: Video Games' },
    { id: 17, name: 'Science & Nature' },
    { id: 18, name: 'Science: Computers' },
    { id: 19, name: 'Science: Mathematics' },
    { id: 20, name: 'Mythology' },
    { id: 21, name: 'Sports' },
    { id: 22, name: 'Geography' },
    { id: 23, name: 'History' },
    { id: 24, name: 'Politics' },
    { id: 25, name: 'Art' },
    { id: 26, name: 'Celebrities' },
    { id: 27, name: 'Animals' },
    { id: 28, name: 'Vehicles' },
    { id: 29, name: 'Entertainment: Comics' },
    { id: 30, name: 'Science: Gadgets' },
    { id: 31, name: 'Entertainment: Japanese Anime & Manga' },
    { id: 32, name: 'Entertainment: Cartoon & Animations' }
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    const gameSettings = { numQuestions, category, difficulty };
    socket.emit('createGame', gameSettings);
  };

  socket.on('gameCreated', ({ gameId }) => {
    setGameId(gameId);
    axios.get(`http://localhost:5000/qr/${gameId}`)
      .then(response => setQrCode(response.data.qrCode))
      .catch(error => console.error('Error fetching QR code:', error));
    navigate(`/host/${gameId}`);
  });

  return (
    <div className="host-setup">
      <h1>Host a Trivia Game</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Number of Questions:</label>
          <input
            type="number"
            value={numQuestions}
            onChange={(e) => setNumQuestions(e.target.value)}
            min="1"
            max="50"
          />
        </div>
        <div>
          <label>Category:</label>
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>{cat.name}</option>
            ))}
          </select>
        </div>
        <div>
          <label>Difficulty:</label>
          <select value={difficulty} onChange={(e) => setDifficulty(e.target.value)}>
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
          </select>
        </div>
        <button type="submit">Create Game</button>
      </form>
      {gameId && (
        <div>
          <p>Game ID: {gameId}</p>
          <p>Join Link: http://localhost:3000/join/{gameId}</p>
          {qrCode && <img src={qrCode} alt="QR Code" />}
        </div>
      )}
    </div>
  );
};

export default HostSetup;