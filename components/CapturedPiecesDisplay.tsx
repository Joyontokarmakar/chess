import React from 'react';
import { Piece, PlayerColor, Theme, LayoutSettings } from '../types';
import PieceDisplay from './PieceDisplay';
import { getPieceIconColor } from '../utils/styleUtils';


interface CapturedPiecesDisplayProps {
  pieces: Piece[];
  playerName: string;
  capturingPlayerColor: PlayerColor; 
  theme: Theme;
  layoutSettings: LayoutSettings; // Added layoutSettings
}

const CapturedPiecesDisplay: React.FC<CapturedPiecesDisplayProps> = ({ pieces, playerName, capturingPlayerColor, theme, layoutSettings }) => {
  const titleColor = capturingPlayerColor === PlayerColor.WHITE 
    ? (theme === 'dark' ? 'text-rose-400' : 'text-red-600')
    : (theme === 'dark' ? 'text-cyan-400' : 'text-blue-600');
  
  const panelClasses = theme === 'dark' 
    ? 'bg-slate-700/20 backdrop-blur-sm border-slate-600/30' 
    : 'bg-white/40 backdrop-blur-sm border-gray-300/50';

  const placeholderTextClass = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';

  const capturedPieceIconSize = "16px";

  if (pieces.length === 0) {
    return (
      <div className={`w-full max-w-xs md:max-w-sm lg:max-w-md p-2 rounded-lg shadow-sm min-h-[3rem] flex flex-col justify-center ${panelClasses}`}>
        <h4 className={`text-xs sm:text-sm font-semibold mb-0.5 ${titleColor}`}>
          {`${playerName}'s captures:`}
        </h4>
        <p className={`text-xs italic text-center py-1 ${placeholderTextClass}`}>No pieces captured yet.</p>
      </div>
    );
  }


  return (
    <div className={`w-full max-w-xs md:max-w-sm lg:max-w-md p-2 rounded-lg shadow-sm ${panelClasses}`}>
      <h4 className={`text-xs sm:text-sm font-semibold mb-0.5 ${titleColor}`}>
         {`${playerName} captured:`}
      </h4>
      <div className="flex flex-wrap gap-x-0.5 gap-y-0.5 justify-start items-center min-h-[1.2rem]">
        {pieces.map((piece, index) => (
          <div 
            key={`${piece.id}-${index}-${piece.type}`} 
            className="w-auto h-auto flex items-center justify-center p-px"
            title={`${piece.color} ${piece.type}`}
          >
            <PieceDisplay 
              piece={piece}
              size={capturedPieceIconSize} 
              color={getPieceIconColor(piece.color, theme, layoutSettings)}
              pieceSetId={layoutSettings.pieceSetId}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

export default CapturedPiecesDisplay;