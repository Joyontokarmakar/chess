
import { useState, useCallback } from 'react';
import {
  BoardState, PlayerColor, CastlingRights, Position, GameStatus, PieceType,
  Puzzle, AIMove, ToastType, GameMode
} from '../types';
import { PUZZLES, parseFEN, createInitialBoard, INITIAL_CASTLING_RIGHTS } from '../constants';
import { isKingInCheck, findKingPosition, createDeepBoardCopy } from '../utils/chessLogic';

interface UsePuzzleModeProps {
  resetGameToWelcomeArena: (softReset?: boolean) => void;
  setGameMode: (mode: GameMode | null) => void;
  setIsGameSetupComplete: (complete: boolean) => void;
  setBoardState: React.Dispatch<React.SetStateAction<BoardState>>;
  setCurrentPlayer: React.Dispatch<React.SetStateAction<PlayerColor>>;
  setCastlingRights: React.Dispatch<React.SetStateAction<CastlingRights>>;
  setEnPassantTarget: React.Dispatch<React.SetStateAction<Position | null>>;
  setKingInCheckPosition: React.Dispatch<React.SetStateAction<Position | null>>;
  setGameStatus: React.Dispatch<React.SetStateAction<GameStatus>>;
  setPlayer1Name: (name: string) => void;
  setPlayer2Name: (name: string) => void;
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  applyMove: (from: Position, to: Position, promotionType?: PieceType, isPuzzleMove?: boolean) => Promise<void>;
  setSelectedPiecePosition: React.Dispatch<React.SetStateAction<Position | null>>;
  setPossibleMoves: React.Dispatch<React.SetStateAction<Position[]>>;
  setPromotionSquare: React.Dispatch<React.SetStateAction<Position | null>>;
}

export const usePuzzleMode = (props: UsePuzzleModeProps) => {
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [currentPuzzle, setCurrentPuzzleState] = useState<Puzzle | null>(null);
  const [puzzleSolutionStep, setPuzzleSolutionStep] = useState<number>(0);

  const loadPuzzle = useCallback((index: number) => {
    if (index < 0 || index >= PUZZLES.length) return;
    props.resetGameToWelcomeArena(true);
    const puzzle = PUZZLES[index];
    setCurrentPuzzleState(puzzle);
    setCurrentPuzzleIndex(index);
    setPuzzleSolutionStep(0);
    props.setGameMode('puzzle');
    props.setIsGameSetupComplete(true);

    let initialBoardFromPuzzle: BoardState;
    let playerToMoveFromPuzzle: PlayerColor;
    let castlingRightsFromPuzzle: CastlingRights = { ...INITIAL_CASTLING_RIGHTS };
    let enPassantTargetFromPuzzle: Position | null = null;

    if (puzzle.fen) {
      const fenData = parseFEN(puzzle.fen);
      initialBoardFromPuzzle = fenData.board;
      playerToMoveFromPuzzle = fenData.playerToMove;
      castlingRightsFromPuzzle = fenData.castlingRights;
      enPassantTargetFromPuzzle = fenData.enPassantTarget;
    } else if (puzzle.initialBoard) {
      initialBoardFromPuzzle = createDeepBoardCopy(puzzle.initialBoard);
      playerToMoveFromPuzzle = puzzle.playerToMove;
      if (puzzle.initialCastlingRights) castlingRightsFromPuzzle = JSON.parse(JSON.stringify(puzzle.initialCastlingRights));
      if (puzzle.initialEnPassantTarget) enPassantTargetFromPuzzle = [...puzzle.initialEnPassantTarget] as Position;
    } else {
      initialBoardFromPuzzle = createInitialBoard();
      playerToMoveFromPuzzle = PlayerColor.WHITE;
    }

    props.setBoardState(initialBoardFromPuzzle);
    props.setCurrentPlayer(playerToMoveFromPuzzle);
    props.setCastlingRights(castlingRightsFromPuzzle);
    props.setEnPassantTarget(enPassantTargetFromPuzzle);
    const kcip = isKingInCheck(initialBoardFromPuzzle, playerToMoveFromPuzzle) ? findKingPosition(initialBoardFromPuzzle, playerToMoveFromPuzzle) : null;
    props.setKingInCheckPosition(kcip);
    
    const puzzleStartMessage = puzzle.description;
    props.setGameStatus({ message: puzzleStartMessage, isGameOver: false });
    props.addToast(puzzleStartMessage, 'info');
    props.setPlayer1Name(playerToMoveFromPuzzle === PlayerColor.WHITE ? "White" : "Black");
    props.setPlayer2Name(playerToMoveFromPuzzle === PlayerColor.WHITE ? "Black" : "White");
  }, [props]);

  const handlePuzzleMove = useCallback((from: Position, to: Position, promotion?: PieceType) => {
    if (!currentPuzzle) return;
    const solutionMove = currentPuzzle.solution[puzzleSolutionStep];
    if (solutionMove.from[0] === from[0] && solutionMove.from[1] === from[1] &&
        solutionMove.to[0] === to[0] && solutionMove.to[1] === to[1] &&
        (solutionMove.promotion ? solutionMove.promotion === promotion : true)) {
      
      props.applyMove(from, to, promotion, true);
      // Success will be handled by GameState hook's injected callback handleSuccessfulPuzzleMove
      // setPuzzleSolutionStep(prev => prev + 1); // This will be handled by the callback
    } else {
      props.addToast("Incorrect move. Try again!", 'error');
      props.setSelectedPiecePosition(null);
      props.setPossibleMoves([]);
    }
    props.setPromotionSquare(null); // Clear promotion square after attempting
  }, [currentPuzzle, puzzleSolutionStep, props]);
  
  const resetPuzzleState = useCallback(() => {
    setCurrentPuzzleIndex(0);
    setCurrentPuzzleState(null);
    setPuzzleSolutionStep(0);
  }, []);

  return {
    currentPuzzleIndex, setCurrentPuzzleIndex,
    currentPuzzle, setCurrentPuzzle: setCurrentPuzzleState,
    puzzleSolutionStep, setPuzzleSolutionStep,
    loadPuzzle,
    handlePuzzleMove,
    resetPuzzleState,
  };
};
