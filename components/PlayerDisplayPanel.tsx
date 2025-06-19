import React from 'react';
import { Piece, PlayerColor, PieceType, Theme, LayoutSettings } from '../types'; 
import { PIECE_SYMBOLS } from '../constants';
import PieceDisplay from './PieceDisplay';

interface PlayerDisplayPanelProps {
  playerName: string;
  playerColor: PlayerColor;
  capturedPieces: Piece[];
  isCurrentTurn: boolean;
  theme: Theme;
  layoutSettings: LayoutSettings; // Added layoutSettings prop
}

const PlayerDisplayPanel: React.FC<PlayerDisplayPanelProps> = ({
  playerName,
  playerColor,
  capturedPieces,
  isCurrentTurn,
  theme,
  layoutSettings, // Destructure layoutSettings
}) => {
  const avatarSymbol = PIECE_SYMBOLS[playerColor][PieceType.KING];
  const avatarPieceColorOption = playerColor === PlayerColor.WHITE ? layoutSettings.whitePieceColor : layoutSettings.blackPieceColor;
  
  let themeColorText = ''; // This will be determined by getPieceClasses for the avatar
  let themeColorBorder = '';
  let panelBg = '';
  let baseBorder = '';
  let nameTextColor = ''; // This can remain theme-based or also derive from layoutSettings if needed
  let capturedLabelColor = '';
  let noCapturedTextColor = '';

  // For avatar, use PieceDisplay to ensure consistent styling
  const avatarPieceForDisplay: Piece = { 
    id: `avatar-${playerColor}`, 
    type: PieceType.KING, 
    color: playerColor, 
    hasMoved: true 
  };


  if (theme === 'dark') {
    // themeColorText is handled by PieceDisplay for avatar
    themeColorBorder = playerColor === PlayerColor.WHITE ? 'border-rose-500/70 ring-rose-500/60' : 'border-cyan-400/70 ring-cyan-400/60';
    panelBg = playerColor === PlayerColor.WHITE ? 'bg-slate-700/30' : 'bg-slate-750/30';
    baseBorder = 'border-slate-600/40';
    nameTextColor = playerColor === PlayerColor.WHITE ? 'text-rose-400' : 'text-cyan-400'; // Example: keep name color theme-based or customize further
    capturedLabelColor = 'text-slate-300';
    noCapturedTextColor = 'text-slate-400';
  } else { // Light theme
    // themeColorText is handled by PieceDisplay for avatar
    themeColorBorder = playerColor === PlayerColor.WHITE ? 'border-red-500/60 ring-red-500/50' : 'border-blue-500/60 ring-blue-500/50';
    panelBg = playerColor === PlayerColor.WHITE ? 'bg-white/50' : 'bg-slate-50/60';
    baseBorder = 'border-gray-300/60';
    nameTextColor = playerColor === PlayerColor.WHITE ? 'text-red-700' : 'text-blue-700';
    capturedLabelColor = 'text-slate-600';
    noCapturedTextColor = 'text-slate-500';
  }
  
  const highlightClasses = isCurrentTurn 
    ? `${themeColorBorder} ring-2 ${theme === 'dark' ? 'ring-offset-slate-800/50 shadow-lg shadow-current' : 'ring-offset-gray-100/50 shadow-lg shadow-current'}`
    : baseBorder;

  const currentShadowColor = playerColor === PlayerColor.WHITE ? 
    (theme === 'dark' ? 'rgba(251, 113, 133, 0.3)' : 'rgba(220, 38, 38, 0.2)') : // Rose/Red
    (theme === 'dark' ? 'rgba(34, 211, 238, 0.3)' : 'rgba(37, 99, 235, 0.2)'); // Cyan/Blue

  return (
    <div
      className={`w-full max-w-lg p-3 sm:p-4 rounded-xl shadow-xl ${panelBg} backdrop-blur-lg border-2 flex items-start space-x-3 sm:space-x-4 ${highlightClasses} transition-all duration-250 ease-in-out`}
      style={{ '--shadow-color': currentShadowColor } as React.CSSProperties}
    >
      <div className="flex flex-col items-center justify-start w-16 sm:w-20 flex-shrink-0 pt-1">
        {/* Use PieceDisplay for the avatar King symbol */}
        <PieceDisplay 
            piece={avatarPieceForDisplay} 
            pieceColorOptionId={avatarPieceColorOption}
            theme={theme} 
        />
        <p className={`mt-1.5 text-sm sm:text-base font-semibold ${nameTextColor} text-center break-words w-full`}>
          {playerName}
        </p>
      </div>

      <div className="flex-1 min-w-0">
        <h4 className={`text-xs sm:text-sm font-medium mb-1.5 ${capturedLabelColor}`}>
          Captured:
        </h4>
        {capturedPieces.length === 0 ? (
          <p className={`text-xs sm:text-sm italic py-1 ${noCapturedTextColor}`}>No pieces captured.</p>
        ) : (
          <div className="flex flex-wrap gap-x-0.5 gap-y-0.5 items-center captured-piece min-h-[2.5rem]">
            {capturedPieces.map((piece) => (
              <div
                key={`${piece.id}-${piece.color}-${piece.type}`} // Make key more robust for captured pieces
                className="w-6 h-6 sm:w-7 sm:h-7 flex items-center justify-center"
                title={`${piece.color} ${piece.type}`}
              >
                <PieceDisplay 
                  piece={piece} 
                  // Determine which color option to use based on the captured piece's actual color
                  pieceColorOptionId={piece.color === PlayerColor.WHITE ? layoutSettings.whitePieceColor : layoutSettings.blackPieceColor}
                  theme={theme}
                />
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default PlayerDisplayPanel;
