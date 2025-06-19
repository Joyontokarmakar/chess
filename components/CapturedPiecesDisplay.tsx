import React from 'react';
import { Piece, PlayerColor, Theme, LayoutSettings } from '../types';
import PieceDisplay from './PieceDisplay';

interface CapturedPiecesDisplayProps {
  pieces: Piece[];
  playerName: string;
  // playerColor indicates whose pieces these are (the ones that were captured)
  // For display, we want to know who captured them to style the name appropriately
  capturingPlayerColor: PlayerColor; 
  theme: Theme;
  layoutSettings: LayoutSettings;
}

const CapturedPiecesDisplay: React.FC<CapturedPiecesDisplayProps> = ({ pieces, playerName, capturingPlayerColor, theme, layoutSettings }) => {
  if (pieces.length === 0) {
    // Render a placeholder to maintain layout consistency if desired, or null
    return (
      <div className="w-full max-w-xs md:max-w-sm lg:max-w-md p-3 bg-stone-100/70 border border-stone-300 rounded-lg shadow-sm min-h-[6rem] flex flex-col justify-center">
        <h4 className={`text-xs sm:text-sm font-semibold mb-1 ${capturingPlayerColor === PlayerColor.WHITE ? 'text-red-700' : 'text-teal-600'}`}>
          {`${playerName}'s captures:`}
        </h4>
        <p className="text-xs text-stone-500 italic text-center py-2">No pieces captured yet.</p>
      </div>
    );
  }

  const titleColor = capturingPlayerColor === PlayerColor.WHITE ? 'text-red-700' : 'text-teal-600';

  return (
    <div className="w-full max-w-xs md:max-w-sm lg:max-w-md p-3 bg-stone-100/70 backdrop-blur-xs border border-stone-300 rounded-lg shadow-sm">
      <h4 className={`text-xs sm:text-sm font-semibold mb-1 ${titleColor}`}>
         {`${playerName} captured:`}
      </h4>
      <div className="flex flex-wrap gap-x-1 gap-y-0.5 justify-start items-center min-h-[2.5rem] captured-piece">
        {pieces.map((piece, index) => (
          // Ensure key is unique for list items, piece.id might not be unique if multiple same pieces captured
          <div key={`${piece.id}-${index}-${piece.type}-${index}`} className="w-5 h-5 sm:w-6 sm:h-6 flex items-center justify-center" title={`${piece.color} ${piece.type}`}>
            <PieceDisplay 
              piece={piece}
              theme={theme}
              pieceColorOptionId={piece.color === PlayerColor.WHITE ? layoutSettings.whitePieceColor : layoutSettings.blackPieceColor}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CapturedPiecesDisplay;