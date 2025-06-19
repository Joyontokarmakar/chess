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

export type GameMode = 'friend' | 'computer' | 'online' | 'loaded_friend' | null;

export interface AIMove {
  from: Position;
  to: Position;
  promotion?: PieceType; // e.g., 'Q', 'R', 'B', 'N'
}

export interface HallOfFameEntry {
  id: string;
  winnerName: string;
  opponentName: string;
  mode: GameMode;
  date: string; // e.g., "10/25/2023"
}

export interface OnlineGameState {
  boardState: BoardState;
  currentPlayer: PlayerColor;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  gameStatus: GameStatus;
  player1Name: string; // Host (White)
  player2Name: string | null; // Joiner (Black), null if waiting
  isGameReady: boolean; // True when player 2 has joined
  lastMoveBy: PlayerColor | null; // Tracks who made the last move to avoid self-updates from storage events
  kingInCheckPosition: Position | null;
}

export type Theme = 'light' | 'dark';

export interface SavedGame {
  id: string; // Unique ID, typically timestamp-based
  name: string; // e.g., "vs Computer - 2023-10-27 10:30"
  timestamp: number;
  gameMode: 'friend' | 'computer' | 'loaded_friend'; // Online games are saved as 'loaded_friend'
  boardState: BoardState;
  currentPlayer: PlayerColor;
  player1Name: string;
  player2Name: string;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  gameStatus: GameStatus; // Snapshot of game status
  kingInCheckPosition: Position | null;
  originalLocalPlayerColor?: PlayerColor | null;
}

// Layout and Styling Types
export type BoardStyleId = 'default-dark' | 'default-light' | 'classic-wood' | 'cool-blue' | 'forest-green';

export type PieceColorOption =
  | 'white-theme-default' | 'white-classic-white' | 'white-fiery-red' | 'white-golden-yellow' | 'white-deep-blue' | 'white-silver-gray' | 'white-emerald-green'
  | 'black-theme-default' | 'black-classic-black' | 'black-fiery-red' | 'black-golden-yellow' | 'black-deep-blue' | 'black-silver-gray' | 'black-emerald-green';

export interface LayoutSettings {
  boardStyleId: BoardStyleId;
  whitePieceColor: PieceColorOption;
  blackPieceColor: PieceColorOption;
}
