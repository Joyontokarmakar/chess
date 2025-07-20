

import React from 'react';
import { PieceType, PlayerColor, AIDifficultyLevel, Puzzle, PuzzleDifficulty, CastlingRights, BoardState, Piece, Position, ChangelogVersion, TimeOptionKey, PieceSetId } from './types';
import { FaChessQueen, FaChessRook, FaChessBishop, FaChessKnight, FaChessPawn, FaChessKing } from 'react-icons/fa';
import { GiChessKing, GiChessPawn, GiChessRook, GiChessKnight, GiChessBishop, GiChessQueen } from 'react-icons/gi';

// Maps PieceType to its corresponding Font Awesome icon component from react-icons.
export const PIECE_SETS: Record<PieceSetId, Record<PieceType, React.ElementType>> = {
  'default': {
    [PieceType.KING]: GiChessKing,
    [PieceType.QUEEN]: FaChessQueen,
    [PieceType.ROOK]: FaChessRook,
    [PieceType.BISHOP]: FaChessBishop,
    [PieceType.KNIGHT]: FaChessKnight,
    [PieceType.PAWN]: FaChessPawn,
  },
  'staunton': {
    [PieceType.KING]: FaChessKing,
    [PieceType.QUEEN]: FaChessQueen,
    [PieceType.ROOK]: FaChessRook,
    [PieceType.BISHOP]: FaChessBishop,
    [PieceType.KNIGHT]: FaChessKnight,
    [PieceType.PAWN]: FaChessPawn,
  },
  'merida': {
    [PieceType.KING]: GiChessKing,
    [PieceType.QUEEN]: GiChessQueen,
    [PieceType.ROOK]: GiChessRook,
    [PieceType.BISHOP]: GiChessBishop,
    [PieceType.KNIGHT]: GiChessKnight,
    [PieceType.PAWN]: GiChessPawn,
  }
};


export const INITIAL_CASTLING_RIGHTS: CastlingRights = {
  [PlayerColor.WHITE]: { kingSide: true, queenSide: true },
  [PlayerColor.BLACK]: { kingSide: true, queenSide: true },
};

export const AI_PLAYER_NAME = "Gemini AI";
export const COACH_AI_PLAYER_NAME = "Chess Coach AI";

export const AI_DIFFICULTY_LEVELS: AIDifficultyLevel[] = [
  AIDifficultyLevel.EASY,
  AIDifficultyLevel.MEDIUM,
  AIDifficultyLevel.HARD,
  AIDifficultyLevel.GRANDMASTER,
];

// FEN Parser
export function parseFEN(fen: string): { board: BoardState, playerToMove: PlayerColor, castlingRights: CastlingRights, enPassantTarget: Position | null } {
  const parts = fen.split(' ');
  const piecePlacement = parts[0];
  const activeColor = parts[1];
  const castlingAvailability = parts[2];
  const enPassantTargetSquare = parts[3];
  // Ignoring halfmove clock (parts[4]) and fullmove number (parts[5]) for now

  const board: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));
  let row = 0;
  let col = 0;

  for (const char of piecePlacement) {
    if (char === '/') {
      row++;
      col = 0;
    } else if (/\d/.test(char)) {
      col += parseInt(char, 10);
    } else {
      let color: PlayerColor;
      let type: PieceType;
      if (char.toUpperCase() === char) { // White pieces are uppercase
        color = PlayerColor.WHITE;
      } else { // Black pieces are lowercase
        color = PlayerColor.BLACK;
      }
      switch (char.toLowerCase()) {
        case 'p': type = PieceType.PAWN; break;
        case 'r': type = PieceType.ROOK; break;
        case 'n': type = PieceType.KNIGHT; break;
        case 'b': type = PieceType.BISHOP; break;
        case 'q': type = PieceType.QUEEN; break;
        case 'k': type = PieceType.KING; break;
        default: throw new Error(`Invalid FEN piece: ${char}`);
      }
      board[row][col] = { id: `${color.charAt(0).toLowerCase()}${type}${row}${col}`, type, color, hasMoved: false }; // hasMoved might need adjustment based on FEN or puzzle context
      col++;
    }
  }

  const playerToMove = activeColor === 'w' ? PlayerColor.WHITE : PlayerColor.BLACK;

  const castlingRights: CastlingRights = {
    [PlayerColor.WHITE]: { kingSide: castlingAvailability.includes('K'), queenSide: castlingAvailability.includes('Q') },
    [PlayerColor.BLACK]: { kingSide: castlingAvailability.includes('k'), queenSide: castlingAvailability.includes('q') },
  };

  let enPassantTarget: Position | null = null;
  if (enPassantTargetSquare !== '-') {
    const epCol = enPassantTargetSquare.charCodeAt(0) - 'a'.charCodeAt(0);
    const epRow = 8 - parseInt(enPassantTargetSquare.charAt(1), 10);
    enPassantTarget = [epRow, epCol];
  }

  // Note: hasMoved for pieces (especially King and Rooks for castling) needs careful handling.
  // A true FEN parser would deduce this. For puzzles, if castling is key, ensure FEN reflects this or set hasMoved manually.
  // For simplicity here, new pieces from FEN are set to hasMoved: false. If a puzzle relies on castling being unavailable due to prior moves,
  // the castlingRights part of FEN or the puzzle definition should correctly state this.

  return { board, playerToMove, castlingRights, enPassantTarget };
}


