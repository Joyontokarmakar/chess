import React from 'react';
import { PieceType, PlayerColor, Theme } from '../types';
import { PIECE_SYMBOLS } from '../constants';

interface PromotionModalProps {
  playerColor: PlayerColor;
  onPromote: (pieceType: PieceType) => void;
  theme: Theme;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ playerColor, onPromote, theme }) => {
  const promotionPieces: PieceType[] = [
    PieceType.QUEEN,
    PieceType.ROOK,
    PieceType.BISHOP,
    PieceType.KNIGHT,
  ];

  const modalBgClass = theme === 'dark' ? 'bg-slate-700/50 backdrop-blur-2xl border-slate-500/40' : 'bg-white/70 backdrop-blur-2xl border-gray-300/60';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const buttonBgClass = theme === 'dark' ? 'bg-slate-600/60 border-slate-500/50' : 'bg-gray-200/70 border-gray-400/60';
  const overlayBgClass = theme === 'dark' ? 'bg-black/80 backdrop-blur-xl' : 'bg-black/60 backdrop-blur-lg';


  let pieceColorStyle = '';
  let buttonHoverBg = '';
  let focusRingClass = '';

  if (theme === 'dark') {
    pieceColorStyle = playerColor === PlayerColor.WHITE ? 'text-rose-500' : 'text-cyan-400';
    buttonHoverBg = playerColor === PlayerColor.WHITE ? 'hover:bg-rose-500/30' : 'hover:bg-cyan-400/30';
    focusRingClass = playerColor === PlayerColor.WHITE ? 'focus:ring-rose-400' : 'focus:ring-cyan-400';
  } else { // Light theme
    pieceColorStyle = playerColor === PlayerColor.WHITE ? 'text-red-600' : 'text-blue-600';
    buttonHoverBg = playerColor === PlayerColor.WHITE ? 'hover:bg-red-500/20' : 'hover:bg-blue-500/20';
    focusRingClass = playerColor === PlayerColor.WHITE ? 'focus:ring-red-400' : 'focus:ring-blue-400';
  }


  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-50 p-4`}>
      <div className={`${modalBgClass} p-6 sm:p-8 rounded-xl shadow-2xl ${theme === 'dark' ? 'shadow-black/50' : 'shadow-gray-500/40'}`}>
        <h3 className={`text-lg sm:text-xl font-semibold mb-6 text-center ${titleColorClass}`}>Promote Pawn to:</h3>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {promotionPieces.map((type) => (
            <button
              key={type}
              onClick={() => onPromote(type)}
              className={`p-3 sm:p-4 ${buttonBgClass} ${buttonHoverBg} rounded-lg text-4xl sm:text-5xl ${pieceColorStyle} transition-all duration-150 ease-in-out transform hover:scale-110 shadow-lg hover:shadow-xl backdrop-blur-md focus:outline-none focus:ring-2 ${focusRingClass}`}
              aria-label={`Promote to ${type}`}
            >
              {PIECE_SYMBOLS[playerColor][type]}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default PromotionModal;