import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import io from 'socket.io-client';

const backendUrl = `${window.location.protocol}//${window.location.hostname.replace('3000', '5000')}`;
const socket = io(backendUrl);

const PlayerGame = () => {
  const { gameId } = useParams();
  const [currentQuestion, setCurrentQuestion] = useState(null);
  const [answers, setAnswers] = useState([]);
  const [selectedAnswer, setSelectedAnswer] = useState('');

  useEffect(() => {
    socket.on('nextQuestion', (question) => {
      setCurrentQuestion(question);
      setAnswers([question.correct_answer, ...question.incorrect_answers].sort(() => Math.random() - 0.5));
      setSelectedAnswer('');
    });

    socket.on('gameOver', (finalScores) => {
      setCurrentQuestion(null);
      alert('Game Over! Your final score: ' + finalScores[socket.id]);
    });

    return () => {
      socket.off('nextQuestion');
      socket.off('gameOver');
    };
  }, []);

  const handleSubmitAnswer = (e) => {
    e.preventDefault();
    socket.emit('submitAnswer', { gameId, answer: selectedAnswer });
  };

  return (
    <div className="player-game">
      <h1>Trivia Game</h1>
      {currentQuestion ? (
        <div>
          <h2 dangerouslySetInnerHTML={{ __html: currentQuestion.question }} />
          <form onSubmit={handleSubmitAnswer}>
            {answers.map((answer, index) => (
              <div key={index}>
                <input
                  type="radio"
                  id={answer}
                  name="answer"
                  value={answer}
                  checked={selectedAnswer === answer}
                  onChange={(e) => setSelectedAnswer(e.target.value)}
                />
                <label htmlFor={answer} dangerouslySetInnerHTML={{ __html: answer }} />
              </div>
            ))}
            <button type="submit">Submit Answer</button>
          </form>
        </div>
      ) : (
        <p>Waiting for game to start...</p>
      )}
    </div>
  );
};

export default PlayerGame;