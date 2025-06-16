import React from 'react';
import { PlayerColor, GameStatus } from '../types';

interface GameInfoProps {
  currentPlayerName: string; 
  gameStatus: GameStatus;
  onReset: () => void;
  isGameOver: boolean;
  isComputerThinking?: boolean; // New prop
  gameMode?: 'friend' | 'computer' | null; // New prop
}

const GameInfo: React.FC<GameInfoProps> = ({ currentPlayerName, gameStatus, onReset, isGameOver, isComputerThinking, gameMode }) => {
  let turnText = `${currentPlayerName}'s Turn`;
  
  if (isComputerThinking && gameMode === 'computer') {
    turnText = `${currentPlayerName} is thinking...`;
  } else if (gameStatus.isGameOver) {
    if (gameStatus.winnerName) {
      turnText = `Game Over`; 
    } else if (gameStatus.message.toLowerCase().includes("stalemate")) {
      turnText = "Game Over";
    } else {
      turnText = "Game Over";
    }
  } else if (gameStatus.message.toLowerCase().includes("check!")) {
     turnText = `${currentPlayerName} is in Check!`;
  }


  return (
    <div className="p-4 sm:p-5 bg-stone-50 text-slate-700 rounded-lg shadow-lg w-full max-w-md text-center border border-stone-300">
      <h2 className="text-xl sm:text-2xl font-bold mb-2 text-slate-800">
        {turnText}
      </h2>
      <p className={`text-sm sm:text-base mb-3 h-10 flex items-center justify-center font-medium ${
        gameStatus.winner ? 'text-green-600' : 
        gameStatus.message.toLowerCase().includes('checkmate') ? 'text-red-600' : 
        gameStatus.message.toLowerCase().includes('stalemate') ? 'text-blue-600' :
        'text-slate-600'
      }`}>
        {gameStatus.message}
      </p>
      <button
        onClick={onReset}
        className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-semibold rounded-md shadow-sm hover:shadow-md transform hover:scale-105 transition-all duration-150 ease-in-out text-md"
      >
        Reset Game & Choose Mode
      </button>
    </div>
  );
};

export default GameInfo;