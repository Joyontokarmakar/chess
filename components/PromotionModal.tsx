import React from 'react';
import { PieceType, PlayerColor } from '../types';
import { PIECE_SYMBOLS } from '../constants';

interface PromotionModalProps {
  playerColor: PlayerColor;
  onPromote: (pieceType: PieceType) => void;
}

const PromotionModal: React.FC<PromotionModalProps> = ({ playerColor, onPromote }) => {
  const promotionPieces: PieceType[] = [
    PieceType.QUEEN,
    PieceType.ROOK,
    PieceType.BISHOP,
    PieceType.KNIGHT,
  ];

  const pieceColorStyle = playerColor === PlayerColor.WHITE ? 'text-red-800' : 'text-teal-500';

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <div className="bg-stone-50 border border-stone-300 p-6 sm:p-8 rounded-lg shadow-xl">
        <h3 className="text-lg sm:text-xl text-slate-700 font-semibold mb-5 text-center">Promote Pawn to:</h3>
        <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
          {promotionPieces.map((type) => (
            <button
              key={type}
              onClick={() => onPromote(type)}
              className={`p-3 sm:p-4 bg-stone-200 hover:bg-stone-300 rounded-md text-4xl sm:text-5xl ${pieceColorStyle} transition-all duration-150 ease-in-out transform hover:scale-110 shadow hover:shadow-md`}
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