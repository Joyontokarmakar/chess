import React from 'react';
import { Piece, PlayerColor } from '../types';
import { PIECE_SYMBOLS } from '../constants';

interface PieceDisplayProps {
  piece: Piece;
}

const PieceDisplay: React.FC<PieceDisplayProps> = ({ piece }) => {
  const symbol = PIECE_SYMBOLS[piece.color][piece.type];
  // Updated colors for new classic theme
  const colorClass = piece.color === PlayerColor.WHITE ? 'text-red-800' : 'text-teal-500';

  return (
    <span className={`chess-piece ${colorClass}`} role="img" aria-label={`${piece.color} ${piece.type}`}>
      {symbol}
    </span>
  );
};

export default PieceDisplay;