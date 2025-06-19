import React from 'react';
import { SquareState, Position, Theme, LayoutSettings, PlayerColor } from '../types';
import PieceDisplay from './PieceDisplay';
import { BoardStyleClasses } from '../utils/styleUtils';

interface SquareProps {
  squareState: SquareState;
  position: Position;
  isLightSquare: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  isKingInCheck: boolean;
  onClick: (pos: Position) => void;
  theme: Theme;
  boardClasses: BoardStyleClasses;
  layoutSettings: LayoutSettings;
  isLastMoveFromSquare: boolean; // New prop
  isLastMoveToSquare: boolean;   // New prop
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
  boardClasses,
  layoutSettings,
  isLastMoveFromSquare, // Destructure
  isLastMoveToSquare,   // Destructure
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
  
  const kingCheckPulseClass = theme === 'dark' 
    ? 'animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite] bg-red-700/50 border-red-500/70' 
    : 'animate-[pulse_1.5s_cubic-bezier(0.4,0,0.6,1)_infinite] bg-red-400/50 border-red-300/70';

  const squareClasses = [
    'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16',
    'flex items-center justify-center relative', // Ensure relative positioning for overlay
    currentBg,
    currentRing,
    'transition-all duration-150',
    isKingInCheck && !isSelected ? kingCheckPulseClass : ''
  ].filter(Boolean).join(' ');

  const showLastMoveHighlight = isLastMoveFromSquare || isLastMoveToSquare;

  return (
    <div
      className={squareClasses}
      onClick={() => onClick(position)}
      role="button"
      tabIndex={0}
      aria-label={`Square ${String.fromCharCode(97 + position[1])}${8 - position[0]}${squareState ? `, ${squareState.color} ${squareState.type}` : ''}${isSelected ? ', selected' : ''}${isPossibleMove ? ', possible move' : ''}${showLastMoveHighlight ? ', part of last move' : ''}`}
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
            aria-hidden="true"
          ></div>
        </div>
      )}
      {showLastMoveHighlight && (
        <div 
          className={`absolute inset-0 ${boardClasses.lastMoveSquareOverlay}`} 
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default Square;