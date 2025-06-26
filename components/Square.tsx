
import React from 'react';
import { SquareState, Position, Theme, LayoutSettings, PlayerColor } from '../types';
import PieceDisplay from './PieceDisplay';
import { BoardStyleClasses, getPieceIconColor } from '../utils/styleUtils';

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
  isLastMoveFromSquare: boolean; 
  isLastMoveToSquare: boolean;
  lastMoveForFlashKey: { from: Position; to: Position } | null;
  isHintFromSquare: boolean; // New prop for hint
  isHintToSquare: boolean;   // New prop for hint
  hintKey?: string; // To re-trigger hint animation
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
  isLastMoveFromSquare,
  isLastMoveToSquare,
  lastMoveForFlashKey,
  isHintFromSquare,
  isHintToSquare,
  hintKey,
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
    'flex items-center justify-center relative rounded',
    currentBg,
    currentRing,
    'transition-all duration-150',
    isKingInCheck && !isSelected ? kingCheckPulseClass : ''
  ].filter(Boolean).join(' ');

  const showLastMoveHighlight = isLastMoveFromSquare || isLastMoveToSquare;
  const showHintHighlight = isHintFromSquare || isHintToSquare;

  const flashKey = lastMoveForFlashKey 
    ? `lm-${lastMoveForFlashKey.from.join('')}-${lastMoveForFlashKey.to.join('')}-${position.join('')}` 
    : `initial-${position.join('')}`;

  const [row, col] = position;
  const algebraicNotation = `${String.fromCharCode(97 + col)}${8 - row}`;

  // Conditions to show labels on the edges of the board for a clean look
  const showRankLabel = col === 0; // Show rank on 'a' file
  const rankLabel = `${8 - row}`;

  const showFileLabel = row === 7; // Show file on 1st rank
  const fileLabel = String.fromCharCode(97 + col);

  // A subtle text color that has decent contrast on both light and dark squares for each theme.
  const notationColorClass = 'text-stone-700/50 dark:text-slate-300/50';

  return (
    <div
      className={squareClasses}
      onClick={() => onClick(position)}
      role="button"
      tabIndex={0}
      aria-label={`Square ${algebraicNotation}${squareState ? `, ${squareState.color} ${squareState.type}` : ''}${isSelected ? ', selected' : ''}${isPossibleMove ? ', possible move' : ''}${showLastMoveHighlight ? ', part of last move' : ''}${showHintHighlight ? ', part of hint' : ''}`}
    >
      {showRankLabel && (
        <span className={`absolute top-0.5 left-1 text-[0.6rem] font-bold select-none pointer-events-none ${notationColorClass}`}>
          {rankLabel}
        </span>
      )}
      {showFileLabel && (
        <span className={`absolute bottom-0.5 right-1 text-[0.6rem] font-bold select-none pointer-events-none ${notationColorClass}`}>
          {fileLabel}
        </span>
      )}

      {squareState && (
        <PieceDisplay 
          piece={squareState} 
          size="80%"
          color={getPieceIconColor(squareState.color, theme, layoutSettings)}
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
        <>
          <div 
            className={`absolute inset-0 ${boardClasses.lastMoveSquareOverlay} rounded`} 
            aria-hidden="true"
          ></div>
          <div
            className="last-move-flash"
            key={flashKey}
            style={{
              '--last-move-flash-color-start': boardClasses.lastMoveFlashColorStart,
              '--last-move-flash-color-mid': boardClasses.lastMoveFlashColorMid,
              '--last-move-flash-color-end': boardClasses.lastMoveFlashColorEnd,
            } as React.CSSProperties}
            aria-hidden="true"
          ></div>
        </>
      )}
      {showHintHighlight && hintKey && (
        <div 
          key={`hint-${hintKey}-${position.join('')}`} 
          className="hint-highlight" 
          aria-hidden="true"
        ></div>
      )}
    </div>
  );
};

export default Square;
