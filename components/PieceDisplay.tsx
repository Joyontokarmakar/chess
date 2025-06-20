import React from 'react';
import { Piece } from '../types';
import { PIECE_ICON_COMPONENTS } from '../constants';

interface PieceDisplayProps {
  piece: Piece;
  size: string | number; // e.g., "24px", 24, "80%"
  color: string; // Hex color string, e.g., "#FFFFFF"
  className?: string; // For additional wrapper styling if needed
}

const PieceDisplay: React.FC<PieceDisplayProps> = ({ piece, size, color, className }) => {
  const IconComponent = PIECE_ICON_COMPONENTS[piece.type];

  if (!IconComponent) {
    // Fallback for an unknown piece type, though this shouldn't happen with valid PieceType
    return <span className={className}>?</span>;
  }
  
  // The 'chess-icon-display' class can be used for common layout needs,
  // but sizing and color are primarily controlled by props.
  // The className prop allows for additional Tailwind classes, e.g., for margins.
  return (
    <IconComponent 
      size={size} 
      color={color}
      className={`chess-icon-display ${className || ''}`} 
      aria-label={`${piece.color} ${piece.type}`}
      style={{ verticalAlign: 'middle' }} // Ensures good alignment if used inline
    />
  );
};

export default PieceDisplay;