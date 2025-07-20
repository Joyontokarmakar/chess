export type Theme = 'light' | 'dark';

export enum PlayerColor {
  WHITE = 'White',
  BLACK = 'Black',
}

export enum PieceType {
  PAWN = 'P',
  ROOK = 'R',
  KNIGHT = 'N',
  BISHOP = 'B',
  QUEEN = 'Q',
  KING = 'K',
}

export interface Piece {
  id: string;
  type: PieceType;
  color: PlayerColor;
  hasMoved: boolean;
}

export type SquareState = Piece | null;
export type BoardState = SquareState[][];
export type Position = [number, number];

export interface CastlingRights {
  [PlayerColor.WHITE]: { kingSide: boolean; queenSide: boolean };
  [PlayerColor.BLACK]: { kingSide: boolean; queenSide: boolean };
}

export type GameOverReason = 'checkmate' | 'stalemate' | 'resignation' | 'timeout';

export interface GameStatus {
  message: string;
  isGameOver: boolean;
  winner?: PlayerColor;
  winnerName?: string;
  reason?: GameOverReason | 'draw';
}

export type GameMode = 'friend' | 'computer' | 'online' | 'puzzle' | 'coach' | 'loaded_friend' | null;

export enum AIDifficultyLevel {
  EASY = 'Easy',
  MEDIUM = 'Medium',
  HARD = 'Hard',
  GRANDMASTER = 'Grandmaster',
}

export interface MakeMoveResult {
  newBoard: BoardState;
  newCastlingRights: CastlingRights;
  newEnPassantTarget: Position | null;
  promotionSquare: Position | null;
  capturedPiece: Piece | null;
}

export interface AIMove {
  from: Position;
  to: Position;
  promotion?: PieceType;
  comment?: string;
}

export interface PuzzleSolutionMove extends AIMove {}

export enum PuzzleDifficulty {
    EASY = 'Easy',
    MEDIUM = 'Medium',
    HARD = 'Hard'
}

export interface Puzzle {
    id: string;
    title: string;
    description: string;
    difficulty: PuzzleDifficulty;
    fen?: string;
    initialBoard?: BoardState;
    playerToMove: PlayerColor;
    initialCastlingRights?: CastlingRights;
    initialEnPassantTarget?: Position | null;
    solution: PuzzleSolutionMove[];
}

export type TimeOptionKey = '3 min' | '5 min' | '10 min' | '30 min';

export interface OnlineGameState {
  boardState: BoardState;
  currentPlayer: PlayerColor;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  gameStatus: GameStatus;
  player1Name: string;
  player2Name: string | null;
  isGameReady: boolean;
  lastMoveBy: PlayerColor | null;
  kingInCheckPosition: Position | null;
  timeLimitPerPlayer: number | null;
  player1TimeLeft: number | null;
  player2TimeLeft: number | null;
  gameStartTimeStamp: number | null;
  lastMove?: { from: Position, to: Position };
}

export interface SavedGame {
  id: string;
  name: string;
  timestamp: number;
  gameMode: GameMode;
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
  originalLocalPlayerColor: PlayerColor | null;
  aiDifficulty?: AIDifficultyLevel;
  timeLimitPerPlayer: number | null;
  player1TimeLeft: number | null;
  player2TimeLeft: number | null;
  gameStartTimeStamp: number | null;
  lastMove: { from: Position; to: Position } | null;
}

export interface HallOfFameEntry {
  id: string;
  winnerName: string;
  opponentName: string;
  mode: GameMode;
  gameStartDateTime: string;
  playDurationSeconds: number | null;
  winReason?: GameOverReason | 'draw';
}

export type BoardStyleId = 'default-dark' | 'default-light' | 'classic-wood' | 'cool-blue' | 'forest-green' | 'minimal-dark' | 'minimal-light';
export type PieceSetId = 'default' | 'merida' | 'staunton';

export interface LayoutSettings {
  boardStyleId: BoardStyleId;
  pieceSetId: PieceSetId;
  whitePieceColor?: string;
  blackPieceColor?: string;
  isSoundEnabled: boolean;
  showResignButton: boolean;
  showGameToasts: boolean;
  showUndoButton: boolean;
  showHintButton: boolean;
}

export interface ChangelogVersion {
  version: string;
  title: string;
  features: string[];
}

export type ToastType = 'info' | 'success' | 'warning' | 'error' | 'check';

export interface ToastItem {
  id: string;
  message: string;
  type: ToastType;
  duration?: number;
}

export type WelcomeArenaMenuItemId = 'friend' | 'computer' | 'online' | 'hof' | 'puzzle' | 'coach';

export interface WelcomeArenaMenuItem {
  id: WelcomeArenaMenuItemId;
  label: string;
  icon: string;
  baseColor: string;
}

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
  fenBeforeMove: string;
  player1TimeLeft: number | null;
  player2TimeLeft: number | null;
}

export type MoveClassification = 'blunder' | 'mistake' | 'inaccuracy' | 'good' | 'excellent' | 'brilliant' | 'book';

export interface AnalyzedMove {
    moveNumber: number;
    color: 'White' | 'Black';
    moveNotation: string;
    san: string; // Standard Algebraic Notation, e.g., "e4", "Nf3"
    classification: MoveClassification;
    explanation: string;
    bestAlternative?: {
        moveNotation: string;
        san: string; // e.g., "Nf3"
        explanation?: string;
        from: Position;
        to: Position;
        promotion?: PieceType;
    };
    from: Position;
    to: Position;
    promotion?: PieceType;
}

export interface GameAnalysis {
    summary: string;
    keyMoments?: AnalyzedMove[];
    fullAnalysis: AnalyzedMove[];
}

export interface CompletedGame {
  id: string;
  player1Name: string;
  player2Name: string;
  gameMode: GameMode;
  gameStartDate: string;
  durationSeconds: number | null;
  result: {
    winner?: PlayerColor;
    winnerName?: string;
    reason?: GameOverReason | 'draw';
  };
  moveHistory: MoveHistoryEntry[];
}