import React from 'react';
import { PlayerColor, GameStatus, Theme } from '../types'; 

interface GameInfoProps {
  currentPlayerName: string; 
  gameStatus: GameStatus;
  onReset: () => void; // This will now trigger opening the menu. Full reset logic in App.tsx via Menu.
  isGameOver: boolean;
  theme: Theme;
}

const GameInfo: React.FC<GameInfoProps> = ({ currentPlayerName, gameStatus, onReset, isGameOver, theme }) => {
  const infoTitle = isGameOver ? "Game Over!" : "Game Updates";

  let messageColorClass = '';
  let panelBgClass = '';
  let titleColorClass = '';
  let resetBtnClass = '';
  let titleShadowClass = '';

  if (theme === 'dark') {
    messageColorClass = 'text-slate-300';
    panelBgClass = 'bg-slate-700/50 backdrop-blur-xl border border-slate-500/40 shadow-black/40';
    titleColorClass = 'text-slate-100';
    titleShadowClass = '0 0 8px rgba(255,255,255,0.1)';
    resetBtnClass = 'bg-gradient-to-r from-red-600/90 to-rose-700/90 hover:from-red-500/95 hover:to-rose-600/95 text-white focus-visible:ring-rose-400 shadow-lg hover:shadow-rose-500/40';
    if (gameStatus.winner) {
      messageColorClass = gameStatus.winner === PlayerColor.WHITE ? 'text-rose-400 font-semibold' : 'text-cyan-400 font-semibold';
    } else if (gameStatus.message.toLowerCase().includes('checkmate')) {
      messageColorClass = 'text-red-400 font-bold';
    } else if (gameStatus.message.toLowerCase().includes('stalemate')) {
      messageColorClass = 'text-sky-400 font-semibold';
    } else if (gameStatus.message.toLowerCase().includes('check!')) {
      messageColorClass = 'text-amber-400 font-semibold';
    }
  } else { // Light theme
    messageColorClass = 'text-slate-600';
    panelBgClass = 'bg-white/70 backdrop-blur-xl border border-gray-300/60 shadow-gray-400/30';
    titleColorClass = 'text-slate-800';
    titleShadowClass = '0 0 6px rgba(0,0,0,0.1)';
    resetBtnClass = 'bg-gradient-to-r from-red-500 to-rose-600 hover:from-red-600 hover:to-rose-700 text-white focus-visible:ring-rose-400 shadow-lg hover:shadow-rose-600/40';
     if (gameStatus.winner) {
      messageColorClass = gameStatus.winner === PlayerColor.WHITE ? 'text-red-600 font-bold' : 'text-blue-600 font-bold';
    } else if (gameStatus.message.toLowerCase().includes('checkmate')) {
      messageColorClass = 'text-red-700 font-extrabold';
    } else if (gameStatus.message.toLowerCase().includes('stalemate')) {
      messageColorClass = 'text-sky-700 font-bold';
    } else if (gameStatus.message.toLowerCase().includes('check!')) {
      messageColorClass = 'text-amber-600 font-bold';
    }
  }


  return (
    <div className={`p-2 sm:p-3 shadow-xl w-full max-w-md !mt-5 text-center rounded-xl ${panelBgClass}`}>
      <h2 className={`text-lg sm:text-xl font-bold mb-1.5 ${titleColorClass}`} style={{textShadow: titleShadowClass}}>
        {infoTitle}
      </h2>
      <p 
        className={`text-xs sm:text-sm mb-2 min-h-[2rem] flex items-center justify-center font-medium px-2 ${messageColorClass}`}
        aria-live="polite"
      >
        {gameStatus.message}
      </p>
      <button
        onClick={onReset} 
        className={`px-4 py-2 font-semibold rounded-lg text-sm transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 ${resetBtnClass}`}
      >
        Open Game Menu 
      </button>
    </div>
  );
};

export default GameInfo;