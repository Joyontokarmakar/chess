
import { useState, useEffect, useRef, useCallback } from 'react';
import {
  OnlineGameState, PlayerColor, GameStatus, BoardState, CastlingRights, Position, Piece,
  GameMode, LayoutSettings, ToastType
} from '../types';
import { getOnlineGameState as getOnlineGameStateFromStorage, setOnlineGameState as setOnlineGameStateInStorage, getOnlineGameStorageKey } from '../utils/localStorageUtils';

interface UseOnlinePlayProps {
  gameMode: GameMode | null;
  gameStatus: GameStatus; // Added for comparison
  setBoardState: React.Dispatch<React.SetStateAction<BoardState>>;
  setCurrentPlayer: React.Dispatch<React.SetStateAction<PlayerColor>>;
  setCastlingRights: React.Dispatch<React.SetStateAction<CastlingRights>>;
  setEnPassantTarget: React.Dispatch<React.SetStateAction<Position | null>>;
  setCapturedByWhite: React.Dispatch<React.SetStateAction<Piece[]>>;
  setCapturedByBlack: React.Dispatch<React.SetStateAction<Piece[]>>;
  setGameStatus: React.Dispatch<React.SetStateAction<GameStatus>>; // This should be the wrapped one from useGameState
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  determineToastTypeForGameStatus: (status: GameStatus) => ToastType;
  setPlayer1Name: (name: string) => void;
  setPlayer2Name: (name: string, gameMode?: GameMode) => void;
  setKingInCheckPosition: React.Dispatch<React.SetStateAction<Position | null>>;
  setLastMove: React.Dispatch<React.SetStateAction<{ from: Position; to: Position } | null>>;
  setTimeLimitPerPlayer: (limit: number | null) => void;
  setPlayer1TimeLeft: (time: number | null) => void;
  setPlayer2TimeLeft: (time: number | null) => void;
  setGameStartTimeStamp: (timestamp: number | null) => void;
  setHasWinSoundPlayedThisGame: React.Dispatch<React.SetStateAction<boolean>>;
  layoutSettings: LayoutSettings;
  player2Name: string; // From usePlayerManagement, for waiting message
}

export const useOnlinePlay = (props: UseOnlinePlayProps) => {
  const [onlineGameIdForStorage, setOnlineGameIdForStorage] = useState<string | null>(null);
  const [localPlayerColorForStorage, setLocalPlayerColorForStorage] = useState<PlayerColor | null>(null);
  const [isOnlineGameReadyForStorage, setIsOnlineGameReadyForStorage] = useState<boolean>(false);
  const lastMoveByRef = useRef<PlayerColor | null>(null);
  
  const updateOnlineGameState = useCallback((gameId: string, updatedState: Partial<OnlineGameState>) => {
    const currentState = getOnlineGameStateFromStorage(gameId);
    if (currentState) {
        setOnlineGameStateInStorage(gameId, { ...currentState, ...updatedState });
    } else { 
        setOnlineGameStateInStorage(gameId, updatedState as OnlineGameState);
    }
  }, []);

  const updateLocalStateFromStorage = useCallback((storageEventKey: string | null) => {
    if (!onlineGameIdForStorage || !storageEventKey || storageEventKey !== getOnlineGameStorageKey(onlineGameIdForStorage)) {
      return;
    }

    const gameStateFromStorage = getOnlineGameStateFromStorage(onlineGameIdForStorage);
    if (gameStateFromStorage && gameStateFromStorage.lastMoveBy !== lastMoveByRef.current) {
      props.setBoardState(gameStateFromStorage.boardState);
      props.setCurrentPlayer(gameStateFromStorage.currentPlayer);
      props.setCastlingRights(gameStateFromStorage.castlingRights);
      props.setEnPassantTarget(gameStateFromStorage.enPassantTarget);
      props.setCapturedByWhite(gameStateFromStorage.capturedByWhite);
      props.setCapturedByBlack(gameStateFromStorage.capturedByBlack);
      
      if (gameStateFromStorage.gameStatus.message !== props.gameStatus.message || 
          gameStateFromStorage.gameStatus.isGameOver !== props.gameStatus.isGameOver) {
        // This toast can be noisy if both players have the window open.
        // props.addToast(gameStateFromStorage.gameStatus.message, props.determineToastTypeForGameStatus(gameStateFromStorage.gameStatus));
      }
      props.setGameStatus(gameStateFromStorage.gameStatus); 

      props.setPlayer1Name(gameStateFromStorage.player1Name);
      props.setPlayer2Name(gameStateFromStorage.player2Name || (localPlayerColorForStorage === PlayerColor.WHITE ? "Waiting..." : props.player2Name));
      setIsOnlineGameReadyForStorage(gameStateFromStorage.isGameReady);
      props.setKingInCheckPosition(gameStateFromStorage.kingInCheckPosition);
      props.setLastMove(gameStateFromStorage.lastMove || null);
      props.setTimeLimitPerPlayer(gameStateFromStorage.timeLimitPerPlayer);
      props.setPlayer1TimeLeft(gameStateFromStorage.player1TimeLeft);
      props.setPlayer2TimeLeft(gameStateFromStorage.player2TimeLeft);
      props.setGameStartTimeStamp(gameStateFromStorage.gameStartTimeStamp);
    }
  }, [onlineGameIdForStorage, localPlayerColorForStorage, props]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      updateLocalStateFromStorage(event.key);
    };

    if (props.gameMode === 'online' && onlineGameIdForStorage) {
      window.addEventListener('storage', handleStorageChange);
      // Initial sync
      updateLocalStateFromStorage(getOnlineGameStorageKey(onlineGameIdForStorage));
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [props.gameMode, onlineGameIdForStorage, updateLocalStateFromStorage]);
  
  const resetOnlinePlayState = useCallback(() => {
    setOnlineGameIdForStorage(null);
    setLocalPlayerColorForStorage(null);
    setIsOnlineGameReadyForStorage(false);
    lastMoveByRef.current = null;
  }, []);

  return {
    onlineGameIdForStorage, setOnlineGameIdForStorage,
    localPlayerColorForStorage, setLocalPlayerColorForStorage,
    isOnlineGameReadyForStorage, setIsOnlineGameReadyForStorage, 
    lastMoveByRef,
    updateOnlineGameState, 
    resetOnlinePlayState,
  };
};