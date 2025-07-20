import React from 'react';
import { Theme, PlayerColor, PieceType, Piece, LayoutSettings } from '../types';
import PieceDisplay from './PieceDisplay';
import { getPieceIconColor } from '../utils/styleUtils';


interface ChessGuideProps {
  isOpen: boolean;
  onClose: () => void;
  theme: Theme;
  layoutSettings: LayoutSettings; // Added layoutSettings
}

interface PieceInfo {
  name: string;
  pieceType: PieceType; 
  description: string;
  movement: React.ReactNode; 
  special?: string;
}

const PieceMovementExample: React.FC<{ cells: string[][] }> = ({ cells }) => {
  const cellBaseClass = "w-6 h-6 sm:w-7 sm:h-7 border border-gray-400/50 dark:border-gray-600/50 flex items-center justify-center text-xs";
  const pieceExampleLetterClass = "text-lg sm:text-xl font-semibold"; 
  const moveClass = "text-green-500 dark:text-green-400 font-bold";
  const captureClass = "text-red-500 dark:text-red-400 font-bold";

  return (
    <div className="grid grid-cols-5 gap-0.5 my-2 bg-gray-200 dark:bg-gray-700 p-1 rounded">
      {cells.flat().map((cell, index) => {
        let content: React.ReactNode = cell;
        let className = cellBaseClass;
        if (['P', 'R', 'N', 'B', 'Q', 'K'].includes(cell)) {
          className += ` ${pieceExampleLetterClass}`;
        } else if (cell === '•') {
          className += ` ${moveClass}`;
        } else if (cell === '✕') {
            className += ` ${captureClass}`;
        }
        const isDarkSquare = (Math.floor(index / 5) + (index % 5)) % 2 !== 0;
        className += isDarkSquare ? ' bg-gray-300 dark:bg-gray-600' : ' bg-gray-100 dark:bg-gray-500';
        
        return <div key={index} className={className}>{content}</div>;
      })}
    </div>
  );
};

const GuidePiece: React.FC<{ type: PieceType; color: PlayerColor; theme: Theme; layoutSettings: LayoutSettings; className?: string }> = ({ type, color, theme, layoutSettings, className }) => {
  const piece: Piece = { id: `guide-${type}`, type, color, hasMoved: false };
  return (
    <PieceDisplay
      piece={piece}
      size="1em" 
      color={getPieceIconColor(color, theme, layoutSettings)}
      className={`inline-block align-middle mx-px ${className || ''}`}
      pieceSetId={layoutSettings.pieceSetId}
    />
  );
};