export function createInitialBoard(fen?: string): BoardState {
  if (fen) {
    return parseFEN(fen).board;
  }
  const board = Array(8).fill(null).map(() => Array(8).fill(null));

  const placePiece = (row: number, col: number, type: PieceType, color: PlayerColor, idSuffix: string) => {
    board[row][col] = { type, color, hasMoved: false, id: `${color.charAt(0).toLowerCase()}${type}${idSuffix}` };
  };

  for (let i = 0; i < 8; i++) {
    placePiece(1, i, PieceType.PAWN, PlayerColor.BLACK, `${i+1}`);
    placePiece(6, i, PieceType.PAWN, PlayerColor.WHITE, `${i+1}`);
  }

  placePiece(0, 0, PieceType.ROOK, PlayerColor.BLACK, 'Q');
  placePiece(0, 7, PieceType.ROOK, PlayerColor.BLACK, 'K');
  placePiece(7, 0, PieceType.ROOK, PlayerColor.WHITE, 'Q');
  placePiece(7, 7, PieceType.ROOK, PlayerColor.WHITE, 'K');
  placePiece(0, 1, PieceType.KNIGHT, PlayerColor.BLACK, 'Q');
  placePiece(0, 6, PieceType.KNIGHT, PlayerColor.BLACK, 'K');
  placePiece(7, 1, PieceType.KNIGHT, PlayerColor.WHITE, 'Q');
  placePiece(7, 6, PieceType.KNIGHT, PlayerColor.WHITE, 'K');
  placePiece(0, 2, PieceType.BISHOP, PlayerColor.BLACK, 'Q');
  placePiece(0, 5, PieceType.BISHOP, PlayerColor.BLACK, 'K');
  placePiece(7, 2, PieceType.BISHOP, PlayerColor.WHITE, 'Q');
  placePiece(7, 5, PieceType.BISHOP, PlayerColor.WHITE, 'K');
  placePiece(0, 3, PieceType.QUEEN, PlayerColor.BLACK, '');
  placePiece(7, 3, PieceType.QUEEN, PlayerColor.WHITE, '');
  placePiece(0, 4, PieceType.KING, PlayerColor.BLACK, '');
  placePiece(7, 4, PieceType.KING, PlayerColor.WHITE, '');
  
  return board;
}


export const SOUND_MOVE = 'https://actions.google.com/sounds/v1/sports/wooden_bat_hits_baseball_run.ogg';
export const SOUND_CAPTURE = 'https://actions.google.com/sounds/v1/doors/screen_door_close.ogg';
export const SOUND_WIN = 'https://actions.google.com/sounds/v1/cartoon/magic_chime.ogg';

export const TIME_OPTIONS: Record<TimeOptionKey, number> = {
  '3 min': 180,
  '5 min': 300,
  '10 min': 600,
  '30 min': 1800,
};

