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

export type GameOverReason = 'checkmate' | 'stalemate' | 'timeout' | 'resignation';

export interface GameStatus {
  message: string;
  isGameOver: boolean;
  winner?: PlayerColor;
  winnerName?: string;
  reason?: GameOverReason;
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
  gameStartDateTime: string; // e.g., "2023-10-25T14:30:00.000Z" (ISO string)
  playDurationSeconds: number | null; // Duration in seconds
  winReason?: GameOverReason | 'draw'; // How the game concluded
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
  // Timer related state for online games (can be enhanced for full sync later)
  timeLimitPerPlayer: number | null;
  player1TimeLeft: number | null;
  player2TimeLeft: number | null;
  gameStartTimeStamp: number | null;
  lastMove?: { from: Position; to: Position } | null; // Added for online state sync if needed
}

export type Theme = 'light' | 'dark';

export interface SavedGame {
  id: string; // Unique ID, typically timestamp-based
  name: string; // e.g., "vs Computer - 2023-10-27 10:30"
  timestamp: number; // Save initiation timestamp
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

  // Timer related state
  timeLimitPerPlayer: number | null;
  player1TimeLeft: number | null;
  player2TimeLeft: number | null;
  gameStartTimeStamp: number | null; // Timestamp when this specific game instance started
  lastMove?: { from: Position; to: Position } | null; // For potentially restoring last move highlight
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

// Timer options in seconds
export const TIME_OPTIONS = {
  '10 minutes': 600,
  '15 minutes': 900,
  '20 minutes': 1200,
  '25 minutes': 1500,
};
export type TimeOptionKey = keyof typeof TIME_OPTIONS;