const ChessGuide: React.FC<ChessGuideProps> = ({ isOpen, onClose, theme, layoutSettings }) => {
  if (!isOpen) return null;

  const modalBgClass = theme === 'dark' ? 'bg-slate-800/90 backdrop-blur-xl border-slate-700/70' : 'bg-white/90 backdrop-blur-xl border-gray-300/70';
  const titleColorClass = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const textColorClass = theme === 'dark' ? 'text-slate-300' : 'text-slate-700';
  const sectionTitleColorClass = theme === 'dark' ? 'text-sky-300' : 'text-sky-600';
  const strongTextColor = theme === 'dark' ? 'text-slate-100 font-semibold' : 'text-slate-900 font-semibold';
  const overlayBgClass = theme === 'dark' ? 'bg-black/70 backdrop-blur-lg' : 'bg-black/50 backdrop-blur-md';
  const buttonBase = `font-semibold py-2.5 px-6 rounded-lg text-base shadow-lg hover:shadow-xl transition-all duration-200 ease-in-out transform hover:-translate-y-0.5 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75`;
  const closeButtonClass = `${buttonBase} ${theme === 'dark' ? 'bg-gradient-to-r from-red-600/90 via-rose-700/90 to-pink-700/90 hover:from-red-600/95 hover:via-rose-700/95 hover:to-pink-700/95 text-white focus-visible:ring-rose-400 shadow-rose-500/30 hover:shadow-rose-500/40' : 'bg-gradient-to-r from-red-500 via-rose-600 to-pink-600 hover:from-red-600 hover:via-rose-700 hover:to-pink-700 text-white focus-visible:ring-rose-400 shadow-rose-600/30 hover:shadow-rose-600/40'}`;
  const hrClass = `my-4 sm:my-5 ${theme === 'dark' ? 'border-slate-700' : 'border-gray-300'}`;


  const piecesData: PieceInfo[] = [
    {
      name: 'Pawn',
      pieceType: PieceType.PAWN,
      description: "Moves one square forward, but two on its first move. Captures diagonally one square forward. Cannot move backward.",
      movement: <PieceMovementExample cells={[
        ['', '', '', '', ''],
        ['', '✕', '•', '✕', ''],
        ['', '', 'P', '', ''],
        ['', '', '•', '', ''],
        ['', '', '', '', '']
      ]} />,
      special: "Promotion: If a pawn reaches the opponent's back rank, it can be promoted to a Queen, Rook, Bishop, or Knight. En Passant: A special capture that can occur when an opponent's pawn moves two squares forward from its starting position and lands beside your pawn."
    },
    {
      name: 'Rook',
      pieceType: PieceType.ROOK,
      description: "Moves any number of squares horizontally or vertically. Cannot jump over other pieces.",
      movement: <PieceMovementExample cells={[
        ['', '', '•', '', ''],
        ['', '', '•', '', ''],
        ['•', '•', 'R', '•', '•'],
        ['', '', '•', '', ''],
        ['', '', '•', '', '']
      ]} />,
      special: "Part of Castling."
    },
    {
      name: 'Knight',
      pieceType: PieceType.KNIGHT,
      description: "Moves in an 'L' shape: two squares in one direction (horizontal or vertical) and then one square perpendicular. It's the only piece that can jump over other pieces.",
      movement: <PieceMovementExample cells={[
        ['', '•', '', '•', ''],
        ['•', '', '', '', '•'],
        ['', '', 'N', '', ''],
        ['•', '', '', '', '•'],
        ['', '•', '', '•', '']
      ]} />
    },
    {
      name: 'Bishop',
      pieceType: PieceType.BISHOP,
      description: "Moves any number of squares diagonally. Each bishop stays on squares of one color (light or dark). Cannot jump over other pieces.",
      movement: <PieceMovementExample cells={[
        ['•', '', '', '', '•'],
        ['', '•', '', '•', ''],
        ['', '', 'B', '', ''],
        ['', '•', '', '•', ''],
        ['•', '', '', '', '•']
      ]} />
    },
    {
      name: 'Queen',
      pieceType: PieceType.QUEEN,
      description: "The most powerful piece. Moves any number of squares horizontally, vertically, or diagonally. Cannot jump over other pieces.",
      movement: <PieceMovementExample cells={[
        ['•', '', '•', '', '•'],
        ['', '•', '•', '•', ''],
        ['•', '•', 'Q', '•', '•'],
        ['', '•', '•', '•', ''],
        ['•', '', '•', '', '•']
      ]} />
    },
    {
      name: 'King',
      pieceType: PieceType.KING,
      description: "Moves one square in any direction (horizontally, vertically, or diagonally). The King is the most important piece; if it's trapped (checkmate), the game is over.",
      movement: <PieceMovementExample cells={[
        ['', '', '', '', ''],
        ['', '•', '•', '•', ''],
        ['', '•', 'K', '•', ''],
        ['', '•', '•', '•', ''],
        ['', '', '', '', '']
      ]} />,
      special: `Castling: A special defensive move involving the King and one of the Rooks. Conditions: Neither the King nor the Rook has moved, there are no pieces between them, the King is not in check, and the King does not pass through or land on a square that is attacked by an enemy piece.`
    },
  ];

  const renderSection = (title: string, content: React.ReactNode) => (
    <section className="mb-4 sm:mb-5">
      <h3 className={`text-lg sm:text-xl font-semibold mb-2 ${sectionTitleColorClass}`}>{title}</h3>
      <div className={`text-sm sm:text-base leading-relaxed ${textColorClass}`}>{content}</div>
    </section>
  );

  return (
    <div className={`fixed inset-0 ${overlayBgClass} flex items-center justify-center z-[70] p-3 sm:p-4`} onClick={onClose}>
      <div 
        className={`w-full max-w-xl p-5 sm:p-7 rounded-xl shadow-2xl ${modalBgClass} ${titleColorClass} flex flex-col max-h-[90vh] sm:max-h-[85vh]`}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex justify-between items-center mb-4 sm:mb-6">
            <h2 className={`text-xl sm:text-2xl font-bold ${titleColorClass}`} style={{ textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
                📜 Chess Guide
            </h2>
            <button
                onClick={onClose}
                className={`p-1.5 sm:p-2 rounded-full transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${theme === 'dark' ? 'text-slate-400 hover:text-slate-200 hover:bg-slate-700/70 focus-visible:ring-sky-400' : 'text-slate-500 hover:text-slate-800 hover:bg-gray-300/70 focus-visible:ring-sky-600' }`}
                aria-label="Close guide"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="w-5 h-5 sm:w-6 sm:h-6">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                </svg>
            </button>
        </div>

        <div className={`flex-grow overflow-y-auto pr-2 -mr-2 text-sm sm:text-base scrollbar-thin scrollbar-thumb-rounded-full ${theme === 'dark' ? 'scrollbar-thumb-slate-600 scrollbar-track-slate-700/50' : 'scrollbar-thumb-gray-400 scrollbar-track-gray-200/50'}`}>
          {renderSection("Objective", "The goal of chess is to checkmate your opponent's King. This means putting the King in a position where it is under attack (in 'check') and has no legal moves to escape the attack.")}
          
          {renderSection("Board Setup", 
            <>
              The game is played on an 8x8 grid of alternating light and dark squares. Each player starts with 16 pieces: 
              1 King (<GuidePiece type={PieceType.KING} color={PlayerColor.WHITE} theme={theme} layoutSettings={layoutSettings} />), 
              1 Queen (<GuidePiece type={PieceType.QUEEN} color={PlayerColor.WHITE} theme={theme} layoutSettings={layoutSettings} />), 
              2 Rooks (<GuidePiece type={PieceType.ROOK} color={PlayerColor.WHITE} theme={theme} layoutSettings={layoutSettings} />), 
              2 Bishops (<GuidePiece type={PieceType.BISHOP} color={PlayerColor.WHITE} theme={theme} layoutSettings={layoutSettings} />), 
              2 Knights (<GuidePiece type={PieceType.KNIGHT} color={PlayerColor.WHITE} theme={theme} layoutSettings={layoutSettings} />), 
              and 8 Pawns (<GuidePiece type={PieceType.PAWN} color={PlayerColor.WHITE} theme={theme} layoutSettings={layoutSettings} />).
              White always moves first. The board is set up so that each player has a light-colored square at their bottom-right corner. The Queen always starts on a square of her own color.
            </>
          )}

          <hr className={hrClass} />
          
          <h3 className={`text-lg sm:text-xl font-semibold mb-3 ${sectionTitleColorClass}`}>Piece Movements</h3>
          {piecesData.map(pieceInfo => (
            <div key={pieceInfo.name} className="mb-4">
              <h4 className={`text-md sm:text-lg font-semibold ${strongTextColor}`}>
                <GuidePiece type={pieceInfo.pieceType} color={PlayerColor.WHITE} theme={theme} layoutSettings={layoutSettings} className="mr-1.5 text-lg" />
                {pieceInfo.name}
              </h4>
              <p className={`my-1 ${textColorClass}`}>{pieceInfo.description}</p>
              {pieceInfo.movement}
              {pieceInfo.special && <p className={`mt-1 text-xs sm:text-sm ${textColorClass}`}><strong className={strongTextColor}>Special:</strong> {pieceInfo.special}</p>}
            </div>
          ))}

          <hr className={hrClass} />

          {renderSection("Check", 
            <>
              A King is in <strong className={strongTextColor}>check</strong> when it is attacked by an opponent's piece. The player whose King is in check must make a move that gets the King out of check. This can be done by:
              <ul className="list-disc list-inside ml-4 mt-1">
                <li>Moving the King to a safe square.</li>
                <li>Blocking the check with another piece.</li>
                <li>Capturing the piece that is delivering the check.</li>
              </ul>
              It is illegal to make any move that leaves your King in check.
            </>
          )}

          {renderSection("Checkmate", 
            <>
              If a player's King is in check and there are no legal moves to get out of check, it is <strong className={strongTextColor}>checkmate</strong>. The player delivering the checkmate wins the game.
            </>
          )}

          {renderSection("Stalemate (Draw)", 
            <>
              A <strong className={strongTextColor}>stalemate</strong> occurs when the player whose turn it is to move has no legal moves, and their King is <strong className={strongTextColor}>not</strong> in check. A stalemate results in a draw (tie game).
              Other ways a game can end in a draw include:
                <ul className="list-disc list-inside ml-4 mt-1">
                    <li>Agreement between players.</li>
                    <li>Insufficient mating material (e.g., King vs. King, King and Bishop vs. King).</li>
                    <li>Threefold repetition (the same board position occurs three times with the same player to move).</li>
                    <li>The 50-move rule (if 50 consecutive moves have been made by each player without a pawn move or a capture).</li>
                </ul>
            </>
          )}
        </div>

        <div className="mt-5 sm:mt-6 pt-4 border-t flex justify-center ${theme === 'dark' ? 'border-slate-700/80' : 'border-gray-300/80'}">
          <button onClick={onClose} className={closeButtonClass}>
            Close Guide
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChessGuide;