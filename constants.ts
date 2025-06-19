import { PieceType, PlayerColor } from './types';

export const PIECE_SYMBOLS: Record<PlayerColor, Record<PieceType, string>> = {
  [PlayerColor.WHITE]: {
    [PieceType.KING]: '♔',
    [PieceType.QUEEN]: '♕',
    [PieceType.ROOK]: '♖',
    [PieceType.BISHOP]: '♗',
    [PieceType.KNIGHT]: '♘',
    [PieceType.PAWN]: '♙',
  },
  [PlayerColor.BLACK]: {
    [PieceType.KING]: '♚',
    [PieceType.QUEEN]: '♛',
    [PieceType.ROOK]: '♜',
    [PieceType.BISHOP]: '♝',
    [PieceType.KNIGHT]: '♞',
    [PieceType.PAWN]: '♟︎',
  },
};

export const INITIAL_CASTLING_RIGHTS = {
  [PlayerColor.WHITE]: { kingSide: true, queenSide: true },
  [PlayerColor.BLACK]: { kingSide: true, queenSide: true },
};

export const AI_PLAYER_NAME = "Gemini AI";

export function createInitialBoard() {
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

// --- Layout Customization Configurations ---

export const BOARD_STYLE_CONFIG = {
  'default-dark': {
    light: { // Keeping light and dark variants for consistency, even if some are same
      container: "bg-slate-700/20 backdrop-blur-md border-2 border-slate-600/30 shadow-2xl shadow-black/50",
      lightSquare: "bg-slate-300/25 backdrop-blur-sm border border-slate-400/20",
      darkSquare: "bg-slate-700/35 backdrop-blur-sm border border-slate-600/20",
      selectedSquareBg: "bg-yellow-400/40 backdrop-blur-xs",
      selectedSquareRing: "ring-2 ring-yellow-300/70 ring-inset",
      possibleMoveDot: "bg-sky-400/80 opacity-70",
      possibleMoveRing: "ring-2 ring-pink-500/90 ring-inset opacity-80",
      lastMoveSquareOverlay: "bg-yellow-500/30 pointer-events-none",
    },
    dark: { 
      container: "bg-slate-700/20 backdrop-blur-md border-2 border-slate-600/30 shadow-2xl shadow-black/50",
      lightSquare: "bg-slate-300/25 backdrop-blur-sm border border-slate-400/20",
      darkSquare: "bg-slate-700/35 backdrop-blur-sm border border-slate-600/20",
      selectedSquareBg: "bg-yellow-400/40 backdrop-blur-xs",
      selectedSquareRing: "ring-2 ring-yellow-300/70 ring-inset",
      possibleMoveDot: "bg-sky-400/80 opacity-70",
      possibleMoveRing: "ring-2 ring-pink-500/90 ring-inset opacity-80",
      lastMoveSquareOverlay: "bg-yellow-500/30 pointer-events-none",
    }
  },
  'default-light': {
    light: {
      container: "bg-slate-200/30 backdrop-blur-md border-2 border-slate-300/50 shadow-xl shadow-gray-400/40",
      lightSquare: "bg-stone-100/70 backdrop-blur-sm border border-stone-300/50",
      darkSquare: "bg-stone-300/70 backdrop-blur-sm border border-stone-400/50",
      selectedSquareBg: "bg-amber-400/50 backdrop-blur-xs",
      selectedSquareRing: "ring-2 ring-amber-500/80 ring-inset",
      possibleMoveDot: "bg-sky-500/80 opacity-75",
      possibleMoveRing: "ring-2 ring-rose-500/90 ring-inset opacity-80",
      lastMoveSquareOverlay: "bg-amber-600/30 pointer-events-none",
    },
    dark: { 
      container: "bg-slate-600/30 backdrop-blur-md border-2 border-slate-500/50 shadow-xl shadow-black/40",
      lightSquare: "bg-stone-400/70 backdrop-blur-sm border border-stone-500/50",
      darkSquare: "bg-stone-600/70 backdrop-blur-sm border border-stone-700/50",
      selectedSquareBg: "bg-amber-500/50 backdrop-blur-xs",
      selectedSquareRing: "ring-2 ring-amber-600/80 ring-inset",
      possibleMoveDot: "bg-sky-400/80 opacity-75",
      possibleMoveRing: "ring-2 ring-rose-400/90 ring-inset opacity-80",
      lastMoveSquareOverlay: "bg-yellow-600/30 pointer-events-none",
    }
  },
  'classic-wood': {
    light: {
      container: "bg-yellow-700/30 backdrop-blur-sm border-2 border-yellow-800/40 shadow-xl shadow-yellow-900/30",
      lightSquare: "bg-yellow-200/80 border border-yellow-400/50", 
      darkSquare: "bg-yellow-600/80 border border-yellow-700/50", 
      selectedSquareBg: "bg-green-500/40",
      selectedSquareRing: "ring-2 ring-green-600/60 ring-inset",
      possibleMoveDot: "bg-green-600/70",
      possibleMoveRing: "ring-2 ring-green-700/80 ring-inset",
      lastMoveSquareOverlay: "bg-lime-400/40 pointer-events-none",
    },
    dark: {
      container: "bg-yellow-900/40 backdrop-blur-sm border-2 border-yellow-950/50 shadow-2xl shadow-black/40",
      lightSquare: "bg-yellow-400/70 border border-yellow-600/50", 
      darkSquare: "bg-yellow-800/70 border border-yellow-900/50", 
      selectedSquareBg: "bg-lime-500/40",
      selectedSquareRing: "ring-2 ring-lime-600/60 ring-inset",
      possibleMoveDot: "bg-lime-600/70",
      possibleMoveRing: "ring-2 ring-lime-700/80 ring-inset",
      lastMoveSquareOverlay: "bg-green-400/40 pointer-events-none",
    }
  },
  'cool-blue': {
    light: {
      container: "bg-sky-600/20 backdrop-blur-md border-2 border-sky-500/30 shadow-xl shadow-sky-400/30",
      lightSquare: "bg-sky-100/80 border border-sky-300/50",
      darkSquare: "bg-sky-500/70 border border-sky-600/50",
      selectedSquareBg: "bg-indigo-400/40",
      selectedSquareRing: "ring-2 ring-indigo-500/60 ring-inset",
      possibleMoveDot: "bg-indigo-500/70",
      possibleMoveRing: "ring-2 ring-purple-600/80 ring-inset",
      lastMoveSquareOverlay: "bg-teal-400/30 pointer-events-none",
    },
    dark: {
      container: "bg-blue-800/30 backdrop-blur-md border-2 border-blue-700/40 shadow-2xl shadow-black/40",
      lightSquare: "bg-sky-300/70 border border-sky-500/50",
      darkSquare: "bg-blue-700/70 border border-blue-800/50",
      selectedSquareBg: "bg-purple-500/40",
      selectedSquareRing: "ring-2 ring-purple-400/60 ring-inset",
      possibleMoveDot: "bg-purple-600/70",
      possibleMoveRing: "ring-2 ring-violet-500/80 ring-inset",
      lastMoveSquareOverlay: "bg-cyan-400/30 pointer-events-none",
    }
  },
   'forest-green': {
    light: {
      container: "bg-green-700/20 backdrop-blur-md border-2 border-green-600/30 shadow-xl shadow-green-500/30",
      lightSquare: "bg-lime-200/80 border border-lime-400/50",
      darkSquare: "bg-green-600/70 border border-green-700/50",
      selectedSquareBg: "bg-yellow-500/40",
      selectedSquareRing: "ring-2 ring-yellow-600/60 ring-inset",
      possibleMoveDot: "bg-orange-500/70",
      possibleMoveRing: "ring-2 ring-red-600/80 ring-inset",
      lastMoveSquareOverlay: "bg-teal-500/30 pointer-events-none",
    },
    dark: {
      container: "bg-emerald-800/30 backdrop-blur-md border-2 border-emerald-700/40 shadow-2xl shadow-black/40",
      lightSquare: "bg-lime-400/70 border border-lime-600/50",
      darkSquare: "bg-emerald-700/70 border border-emerald-800/50",
      selectedSquareBg: "bg-amber-500/40",
      selectedSquareRing: "ring-2 ring-amber-400/60 ring-inset",
      possibleMoveDot: "bg-red-600/70",
      possibleMoveRing: "ring-2 ring-rose-500/80 ring-inset",
      lastMoveSquareOverlay: "bg-green-500/30 pointer-events-none",
    }
  }
};

export const PIECE_COLOR_CONFIG = {
  // --- White Piece Options ---
  'white-theme-default': { 
    light: 'text-red-600 font-bold', 
    dark: 'text-rose-500 font-bold' 
  },
  'white-classic-white': { 
    light: 'text-gray-800 font-bold', 
    dark: 'text-gray-100 font-bold' 
  },
  'white-fiery-red':     { 
    light: 'text-red-500 font-bold', 
    dark: 'text-red-400 font-bold' 
  },
  'white-golden-yellow': { 
    light: 'text-yellow-500 font-bold', 
    dark: 'text-yellow-400 font-bold' 
  },
  'white-deep-blue':     { 
    light: 'text-blue-700 font-bold', 
    dark: 'text-blue-500 font-bold' 
  },
  'white-silver-gray':   { 
    light: 'text-gray-500 font-bold', 
    dark: 'text-gray-300 font-bold' 
  },
  'white-emerald-green': { 
    light: 'text-emerald-600 font-bold', 
    dark: 'text-emerald-400 font-bold' 
  },

  // --- Black Piece Options ---
  'black-theme-default': { 
    light: 'text-blue-600', 
    dark: 'text-cyan-400' 
  },
  'black-classic-black': { 
    light: 'text-black', 
    dark: 'text-white' 
  }, // Note: true black/white can be harsh
  'black-fiery-red':     { 
    light: 'text-red-700', 
    dark: 'text-red-500' 
  },
  'black-golden-yellow': { 
    light: 'text-yellow-600', 
    dark: 'text-yellow-500' 
  },
  'black-deep-blue':     { 
    light: 'text-blue-800', 
    dark: 'text-blue-400' 
  },
  'black-silver-gray':   { 
    light: 'text-gray-600', 
    dark: 'text-gray-400' 
  },
  'black-emerald-green': { 
    light: 'text-emerald-700', 
    dark: 'text-emerald-500' 
  },
};