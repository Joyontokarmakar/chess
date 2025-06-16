import { Piece, PieceType, PlayerColor, BoardState, CastlingRights } from './types';

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

export const INITIAL_CASTLING_RIGHTS: CastlingRights = {
  [PlayerColor.WHITE]: { kingSide: true, queenSide: true },
  [PlayerColor.BLACK]: { kingSide: true, queenSide: true },
};

export const AI_PLAYER_NAME = "Gemini AI";

export function createInitialBoard(): BoardState {
  const board: BoardState = Array(8).fill(null).map(() => Array(8).fill(null));

  const placePiece = (row: number, col: number, type: PieceType, color: PlayerColor, idSuffix: string) => {
    board[row][col] = { type, color, hasMoved: false, id: `${color.charAt(0).toLowerCase()}${type}${idSuffix}` };
  };

  // Pawns
  for (let i = 0; i < 8; i++) {
    placePiece(1, i, PieceType.PAWN, PlayerColor.BLACK, `${i+1}`);
    placePiece(6, i, PieceType.PAWN, PlayerColor.WHITE, `${i+1}`);
  }

  // Rooks
  placePiece(0, 0, PieceType.ROOK, PlayerColor.BLACK, 'Q');
  placePiece(0, 7, PieceType.ROOK, PlayerColor.BLACK, 'K');
  placePiece(7, 0, PieceType.ROOK, PlayerColor.WHITE, 'Q');
  placePiece(7, 7, PieceType.ROOK, PlayerColor.WHITE, 'K');

  // Knights
  placePiece(0, 1, PieceType.KNIGHT, PlayerColor.BLACK, 'Q');
  placePiece(0, 6, PieceType.KNIGHT, PlayerColor.BLACK, 'K');
  placePiece(7, 1, PieceType.KNIGHT, PlayerColor.WHITE, 'Q');
  placePiece(7, 6, PieceType.KNIGHT, PlayerColor.WHITE, 'K');

  // Bishops
  placePiece(0, 2, PieceType.BISHOP, PlayerColor.BLACK, 'Q');
  placePiece(0, 5, PieceType.BISHOP, PlayerColor.BLACK, 'K');
  placePiece(7, 2, PieceType.BISHOP, PlayerColor.WHITE, 'Q');
  placePiece(7, 5, PieceType.BISHOP, PlayerColor.WHITE, 'K');
  
  // Queens
  placePiece(0, 3, PieceType.QUEEN, PlayerColor.BLACK, '');
  placePiece(7, 3, PieceType.QUEEN, PlayerColor.WHITE, '');

  // Kings
  placePiece(0, 4, PieceType.KING, PlayerColor.BLACK, '');
  placePiece(7, 4, PieceType.KING, PlayerColor.WHITE, '');
  
  return board;
}