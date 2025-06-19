
import React from 'react';
import { PlayerColor, GameMode, Theme } from '../types'; 
import { AI_PLAYER_NAME } from '../constants';

interface TurnIndicatorProps {
  playerName: string;
  playerColor: PlayerColor;
  isComputerThinking?: boolean;
  gameMode?: GameMode;
  theme: Theme;
  orientation: 'vertical-left' | 'vertical-right'; // New prop for orientation
}

const TurnIndicator: React.FC<TurnIndicatorProps> = ({ 
    playerName, 
    playerColor, 
    isComputerThinking, 
    gameMode, 
    theme,
    orientation 
}) => {
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
  let orientationTransformClass = '';

  // Define base size (width becomes length along board, height becomes thickness)
  // Padding adjusted for a more compact vertical look
  const sizeClasses = 'w-[150px] sm:w-[180px] md:w-[200px] h-9 sm:h-10 md:h-11 p-1.5 sm:p-2';

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

  if (orientation === 'vertical-left') {
    orientationTransformClass = 'transform -rotate-90 origin-center';
  } else if (orientation === 'vertical-right') {
    orientationTransformClass = 'transform rotate-90 origin-center';
  }

  return (
    <div
      className={`rounded-lg shadow-md border-2 ${borderColorClass} ${bgColorClass} backdrop-blur-sm 
                  flex items-center justify-center 
                  ${sizeClasses} ${orientationTransformClass} 
                  transition-all duration-200`}
      role="status"
      aria-live="polite"
    >
      <p 
        className={`text-xs sm:text-sm font-bold ${textColorClass} ${isAIActive && isComputerThinking ? '' : 'whitespace-nowrap'}`} 
        style={{textShadow: textShadowClass}}
      >
        {displayText}
      </p>
    </div>
  );
};

export default TurnIndicator;
