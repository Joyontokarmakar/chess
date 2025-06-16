import React from 'react';
import { SquareState, Position } from '../types';
import PieceDisplay from './PieceDisplay';

interface SquareProps {
  squareState: SquareState;
  position: Position;
  isLightSquare: boolean;
  isSelected: boolean;
  isPossibleMove: boolean;
  isKingInCheck: boolean;
  onClick: (pos: Position) => void;
}

const Square: React.FC<SquareProps> = ({
  squareState,
  position,
  isLightSquare,
  isSelected,
  isPossibleMove,
  isKingInCheck,
  onClick,
}) => {
  // Updated colors for classic theme
  let bgColor = isLightSquare ? 'bg-stone-100' : 'bg-stone-500'; // Light: off-white, Dark: medium gray
  if (isSelected) {
    bgColor = 'bg-yellow-400 text-slate-800'; // Selected square, ensure text contrast if piece is on it
  }
  
  const squareClasses = [
    'w-10 h-10 sm:w-12 sm:h-12 md:w-14 md:h-14 lg:w-16 lg:h-16',
    'flex items-center justify-center relative',
    bgColor,
    'transition-colors duration-100', // Faster transition
    isKingInCheck && !isSelected ? 'king-check-pulse' : '' 
  ].join(' ');


  return (
    <div
      className={squareClasses}
      onClick={() => onClick(position)}
      role="button"
      tabIndex={0}
      aria-label={`Square ${String.fromCharCode(97 + position[1])}${8 - position[0]}${squareState ? `, ${squareState.color} ${squareState.type}` : ''}${isSelected ? ', selected' : ''}${isPossibleMove ? ', possible move' : ''}`}
    >
      {squareState && <PieceDisplay piece={squareState} />}
      {isPossibleMove && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          {/* Dot for empty square, ring for capture */}
          <div className={`w-1/3 h-1/3 rounded-full ${squareState ? 'ring-2 ring-red-500 ring-inset' : 'bg-teal-500 opacity-60'}`}></div>
        </div>
      )}
    </div>
  );
};

export default Square;