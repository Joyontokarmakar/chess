
import { useState, useEffect, useRef, useCallback } from 'react';
import { PlayerColor, GameStatus, Position, CastlingRights, GameOverReason, GameMode, OnlineGameState, BoardState } from '../types';

interface UseGameTimerProps {
  currentPlayer: PlayerColor;
  gameStatus: GameStatus;
  promotionSquare: Position | null;
  isResignModalOpen: boolean;
  boardState: BoardState;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  updateGameStatus: (
    board: any, 
    actingPlayer: PlayerColor,
    currentCR: CastlingRights,
    currentEPT: Position | null,
    reason: GameOverReason | null,
    moveMessagePreamble?: string
  ) => Promise<any>; 
  gameMode: GameMode | null;
  onlineGameIdForStorage: string | null;
  localPlayerColorForStorage: PlayerColor | null;
  updateOnlineGameState: (gameId: string, updatedState: Partial<OnlineGameState>) => void; 
}

export const useGameTimer = (props: UseGameTimerProps) => {
  const [timeLimitPerPlayer, setTimeLimitPerPlayer] = useState<number | null>(null);
  const [player1TimeLeft, setPlayer1TimeLeft] = useState<number | null>(null);
  const [player2TimeLeft, setPlayer2TimeLeft] = useState<number | null>(null);
  const [gameStartTimeStamp, setGameStartTimeStamp] = useState<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (!timeLimitPerPlayer || props.gameStatus.isGameOver || props.promotionSquare || props.isResignModalOpen || props.gameMode === 'puzzle') {
      return;
    }

    timerIntervalRef.current = setInterval(async () => {
      let newTimeLeftP1: number | null = player1TimeLeft;
      let newTimeLeftP2: number | null = player2TimeLeft;
      let timeoutOccurred = false;
      let timedOutPlayer: PlayerColor | null = null;

      if (props.currentPlayer === PlayerColor.WHITE) {
        if (player1TimeLeft !== null && player1TimeLeft <= 0) {
          timeoutOccurred = true; timedOutPlayer = PlayerColor.WHITE; newTimeLeftP1 = 0;
        } else if (player1TimeLeft !== null) {
          newTimeLeftP1 = player1TimeLeft - 1;
        }
        setPlayer1TimeLeft(newTimeLeftP1);
      } else {
        if (player2TimeLeft !== null && player2TimeLeft <= 0) {
          timeoutOccurred = true; timedOutPlayer = PlayerColor.BLACK; newTimeLeftP2 = 0;
        } else if (player2TimeLeft !== null) {
          newTimeLeftP2 = player2TimeLeft - 1;
        }
        setPlayer2TimeLeft(newTimeLeftP2);
      }
      
      const shouldUpdateOnline = props.gameMode === 'online' && props.onlineGameIdForStorage && props.currentPlayer === props.localPlayerColorForStorage;

      if (timeoutOccurred && timedOutPlayer) {
        if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
        const winner = timedOutPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
        const { gameStatusResult: finalGameStatus } = await props.updateGameStatus(props.boardState, winner, props.castlingRights, props.enPassantTarget, 'timeout');
        
        if (props.gameMode === 'online' && props.onlineGameIdForStorage) {
            props.updateOnlineGameState(props.onlineGameIdForStorage, {
                gameStatus: finalGameStatus,
                player1TimeLeft: newTimeLeftP1,
                player2TimeLeft: newTimeLeftP2,
                lastMoveBy: timedOutPlayer, // Mark who timed out
            });
        }
      } else if (shouldUpdateOnline && props.onlineGameIdForStorage) { // Regular time update for online game
            props.updateOnlineGameState(props.onlineGameIdForStorage, {
                player1TimeLeft: newTimeLeftP1,
                player2TimeLeft: newTimeLeftP2,
            });
      }
    }, 1000) as unknown as number;

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [
    props.currentPlayer, timeLimitPerPlayer, props.gameStatus.isGameOver, props.promotionSquare, props.isResignModalOpen,
    props.boardState, props.castlingRights, props.enPassantTarget, props.updateGameStatus, props.gameMode,
    props.onlineGameIdForStorage, player1TimeLeft, player2TimeLeft, props.localPlayerColorForStorage, props.updateOnlineGameState
  ]);
  
  const resetTimerState = useCallback(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    setTimeLimitPerPlayer(null);
    setPlayer1TimeLeft(null);
    setPlayer2TimeLeft(null);
    setGameStartTimeStamp(null);
  }, []);

  return {
    timeLimitPerPlayer, setTimeLimitPerPlayer,
    player1TimeLeft, setPlayer1TimeLeft,
    player2TimeLeft, setPlayer2TimeLeft,
    gameStartTimeStamp, setGameStartTimeStamp,
    resetTimerState,
  };
};