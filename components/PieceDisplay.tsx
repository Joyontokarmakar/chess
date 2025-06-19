import React from 'react';
import { Piece, PlayerColor, Theme, PieceColorOption } from '../types';
import { PIECE_SYMBOLS } from '../constants';
import { getPieceClasses } from '../utils/styleUtils'; // Import the utility function

interface PieceDisplayProps {
  piece: Piece;
  pieceColorOptionId: PieceColorOption;
  theme: Theme; 
  className?: string; // Added optional className prop
}

const PieceDisplay: React.FC<PieceDisplayProps> = ({ piece, pieceColorOptionId, theme, className }) => {
  const symbol = PIECE_SYMBOLS[piece.color][piece.type];
  
  // Use getPieceClasses to determine the styling based on the new prop
  const pieceStyle = getPieceClasses(pieceColorOptionId, piece.color, theme);

  return (
    <span 
      className={`chess-piece ${pieceStyle.colorClass} ${className || ''}`} // Apply the determined class and any passed className
      role="img" 
      aria-label={`${piece.color} ${piece.type}`}
    >
      {symbol}
    </span>
  );
};

export default PieceDisplay;