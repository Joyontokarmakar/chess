import React from 'react';
import { Piece, PlayerColor, PieceType, Theme, LayoutSettings } from '../types'; 
import PieceDisplay from './PieceDisplay';
import { getPieceIconColor } from '../utils/styleUtils';

interface PlayerDisplayPanelProps {
  playerName: string;
  playerColor: PlayerColor;
  capturedPieces: Piece[];
  isCurrentTurn: boolean;
  theme: Theme;
  layoutSettings: LayoutSettings;
  timeLeft?: number | null; 
  timeLimit?: number | null; 
}

const formatTime = (seconds: number | null | undefined): string => {
  if (seconds === null || seconds === undefined || seconds < 0) return '00:00';
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
};

const PlayerDisplayPanel: React.FC<PlayerDisplayPanelProps> = ({
  playerName,
  playerColor,
  capturedPieces,
  isCurrentTurn,
  theme,
  layoutSettings,
  timeLeft,
  timeLimit,
}) => {
  
  let panelBg = '';
  let baseBorder = '';
  let nameTextColor = '';
  let capturedLabelColor = '';
  let noCapturedTextColor = '';
  let timerTextColor = '';
  let timerUrgentColor = '';
  let timerCriticalColor = '';
  let timerBgClass = '';
  let activeTimerHighlightClass = '';
  
  const avatarPieceForDisplay: Piece = { 
    id: `avatar-${playerColor}`, 
    type: PieceType.KING, 
    color: playerColor, 
    hasMoved: true 
  };

  const currentThemeBorder = playerColor === PlayerColor.WHITE 
    ? (theme === 'dark' ? 'border-rose-500/70 ring-rose-500/60' : 'border-red-500/60 ring-red-500/50')
    : (theme === 'dark' ? 'border-cyan-400/70 ring-cyan-400/60' : 'border-blue-500/60 ring-blue-500/50');

  if (theme === 'dark') {
    panelBg = playerColor === PlayerColor.WHITE ? 'bg-slate-700/30' : 'bg-slate-750/30';
    baseBorder = 'border-slate-600/40';
    nameTextColor = playerColor === PlayerColor.WHITE ? 'text-rose-400' : 'text-cyan-400';
    capturedLabelColor = 'text-slate-300';
    noCapturedTextColor = 'text-slate-400';
    timerTextColor = 'text-slate-200';
    timerUrgentColor = 'text-yellow-400 animate-pulse';
    timerCriticalColor = 'text-red-400 font-bold animate-pulse';
    timerBgClass = 'bg-slate-800/50 border-slate-600/70';
    activeTimerHighlightClass = 'ring-1 ring-sky-300/70 shadow-[0_0_8px_rgba(56,189,248,0.35)]';
  } else { // Light theme
    panelBg = playerColor === PlayerColor.WHITE ? 'bg-white/50' : 'bg-slate-50/60';
    baseBorder = 'border-gray-300/60';
    nameTextColor = playerColor === PlayerColor.WHITE ? 'text-red-700' : 'text-blue-700';
    capturedLabelColor = 'text-slate-600';
    noCapturedTextColor = 'text-slate-500';
    timerTextColor = 'text-slate-700';
    timerUrgentColor = 'text-yellow-600 animate-pulse';
    timerCriticalColor = 'text-red-600 font-bold animate-pulse';
    timerBgClass = 'bg-gray-100/70 border-gray-300/80';
    activeTimerHighlightClass = 'ring-1 ring-sky-600/70 shadow-[0_0_8px_rgba(14,165,233,0.25)]';
  }
  
  const highlightClasses = isCurrentTurn 
    ? `${currentThemeBorder} ring-2 ${theme === 'dark' ? 'ring-offset-slate-800/50 shadow-lg shadow-current' : 'ring-offset-gray-100/50 shadow-lg shadow-current'}`
    : baseBorder;

  const currentShadowColor = playerColor === PlayerColor.WHITE ? 
    (theme === 'dark' ? 'rgba(251, 113, 133, 0.3)' : 'rgba(220, 38, 38, 0.2)') :
    (theme === 'dark' ? 'rgba(34, 211, 238, 0.3)' : 'rgba(37, 99, 235, 0.2)');

  let timerDisplayColor = timerTextColor;
  if (typeof timeLeft === 'number') {
    if (timeLeft <= 30) timerDisplayColor = timerCriticalColor;
    else if (timeLeft <= 60) timerDisplayColor = timerUrgentColor;
  }
  
  const showTimer = typeof timeLimit === 'number';
  const timerContainerClasses = `
    mb-1 sm:mb-1.5 p-1 sm:p-1.5 rounded-md shadow-inner text-center 
    ${timerBgClass} 
    ${isCurrentTurn && showTimer ? activeTimerHighlightClass : ''}
    transition-all duration-200
  `;
  
  const avatarIconColor = getPieceIconColor(avatarPieceForDisplay.color, theme, layoutSettings);
  const avatarIconSize = "32px"; 

  const capturedPieceIconSize = "18px";


  return (
    <div
      className={`w-full max-w-lg p-1.5 sm:p-2 rounded-xl shadow-xl ${panelBg} backdrop-blur-lg border-2 flex items-start space-x-2 sm:space-x-3 ${highlightClasses} transition-all duration-250 ease-in-out`}
      style={{ '--shadow-color': currentShadowColor } as React.CSSProperties}
    >
      <div className="flex flex-col items-center justify-start w-12 sm:w-14 flex-shrink-0 pt-0.5">
        <PieceDisplay 
            piece={avatarPieceForDisplay} 
            size={avatarIconSize}
            color={avatarIconColor}
            className="mb-0.5 sm:mb-1"
        />
        <p className={`text-xs sm:text-sm font-semibold ${nameTextColor} text-center break-words w-full`}>
          {playerName}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        {showTimer && (
          <div className={timerContainerClasses}>
            <p className={`text-base sm:text-lg font-mono font-semibold ${timerDisplayColor} transition-colors duration-300`} aria-label={`${playerName} time left: ${formatTime(timeLeft)}`}>
              {formatTime(timeLeft)}
            </p>
          </div>
        )}
        <h4 className={`text-[0.65rem] sm:text-xs leading-tight font-medium mb-1 ${capturedLabelColor}`}>
          Captured:
        </h4>
        <div className="captured-pieces-container"> 
          {capturedPieces.length === 0 ? (
            <p className={`text-[0.65rem] sm:text-xs italic py-0.5 ${noCapturedTextColor}`}>No pieces captured.</p>
          ) : (
            <div className="flex flex-wrap gap-x-0.5 gap-y-0.5 items-center min-h-[1.1rem] sm:min-h-[1.3rem]">
              {capturedPieces.map((piece, index) => (
                <div
                  key={`${piece.id}-${index}-${piece.type}`} 
                  className="flex items-center justify-center" 
                  title={`${piece.color} ${piece.type}`}
                >
                  <PieceDisplay 
                    piece={piece} 
                    size={capturedPieceIconSize}
                    color={getPieceIconColor(piece.color, theme, layoutSettings)}
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PlayerDisplayPanel;