export const BOARD_STYLE_CONFIG = {
  'default-dark': {
    light: { 
      container: "bg-slate-700/20 backdrop-blur-md border-2 border-slate-600/30 shadow-2xl shadow-black/50",
      lightSquare: "bg-slate-500/30 backdrop-blur-sm border border-slate-600/20",
      darkSquare: "bg-slate-700/40 backdrop-blur-sm border border-slate-800/20",
      selectedSquareBg: "bg-sky-600/30 backdrop-blur-xs",
      selectedSquareRing: "ring-2 ring-sky-500/50 ring-inset",
      possibleMoveDot: "bg-sky-500/50 opacity-60",
      possibleMoveRing: "ring-2 ring-teal-500/60 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-sky-700/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(14, 165, 233, 0.0)",
      lastMoveFlashColorMid: "rgba(14, 165, 233, 0.7)",   
      lastMoveFlashColorEnd: "rgba(14, 165, 233, 0.0)", 
    },
    dark: { 
      container: "bg-slate-700/20 backdrop-blur-md border-2 border-slate-600/30 shadow-2xl shadow-black/50",
      lightSquare: "bg-slate-500/30 backdrop-blur-sm border border-slate-600/20",
      darkSquare: "bg-slate-700/40 backdrop-blur-sm border border-slate-800/20",
      selectedSquareBg: "bg-sky-600/30 backdrop-blur-xs",
      selectedSquareRing: "ring-2 ring-sky-500/50 ring-inset",
      possibleMoveDot: "bg-sky-500/50 opacity-60",
      possibleMoveRing: "ring-2 ring-teal-500/60 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-sky-700/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(14, 165, 233, 0.0)",
      lastMoveFlashColorMid: "rgba(14, 165, 233, 0.7)",  
      lastMoveFlashColorEnd: "rgba(14, 165, 233, 0.0)",
    }
  },
  'default-light': {
    light: {
      container: "bg-slate-200/40 backdrop-blur-md border-2 border-slate-300/60 shadow-xl shadow-gray-400/30",
      lightSquare: "bg-stone-200/80 backdrop-blur-sm border border-stone-300/60",
      darkSquare: "bg-stone-400/80 backdrop-blur-sm border border-stone-500/60",
      selectedSquareBg: "bg-teal-300/40 backdrop-blur-xs",
      selectedSquareRing: "ring-2 ring-teal-400/60 ring-inset",
      possibleMoveDot: "bg-teal-500/60 opacity-70",
      possibleMoveRing: "ring-2 ring-cyan-600/70 ring-inset opacity-75",
      lastMoveSquareOverlay: "bg-teal-600/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(20, 184, 166, 0.0)",
      lastMoveFlashColorMid: "rgba(20, 184, 166, 0.7)",  
      lastMoveFlashColorEnd: "rgba(20, 184, 166, 0.0)",
    },
    dark: { 
      container: "bg-slate-600/40 backdrop-blur-md border-2 border-slate-500/60 shadow-xl shadow-black/30",
      lightSquare: "bg-stone-400/80 backdrop-blur-sm border border-stone-500/60",
      darkSquare: "bg-stone-600/80 backdrop-blur-sm border border-stone-700/60",
      selectedSquareBg: "bg-teal-500/40 backdrop-blur-xs",
      selectedSquareRing: "ring-2 ring-teal-600/60 ring-inset",
      possibleMoveDot: "bg-teal-400/60 opacity-70",
      possibleMoveRing: "ring-2 ring-cyan-500/70 ring-inset opacity-75",
      lastMoveSquareOverlay: "bg-teal-700/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(15, 118, 110, 0.0)",
      lastMoveFlashColorMid: "rgba(15, 118, 110, 0.7)", 
      lastMoveFlashColorEnd: "rgba(15, 118, 110, 0.0)",
    }
  },
  'classic-wood': {
    light: {
      container: "bg-amber-700/20 backdrop-blur-sm border-2 border-amber-800/30 shadow-xl shadow-amber-900/20",
      lightSquare: "bg-amber-200/80 border border-amber-400/40",
      darkSquare: "bg-amber-600/80 border border-amber-700/40",
      selectedSquareBg: "bg-lime-500/30",
      selectedSquareRing: "ring-2 ring-lime-600/50 ring-inset",
      possibleMoveDot: "bg-lime-600/50 opacity-60",
      possibleMoveRing: "ring-2 ring-emerald-600/60 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-lime-600/20 pointer-events-none",
      lastMoveFlashColorStart: "rgba(132, 204, 22, 0.0)",
      lastMoveFlashColorMid: "rgba(132, 204, 22, 0.7)",   
      lastMoveFlashColorEnd: "rgba(132, 204, 22, 0.0)",
    },
    dark: {
      container: "bg-amber-900/30 backdrop-blur-sm border-2 border-amber-950/40 shadow-2xl shadow-black/30",
      lightSquare: "bg-amber-400/70 border border-amber-600/40", 
      darkSquare: "bg-amber-800/70 border border-amber-900/40", 
      selectedSquareBg: "bg-lime-600/30",
      selectedSquareRing: "ring-2 ring-lime-700/50 ring-inset",
      possibleMoveDot: "bg-lime-700/50 opacity-60",
      possibleMoveRing: "ring-2 ring-emerald-700/60 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-lime-700/20 pointer-events-none",
      lastMoveFlashColorStart: "rgba(101, 163, 13, 0.0)",
      lastMoveFlashColorMid: "rgba(101, 163, 13, 0.7)",  
      lastMoveFlashColorEnd: "rgba(101, 163, 13, 0.0)",
    }
  },
  'cool-blue': {
    light: {
      container: "bg-sky-600/15 backdrop-blur-md border-2 border-sky-500/20 shadow-xl shadow-sky-400/20",
      lightSquare: "bg-sky-200/70 border border-sky-300/40",
      darkSquare: "bg-sky-600/60 border border-sky-700/40",
      selectedSquareBg: "bg-indigo-400/30",
      selectedSquareRing: "ring-2 ring-indigo-500/50 ring-inset",
      possibleMoveDot: "bg-indigo-500/50 opacity-60",
      possibleMoveRing: "ring-2 ring-violet-600/60 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-indigo-600/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(129, 140, 248, 0.0)",
      lastMoveFlashColorMid: "rgba(129, 140, 248, 0.7)",   
      lastMoveFlashColorEnd: "rgba(129, 140, 248, 0.0)",
    },
    dark: {
      container: "bg-blue-800/20 backdrop-blur-md border-2 border-blue-700/30 shadow-2xl shadow-black/30",
      lightSquare: "bg-sky-400/60 border border-sky-600/40",
      darkSquare: "bg-blue-700/60 border border-blue-800/40",
      selectedSquareBg: "bg-purple-500/30",
      selectedSquareRing: "ring-2 ring-purple-400/50 ring-inset",
      possibleMoveDot: "bg-purple-600/50 opacity-60",
      possibleMoveRing: "ring-2 ring-violet-500/60 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-purple-700/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(167, 139, 250, 0.0)",
      lastMoveFlashColorMid: "rgba(167, 139, 250, 0.7)",  
      lastMoveFlashColorEnd: "rgba(167, 139, 250, 0.0)",
    }
  },
   'forest-green': {
    light: {
      container: "bg-green-700/15 backdrop-blur-md border-2 border-green-600/20 shadow-xl shadow-green-500/20",
      lightSquare: "bg-lime-300/70 border border-lime-400/40",
      darkSquare: "bg-green-700/60 border border-green-800/40",
      selectedSquareBg: "bg-yellow-600/30",
      selectedSquareRing: "ring-2 ring-yellow-700/50 ring-inset",
      possibleMoveDot: "bg-orange-600/50 opacity-60",
      possibleMoveRing: "ring-2 ring-amber-700/60 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-yellow-700/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(245, 158, 11, 0.0)",
      lastMoveFlashColorMid: "rgba(245, 158, 11, 0.7)",   
      lastMoveFlashColorEnd: "rgba(245, 158, 11, 0.0)",
    },
    dark: {
      container: "bg-emerald-800/20 backdrop-blur-md border-2 border-emerald-700/30 shadow-2xl shadow-black/30",
      lightSquare: "bg-lime-500/60 border border-lime-700/40",
      darkSquare: "bg-emerald-700/60 border border-emerald-800/40",
      selectedSquareBg: "bg-amber-600/30",
      selectedSquareRing: "ring-2 ring-amber-500/50 ring-inset",
      possibleMoveDot: "bg-red-700/50 opacity-60",
      possibleMoveRing: "ring-2 ring-rose-600/60 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-amber-700/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(217, 119, 6, 0.0)",
      lastMoveFlashColorMid: "rgba(217, 119, 6, 0.7)",  
      lastMoveFlashColorEnd: "rgba(217, 119, 6, 0.0)",
    }
  },
  'minimal-dark': {
    light: {
      container: "bg-gray-800/20 backdrop-blur-md border-2 border-gray-700/30 shadow-xl shadow-black/20",
      lightSquare: "bg-gray-500/80 border border-gray-600/40",
      darkSquare: "bg-gray-700/80 border border-gray-800/40",
      selectedSquareBg: "bg-cyan-500/20",
      selectedSquareRing: "ring-2 ring-cyan-500/40 ring-inset",
      possibleMoveDot: "bg-cyan-500/40 opacity-60",
      possibleMoveRing: "ring-2 ring-cyan-500/50 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-cyan-600/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(6, 182, 212, 0.0)",
      lastMoveFlashColorMid: "rgba(6, 182, 212, 0.6)",   
      lastMoveFlashColorEnd: "rgba(6, 182, 212, 0.0)",
    },
    dark: {
      container: "bg-gray-900/30 backdrop-blur-md border-2 border-gray-800/40 shadow-2xl shadow-black/40",
      lightSquare: "bg-gray-600/70 border border-gray-700/40", 
      darkSquare: "bg-gray-800/70 border border-gray-900/40", 
      selectedSquareBg: "bg-sky-600/20",
      selectedSquareRing: "ring-2 ring-sky-500/40 ring-inset",
      possibleMoveDot: "bg-sky-600/40 opacity-60",
      possibleMoveRing: "ring-2 ring-sky-500/50 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-sky-700/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(2, 132, 199, 0.0)",
      lastMoveFlashColorMid: "rgba(2, 132, 199, 0.6)",  
      lastMoveFlashColorEnd: "rgba(2, 132, 199, 0.0)",
    }
  },
  'minimal-light': {
    light: {
      container: "bg-gray-100/30 backdrop-blur-md border-2 border-gray-300/40 shadow-xl shadow-gray-400/20",
      lightSquare: "bg-white/80 border border-gray-200/50",
      darkSquare: "bg-gray-300/80 border border-gray-400/50",
      selectedSquareBg: "bg-slate-400/30",
      selectedSquareRing: "ring-2 ring-slate-500/50 ring-inset",
      possibleMoveDot: "bg-slate-500/50 opacity-60",
      possibleMoveRing: "ring-2 ring-gray-600/60 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-slate-600/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(71, 85, 105, 0.0)",
      lastMoveFlashColorMid: "rgba(71, 85, 105, 0.6)",   
      lastMoveFlashColorEnd: "rgba(71, 85, 105, 0.0)",
    },
    dark: {
      container: "bg-gray-400/20 backdrop-blur-md border-2 border-gray-500/30 shadow-2xl shadow-black/20",
      lightSquare: "bg-gray-100/70 border border-gray-300/40", 
      darkSquare: "bg-gray-400/70 border border-gray-500/40", 
      selectedSquareBg: "bg-slate-500/30",
      selectedSquareRing: "ring-2 ring-slate-400/50 ring-inset",
      possibleMoveDot: "bg-slate-600/50 opacity-60",
      possibleMoveRing: "ring-2 ring-gray-500/60 ring-inset opacity-70",
      lastMoveSquareOverlay: "bg-slate-700/15 pointer-events-none",
      lastMoveFlashColorStart: "rgba(51, 65, 85, 0.0)",
      lastMoveFlashColorMid: "rgba(51, 65, 85, 0.6)",  
      lastMoveFlashColorEnd: "rgba(51, 65, 85, 0.0)",
    }
  },
};

