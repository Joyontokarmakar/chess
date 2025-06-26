
import { useState, useCallback } from 'react';
import {
  MoveHistoryEntry, BoardState, PlayerColor, CastlingRights, Position, GameStatus, Piece,
  GameMode, ToastType, AIMove
} from '../types';
import { createDeepBoardCopy } from '../utils/chessLogic';

interface UseMoveHistoryProps {
  gameStatus: GameStatus;
  currentPlayer: PlayerColor;
  isComputerThinking: boolean;
  promotionSquare: Position | null;
  isResignModalOpen: boolean;
  isRenameModalOpen: boolean;
  gameMode: GameMode | null;
  setBoardState: React.Dispatch<React.SetStateAction<BoardState>>;
  setCurrentPlayer: React.Dispatch<React.SetStateAction<PlayerColor>>;
  setCastlingRights: React.Dispatch<React.SetStateAction<CastlingRights>>;
  setEnPassantTarget: React.Dispatch<React.SetStateAction<Position | null>>;
  setCapturedByWhite: React.Dispatch<React.SetStateAction<Piece[]>>;
  setCapturedByBlack: React.Dispatch<React.SetStateAction<Piece[]>>;
  setGameStatus: React.Dispatch<React.SetStateAction<GameStatus>>;
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  setKingInCheckPosition: React.Dispatch<React.SetStateAction<Position | null>>;
  setLastMove: React.Dispatch<React.SetStateAction<{ from: Position; to: Position } | null>>;
  setPlayer1TimeLeft: React.Dispatch<React.SetStateAction<number | null>>;
  setPlayer2TimeLeft: React.Dispatch<React.SetStateAction<number | null>>;
  setSelectedPiecePosition: React.Dispatch<React.SetStateAction<Position | null>>;
  setPossibleMoves: React.Dispatch<React.SetStateAction<Position[]>>;
  setPromotionSquare: React.Dispatch<React.SetStateAction<Position | null>>;
  setHintSuggestion: React.Dispatch<React.SetStateAction<AIMove | null>>;
  setCoachExplanation: React.Dispatch<React.SetStateAction<string | null>>;
}

export const useMoveHistory = (props: UseMoveHistoryProps) => {
  const [moveHistory, setMoveHistoryState] = useState<MoveHistoryEntry[]>([]);

  const addMoveToHistory = useCallback((entry: MoveHistoryEntry) => {
    setMoveHistoryState(prev => [...prev, entry]);
  }, []);
  
  const createHistoryEntry = useCallback((
    boardState: BoardState, 
    currentPlayer: PlayerColor, 
    castlingRights: CastlingRights, 
    enPassantTarget: Position | null,
    capturedByWhite: Piece[], 
    capturedByBlack: Piece[], 
    gameStatus: GameStatus, 
    kingInCheckPosition: Position | null, 
    lastMove: { from: Position; to: Position } | null,
    player1TimeLeft: number | null, 
    player2TimeLeft: number | null
  ): MoveHistoryEntry => ({
    boardState: createDeepBoardCopy(boardState),
    currentPlayer,
    castlingRights: JSON.parse(JSON.stringify(castlingRights)),
    enPassantTarget,
    capturedByWhite: [...capturedByWhite],
    capturedByBlack: [...capturedByBlack],
    gameStatus: { ...gameStatus },
    kingInCheckPosition,
    lastMove: lastMove ? { ...lastMove } : null,
    player1TimeLeft,
    player2TimeLeft,
  }), []);


  const handleUndoMove = useCallback(() => {
    if (moveHistory.length === 0 || props.gameStatus.isGameOver || 
        ((props.gameMode === 'computer' || props.gameMode === 'coach') && props.isComputerThinking) || 
        props.promotionSquare || props.isResignModalOpen || props.isRenameModalOpen) {
      return;
    }

    const lastState = moveHistory[moveHistory.length - 1];
    props.setBoardState(lastState.boardState);
    props.setCurrentPlayer(lastState.currentPlayer);
    props.setCastlingRights(lastState.castlingRights);
    props.setEnPassantTarget(lastState.enPassantTarget);
    props.setCapturedByWhite(lastState.capturedByWhite);
    props.setCapturedByBlack(lastState.capturedByBlack);
    props.setGameStatus(lastState.gameStatus);
    props.addToast("Last move undone.", 'info');
    props.setKingInCheckPosition(lastState.kingInCheckPosition);
    props.setLastMove(lastState.lastMove);
    props.setPlayer1TimeLeft(lastState.player1TimeLeft);
    props.setPlayer2TimeLeft(lastState.player2TimeLeft);
    props.setSelectedPiecePosition(null);
    props.setPossibleMoves([]);
    props.setPromotionSquare(null);
    props.setHintSuggestion(null);
    props.setCoachExplanation(null);

    setMoveHistoryState(prev => prev.slice(0, -1));
  }, [moveHistory, props]);
  
  const resetMoveHistory = useCallback(() => {
    setMoveHistoryState([]);
  }, []);

  return {
    moveHistory,
    addMoveToHistory,
    createHistoryEntry,
    handleUndoMove,
    resetMoveHistory,
  };
};