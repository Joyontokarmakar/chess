
import { useState, useCallback } from 'react';
import { PlayerColor, AIDifficultyLevel, ToastType, GameMode } from '../types';
import { AI_PLAYER_NAME, COACH_AI_PLAYER_NAME } from '../constants';

interface PlayerManagementProps {
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  setPlayerToRename: (player: PlayerColor | null | ((prevState: PlayerColor | null) => PlayerColor | null)) => void;
  setIsRenameModalOpen: (isOpen: boolean) => void;
}

export const usePlayerManagement = ({ addToast, setPlayerToRename, setIsRenameModalOpen }: PlayerManagementProps) => {
  const [player1Name, setPlayer1NameState] = useState<string>("Player 1");
  const [player2Name, setPlayer2NameState] = useState<string>("Player 2");
  const [aiDifficulty, setAiDifficultyState] = useState<AIDifficultyLevel>(AIDifficultyLevel.MEDIUM);

  const setPlayer1Name = useCallback((name: string) => setPlayer1NameState(name || "Player 1"), []);
  const setPlayer2Name = useCallback((name: string) => {
    setPlayer2NameState(name || "Player 2");
  }, []);
  
  const handleRequestRename = useCallback((playerColor: PlayerColor) => {
    setPlayerToRename(playerColor);
    setIsRenameModalOpen(true);
  }, [setPlayerToRename, setIsRenameModalOpen]);

  const executePlayerRename = useCallback((newName: string) => {
    setPlayerToRename((prevPlayerToRename: PlayerColor | null) => {
      if (prevPlayerToRename === PlayerColor.WHITE) {
        addToast(`${player1Name} renamed to ${newName}.`, 'info');
        setPlayer1NameState(newName);
      } else if (prevPlayerToRename === PlayerColor.BLACK) {
        addToast(`${player2Name} renamed to ${newName}.`, 'info');
        setPlayer2NameState(newName);
      }
      setIsRenameModalOpen(false);
      return null;
    });
  }, [addToast, player1Name, player2Name, setIsRenameModalOpen, setPlayerToRename]);
  
  const cancelPlayerRename = useCallback(() => {
    setIsRenameModalOpen(false);
    setPlayerToRename(null);
  }, [setIsRenameModalOpen, setPlayerToRename]);

  const getCurrentPlayerRealName = useCallback((currentPlayer: PlayerColor) => {
    return currentPlayer === PlayerColor.WHITE ? player1Name : player2Name;
  }, [player1Name, player2Name]);

  const getOpponentPlayerName = useCallback((currentPlayer: PlayerColor) => {
    return currentPlayer === PlayerColor.WHITE ? player2Name : player1Name;
  }, [player1Name, player2Name]);
  
  const resetPlayerManagementState = useCallback(() => {
    setPlayer1NameState("Player 1");
    setPlayer2NameState("Player 2");
    setAiDifficultyState(AIDifficultyLevel.MEDIUM);
    setPlayerToRename(null);
    setIsRenameModalOpen(false);
  }, [setIsRenameModalOpen, setPlayerToRename]);


  return {
    player1Name, setPlayer1Name,
    player2Name, setPlayer2Name,
    aiDifficulty, setAiDifficulty: setAiDifficultyState,
    handleRequestRename,
    executePlayerRename,
    cancelPlayerRename,
    getCurrentPlayerRealName,
    getOpponentPlayerName,
    resetPlayerManagementState,
  };
};