// --- Sample Puzzles ---
export const PUZZLES: Puzzle[] = [
  {
    id: 'mate-in-1-easy',
    title: 'Easy Mate in 1',
    description: 'White to play and deliver checkmate in one move.',
    difficulty: PuzzleDifficulty.EASY,
    fen: 'rnb1kbnr/pppp1ppp/8/4p3/1P1Pq3/N1P5/P3PPPP/R1BQKBNR w KQkq - 0 1', // Position after 1. e4 e5 2.Qh5 Nc6 3.Bc4 Nf6?? 4.Qxf7# would be too simple; let's use a different one.
    // Fen for a simple mate: "4k3/R7/8/8/8/8/8/4K3 w - - 0 1" -> Ra8#
    // Let's use: Black King on e8, White Rook on a7, White King on e1. White to move. Ra8#
    // More complex example: rnbqkbnr/ppp1pppp/8/1B1p4/4P3/8/PPPP1PPP/RNBQK1NR b KQkq - 1 2 (after 1.e4 d5 2.Bb5+); Black can play c6.
    // Example from Lichess puzzles: "r1bqkb1r/pppp1ppp/2n2n2/4p3/3PP3/5N2/PPP2PPP/RNBQKB1R w KQkq - 0 1"
    // Let's use a clearer mate in 1: FEN: "3k4/3P4/K7/8/8/8/8/8 w - - 0 1" (White King a6, Pawn d7, Black King d8. White moves d8=Q#)
    initialBoard: (() => {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        board[0][3] = { id: 'bk', type: PieceType.KING, color: PlayerColor.BLACK, hasMoved: true };
        board[1][3] = { id: 'wP', type: PieceType.PAWN, color: PlayerColor.WHITE, hasMoved: true }; // Pawn on d7
        board[2][0] = { id: 'wK', type: PieceType.KING, color: PlayerColor.WHITE, hasMoved: true }; // King on a6
        return board;
    })(),
    playerToMove: PlayerColor.WHITE,
    initialCastlingRights: {
        [PlayerColor.WHITE]: { kingSide: false, queenSide: false },
        [PlayerColor.BLACK]: { kingSide: false, queenSide: false },
    },
    solution: [{ from: [1, 3], to: [0, 3], promotion: PieceType.QUEEN, comment: "Pawn promotes to Queen, delivering checkmate." }],
  },
  {
    id: 'win-material-easy',
    title: 'Easy Material Gain',
    description: 'White to play and win material.',
    difficulty: PuzzleDifficulty.EASY,
    // FEN: "r1b1kbnr/p1p1qppp/2np4/1p2p3/2BPP3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 1" (Fork Knight on c3) -> Nd5 winning queen or rook
    fen: "r1b1kbnr/p1p1qppp/2np4/1B2p3/3PP3/2N2N2/PPP2PPP/R1BQK2R w KQkq - 0 1", // Simpler: Bishop b5, Queen e7. Nd5 forks Queen e7 and Rook a8 if c6 is not played. Here, if black plays ...a6, then Bxc6+.
    // A clearer example: White Knight on c3, Black Queen on d5, Black King on e8. White plays Ne4, attacking queen. Queen has to move. If Queen moves to c5, Nf6+ check and fork.
    // FEN: "4k3/8/8/3q4/8/2N5/8/4K3 w - - 0 1" (White King e1, Knight c3. Black King e8, Queen d5. White plays Nxd5) No, this is just a capture.
    // How about a simple fork? White Knight at e4, Black King at g8, Black Rook at c8. White to play Nf6+
    initialBoard: (() => {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        board[0][6] = { id: 'bK', type: PieceType.KING, color: PlayerColor.BLACK, hasMoved: true }; // Black King g8
        board[0][2] = { id: 'bR', type: PieceType.ROOK, color: PlayerColor.BLACK, hasMoved: true }; // Black Rook c8
        board[4][4] = { id: 'wN', type: PieceType.KNIGHT, color: PlayerColor.WHITE, hasMoved: true }; // White Knight e4
        board[7][4] = { id: 'wK', type: PieceType.KING, color: PlayerColor.WHITE, hasMoved: true }; // White King e1
        return board;
    })(),
    playerToMove: PlayerColor.WHITE,
    initialCastlingRights: {
        [PlayerColor.WHITE]: { kingSide: false, queenSide: false },
        [PlayerColor.BLACK]: { kingSide: false, queenSide: false },
    },
    solution: [{ from: [4, 4], to: [2, 5], comment: "Nf6+ forks King and Rook." }], // Nf6+
  },
  // Add more puzzles here
];

