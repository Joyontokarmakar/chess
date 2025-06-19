import React from 'react';
import { PlayerColor, GameMode, Theme } from '../types'; // Added Theme
import { AI_PLAYER_NAME } from '../constants';

interface TurnIndicatorProps {
  playerName: string;
  playerColor: PlayerColor;
  isComputerThinking?: boolean;
  gameMode?: GameMode;
  theme: Theme; // Added theme prop
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ playerName, playerColor, isComputerThinking, gameMode, theme }) => {
  let displayText: string;
  const isAIActive = gameMode === 'computer' && playerColor === PlayerColor.BLACK;

  if (isAIActive && isComputerThinking) {
    displayText = `${AI_PLAYER_NAME} is thinking...`;
  } else {
    displayText = `${playerName}'s Turn`;
  }

  let textColorClass = '';
  let borderColorClass = '';
  let bgColorClass = '';
  let textShadowClass = '';

  if (theme === 'dark') {
    textColorClass = playerColor === PlayerColor.WHITE ? 'text-rose-400' : 'text-cyan-400';
    borderColorClass = playerColor === PlayerColor.WHITE ? 'border-rose-500/60' : 'border-cyan-400/60';
    bgColorClass = playerColor === PlayerColor.WHITE ? 'bg-slate-700/40' : 'bg-slate-750/40';
    textShadowClass = '0 0 5px currentColor';
  } else { // Light theme
    textColorClass = playerColor === PlayerColor.WHITE ? 'text-red-600' : 'text-blue-600';
    borderColorClass = playerColor === PlayerColor.WHITE ? 'border-red-500/50' : 'border-blue-500/50';
    bgColorClass = playerColor === PlayerColor.WHITE ? 'bg-white/60' : 'bg-slate-50/70';
    textShadowClass = '0 0 3px rgba(0,0,0,0.1)';
  }


  return (
    <div
      className={`p-3.5 md:p-4 rounded-xl shadow-xl border-2 ${borderColorClass} ${bgColorClass} backdrop-blur-xl w-full sm:w-auto sm:min-w-[220px] text-center transition-all duration-200`}
      role="status"
      aria-live="polite"
    >
      <p className={`text-base sm:text-lg font-bold ${textColorClass}`} style={{textShadow: textShadowClass}}>
        {displayText}
      </p>
    </div>
  );
};

export default TurnIndicator;