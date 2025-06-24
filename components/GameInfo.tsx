import React from 'react';
import { Theme } from '../types'; 

interface GameInfoProps {
  turnMessage: string; // Changed from currentPlayerName, gameStatus, isGameOver
  onReset: () => void;
  theme: Theme;
}

const GameInfo: React.FC<GameInfoProps> = ({ turnMessage, onReset, theme }) => {
  // Removed title, messageColorClass, panelBgClass adjustments based on gameStatus.winner or specific messages
  // Panel styling is now more consistent for its reduced role.
  const panelBgClass = theme === 'dark' ? 'bg-slate-700/50 backdrop-blur-xl border border-slate-500/40 shadow-black/40' : 'bg-white/70 backdrop-blur-xl border-gray-300/60 shadow-gray-400/30';
  const turnMessageColorClass = theme === 'dark' ? 'text-slate-200' : 'text-slate-700'; // General color for turn info
  const titleShadowClass = theme === 'dark' ? '0 0 8px rgba(255,255,255,0.1)' : '0 0 6px rgba(0,0,0,0.1)';
  const resetBtnClass = theme === 'dark' 
    ? 'bg-gradient-to-r from-sky-600/90 to-blue-700/90 hover:from-sky-500/95 hover:to-blue-600/95 text-white focus-visible:ring-blue-400 shadow-lg hover:shadow-blue-500/40'
    : 'bg-gradient-to-r from-sky-500 to-blue-600 hover:from-sky-600 hover:to-blue-700 text-white focus-visible:ring-blue-400 shadow-lg hover:shadow-blue-600/40';
  
  // The main title "Game Updates" or "Game Over!" is removed.
  // The dynamic gameStatus.message paragraph is removed.

  return (
    <div className={`p-2 sm:p-3 shadow-xl w-full max-w-md !mt-5 text-center rounded-xl ${panelBgClass}`}>
      <p 
        className={`text-sm sm:text-base mb-2 min-h-[1.5rem] flex items-center justify-center font-semibold px-2 ${turnMessageColorClass}`}
        style={{textShadow: titleShadowClass}}
        aria-live="polite" // Still good for accessibility of turn changes
      >
        {turnMessage}
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