// --- Changelog Data ---
export const CHANGELOG_DATA: ChangelogVersion[] = [
  {
    version: "5.0",
    title: "PWA & UI/UX Enhancements",
    features: [
        "New! Progressive Web App (PWA): The app is now installable on your device for a native-like experience and faster access.",
        "New! Offline Functionality: Thanks to service workers, the app can be used offline for non-AI game modes.",
        "New! Desktop Sidebar Layout: A new, persistent sidebar menu for desktop users provides quicker access to all game modes and settings.",
        "New! Multiple Piece Sets: Customize your game further by choosing from different piece visual styles (Default, Staunton, Merida) in the Appearance settings.",
        "New! Drag and Drop Movement: You can now move pieces by dragging them to their destination square as an alternative to clicking.",
        "Enhancement! Smoother UI interactions and improved responsive layouts.",
        "Fix! Resolved a critical error during AI game setup, ensuring difficulty levels are correctly applied.",
        "Fix! Addressed an application crash caused by a syntax error in the UI state management hook.",
    ],
  },
  {
    version: "4.3",
    title: "Architectural Fixes & UI Enhancements",
    features: [
        "Fix! Critical Game Logic: Overhauled application architecture to fix a major bug that prevented game modes (Play AI, Friend, Coach, Puzzle) from launching.",
        "New! Multi-Game Analysis History: Access a list of your last 10 games and launch a detailed, move-by-move analysis for any of them.",
        "New! Informational Pages: Added 'About the Developer', 'Terms & Conditions', and 'Privacy Policy' pages, accessible from the footer for transparency.",
        "Enhancement! Visual Refresh: Redesigned all menu buttons with unique, subtle gradients for a more polished and intuitive UI.",
        "Enhancement! Game Over screen now includes 'Rematch' and 'Back to Home' options for a better user flow.",
        "Enhancement! New King piece icon for better visual clarity, avoiding confusion with the Queen.",
        "Fix! Puzzle mode now initializes and functions correctly.",
    ],
  },
  {
    version: "4.2",
    title: "Modernization & User Experience",
    features: [
        "New! Welcome Modal: A one-time welcome screen now greets new visitors.",
        "Redesign! Modernized Resign Button: Resign buttons are now seamlessly integrated into player panels for a cleaner look.",
        "Update! Relocated Game Buttons: The Undo and Hint buttons have been moved to either side of the chessboard for better access and layout balance.",
        "New! UI Toggles: Added separate settings in the menu to show or hide the Undo and Hint buttons.",
        "Fix! Hall of Fame Responsiveness: Ensured the Hall of Fame table is fully responsive and user-friendly on mobile devices.",
    ],
  },
  {
    version: "4.1",
    title: "UI/UX Enhancements & Customization",
    features: [
      "New! Custom Resign Confirmation Modal: Clearer confirmation before resigning.",
      "New! Game Over Overlay: Displays winner/draw status with a celebratory confetti animation.",
      "New! Game Update Toaster Notifications: Game events (check, checkmate, turn changes) now appear as toasts, removing the bottom message box for a cleaner interface.",
      "New! In-Game Player Rename: Option to rename players during 'Friend' or 'Computer' games via Player Display Panel.",
      "New! Game Settings Toggles:",
      "  • Show/Hide Resign Buttons: Customize visibility of resign buttons in the game area.",
      "  • Show/Hide Game Update Toasts: Enable or disable toaster notifications.",
      "UI Refinement: Removed the game update box from below the board to improve screen space.",
    ],
  },
  {
    version: "4",
    title: "Major Gameplay Expansion & AI Enhancements",
    features: [
      "Enhanced UI for Game Board and Main Menu.",
      "Introduced optional Timer Mode for all game modes.",
      "Added visual highlight for the Last Move.",
      "Integrated a comprehensive Chess Guide for rules and strategies.",
      "Refreshed piece appearance for a new look.",
      "Improved mobile menu design for better usability.",
      "Adjusted game appearance colors to be more 'sober' and eye-friendly.",
      "Incorporated Sound Effects for piece moves, captures, and game wins.",
      "Added a dedicated 'Game Settings' section in the menu:",
      "  • Toggle for game sounds.",
      "  • Relocated 'Customize Appearance' into Game Settings.",
      "Implemented AI Difficulty Levels (Easy, Medium, Hard, Grandmaster).",
      "Introduced Puzzle Mode / Tactics Trainer with curated positions.",
      "Added a Hint System to request AI-suggested moves.",
      "Enabled Undo Move functionality for casual game modes.",
    ],
  },
  {
    version: "3",
    title: "UI & Gameplay Refinements",
    features: [
      "UI updates for the Game Board and Main Menu.",
      "Timer Mode added for all game types, with an option to play without it.",
      "Visual indication for the last move made.",
      "Chess Guide added for learning rules and piece movements.",
    ],
  },
  {
    version: "2",
    title: "Customization & Game Management",
    features: [
      "Theme customization: Light and Dark modes.",
      "Appearance options for board and pieces.",
      "Simulated 'Play Online' mode (same browser/device).",
      "Save and Load game functionality.",
      "Updated UI design:",
      "  • Game board aesthetics.",
      "  • Hall of Fame presentation and data.",
      "  • Menu design improvements.",
    ],
  },
  {
    version: "1",
    title: "Initial Release - Core Chess Experience",
    features: [
      "Core chess game logic with basic rules.",
      "Play Modes: Player vs AI, Player vs Player (Friend).",
      "Hall of Fame to track victories.",
    ],
  },
];