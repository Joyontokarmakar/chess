export enum PieceType {
  PAWN = 'P',
  ROOK = 'R',
  KNIGHT = 'N',
  BISHOP = 'B',
  QUEEN = 'Q',
  KING = 'K',
}

export enum PlayerColor {
  WHITE = 'White',
  BLACK = 'Black',
}

export interface Piece {
  id: string; // Unique ID for React keys, e.g., 'wP1', 'bK'
  type: PieceType;
  color: PlayerColor;
  hasMoved: boolean;
}

export type SquareState = Piece | null;
export type BoardState = SquareState[][];
export type Position = [number, number]; // [row, col]

export interface CastlingRights {
  [PlayerColor.WHITE]: { kingSide: boolean; queenSide: boolean };
  [PlayerColor.BLACK]: { kingSide: boolean; queenSide: boolean };
}

export interface GameStatus {
  message: string;
  isGameOver: boolean;
  winner?: PlayerColor;
  winnerName?: string; 
}

export interface MakeMoveResult {
  newBoard: BoardState;
  newCastlingRights: CastlingRights;
  newEnPassantTarget: Position | null;
  promotionSquare: Position | null;
  capturedPiece: Piece | null; 
}

export type GameMode = 'friend' | 'computer' | null;

export interface AIMove {
  from: Position;
  to: Position;
  promotion?: PieceType; // e.g., 'Q', 'R', 'B', 'N'
}

export interface LeaderboardEntry {
  id: string; // Unique ID for the entry, e.g., timestamp based
  winnerName: string;
  gameStartTime: number; // Unix timestamp (milliseconds)
  gameEndTime: number;   // Unix timestamp (milliseconds)
}
