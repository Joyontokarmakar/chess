import React from 'react';
import { SquareState, Position, Theme, LayoutSettings, PlayerColor } from '../types';
import PieceDisplay from './PieceDisplay';
import { BoardStyleClasses } from '../utils/styleUtils'; // Assuming BoardStyleClasses is exported from styleUtils

interface SquareProps {
  squareState: SquareState;
  position: Position;
  isLightSquare: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  isKingInCheck: boolean;
  onClick: (pos: Position) => void;
  theme: Theme;
  boardClasses: BoardStyleClasses; // Use pre-calculated board style classes
  layoutSettings: LayoutSettings; // Pass full layout settings for PieceDisplay
}

const Square: React.FC<SquareProps> = ({
  squareState,
  position,
  isLightSquare,
  isSelected,
  isPossibleMove,
  isKingInCheck,
  onClick,
  theme,
  boardClasses, // Destructure passed board classes
  layoutSettings, // Destructure layoutSettings
}) => {
  const bgColorClass = isLightSquare ? boardClasses.lightSquare : boardClasses.darkSquare;
  const selectedBgColorClass = boardClasses.selectedSquareBg;
  const selectedRingClass = boardClasses.selectedSquareRing;
  const possibleMoveDotClass = boardClasses.possibleMoveDot;
  const possibleMoveRingClass = boardClasses.possibleMoveRing;
  
  let currentBg = bgColorClass;
  let currentRing = '';

  if (isSelected) {
    currentBg = selectedBgColorClass;
    currentRing = selectedRingClass;
  }
  
  // king-check-pulse can remain theme-dependent or be moved into BOARD_STYLE_CONFIG if needed
  const kingCheckPulseClass = theme === 'dark' 
    ? 'animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite] bg-red-700/50 border-red-500/70' 
    : 'animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite] bg-red-400/50 border-red-300/70';

  const squareClasses = [
    'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16',
    'flex items-center justify-center relative',
    currentBg,
    currentRing,
    'transition-all duration-150',
    isKingInCheck && !isSelected ? kingCheckPulseClass : '' // Use a more explicit class for king in check
  ].filter(Boolean).join(' ');


  return (
    <div
      className={squareClasses}
      onClick={() => onClick(position)}
      role="button"
      tabIndex={0}
      aria-label={`Square ${String.fromCharCode(97 + position[1])}${8 - position[0]}${squareState ? `, ${squareState.color} ${squareState.type}` : ''}${isSelected ? ', selected' : ''}${isPossibleMove ? ', possible move' : ''}`}
    >
      {squareState && (
        <PieceDisplay 
          piece={squareState} 
          pieceColorOptionId={squareState.color === PlayerColor.WHITE ? layoutSettings.whitePieceColor : layoutSettings.blackPieceColor}
          theme={theme}
        />
      )}
      {isPossibleMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div 
            className={`w-1/3 h-1/3 rounded-full 
            ${squareState ? possibleMoveRingClass : possibleMoveDotClass}`}
          ></div>
        </div>
      )}
    </div>
  );
};

export default Square;