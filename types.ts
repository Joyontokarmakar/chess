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

export type GameMode = 'friend' | 'computer' | 'online' | 'loaded_friend' | 'puzzle' | null;

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
  timeLimitPerPlayer: number | null;
  player1TimeLeft: number | null;
  player2TimeLeft: number | null;
  gameStartTimeStamp: number | null;
  lastMove?: { from: Position; to: Position } | null;
}

export type Theme = 'light' | 'dark';

export enum AIDifficultyLevel {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  GRANDMASTER = 'Grandmaster',
}

export interface SavedGame {
  id: string;
  name: string;
  timestamp: number;
  gameMode: 'friend' | 'computer' | 'loaded_friend';
  boardState: BoardState;
  currentPlayer: PlayerColor;
  player1Name: string;
  player2Name: string;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  gameStatus: GameStatus;
  kingInCheckPosition: Position | null;
  originalLocalPlayerColor?: PlayerColor | null;
  aiDifficulty?: AIDifficultyLevel; // For saved AI games
  timeLimitPerPlayer: number | null;
  player1TimeLeft: number | null;
  player2TimeLeft: number | null;
  gameStartTimeStamp: number | null;
  lastMove?: { from: Position; to: Position } | null;
}

export type BoardStyleId = 'default-dark' | 'default-light' | 'classic-wood' | 'cool-blue' | 'forest-green';

export interface LayoutSettings {
  boardStyleId: BoardStyleId;
  whitePieceColor?: string;
  blackPieceColor?: string;
  isSoundEnabled: boolean;
}

export const TIME_OPTIONS = {
  '10 minutes': 600,
  '15 minutes': 900,
  '20 minutes': 1200,
  '25 minutes': 1500,
};
export type TimeOptionKey = keyof typeof TIME_OPTIONS;

// --- Puzzle Mode Types ---
export enum PuzzleDifficulty {
    EASY = 'Easy',
    MEDIUM = 'Medium',
    HARD = 'Hard',
}

export interface PuzzleSolutionMove {
    from: Position;
    to: Position;
    promotion?: PieceType;
    comment?: string; // Optional comment for the move
}

export interface Puzzle {
    id: string;
    title: string;
    description: string; // e.g., "White to play and mate in 1"
    difficulty: PuzzleDifficulty;
    fen?: string; // FEN string for initial position (alternative to manual setup)
    initialBoard?: BoardState; // Use if FEN is not provided
    playerToMove: PlayerColor;
    initialCastlingRights?: CastlingRights;
    initialEnPassantTarget?: Position | null;
    solution: PuzzleSolutionMove[]; // Sequence of moves to solve the puzzle
    // Opponent moves can be implicitly part of the solution sequence if the puzzle is multi-move interactive
}

// --- Undo Move Type ---
export interface MoveHistoryEntry {
  boardState: BoardState;
  currentPlayer: PlayerColor;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  gameStatus: GameStatus;
  kingInCheckPosition: Position | null;
  lastMove: { from: Position; to: Position } | null;
  // Timer states if needed for undo, can be complex
  player1TimeLeft: number | null;
  player2TimeLeft: number | null;
  // gameStartTimeStamp: number | null; // This probably shouldn't change on undo
}

// --- Changelog Type ---
export interface ChangelogVersion {
  version: string;
  title?: string;
  date?: string; // Optional: e.g., "2024-07-28"
  features: string[]; // Each string can be a main point or a sub-point starting with "  • "
}