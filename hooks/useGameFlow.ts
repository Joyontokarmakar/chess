
import { useState, useCallback } from 'react';
import { GameMode, WelcomeArenaMenuItemId, PlayerColor, AIDifficultyLevel, GameStatus, ToastType } from '../types';
import { COACH_AI_PLAYER_NAME, AI_PLAYER_NAME } from '../constants';

interface UseGameFlowProps {
  // UI state setters from useUIState
  setViewingHallOfFame: (viewing: boolean) => void;
  setIsMenuOpen: (isOpen: boolean) => void;
  setIsOnlineWarningModalOpen: (isOpen: boolean) => void;
  // Core game state resetters/setters
  resetCoreGameState: () => void;
  resetPlayerManagementState: () => void;
  resetTimerState: () => void;
  resetAIState: () => void;
  resetMoveHistory: () => void;
  resetPuzzleState: () => void;
  resetOnlinePlayState: () => void;
  // Specific state setters for setup
  setPlayer1Name: (name: string) => void;
  setPlayer2Name: (name: string, gameMode?: GameMode) => void;
  setAiDifficulty: (difficulty: AIDifficultyLevel) => void;
  setTimeLimitPerPlayer: (limit: number | null) => void;
  setGameStartTimeStamp: (timestamp: number | null) => void;
  setPlayer1TimeLeft: (time: number | null) => void;
  setPlayer2TimeLeft: (time: number | null) => void;
  setGameStatus: (status: GameStatus) => void; 
  addToast: (message: string, type?: ToastType, duration?: number) => void;
}

export const useGameFlow = (props: UseGameFlowProps) => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [isGameSetupPending, setIsGameSetupPending] = useState<boolean>(false);
  const [isTimeModeSelectionOpen, setIsTimeModeSelectionOpen] = useState<boolean>(false);
  const [isGameSetupComplete, setIsGameSetupComplete] = useState<boolean>(false);

  const resetGameToWelcomeArena = useCallback((softResetForModeChange: boolean = false) => {
    props.resetCoreGameState();
    props.resetPlayerManagementState();
    props.resetTimerState();
    props.resetAIState();
    props.resetMoveHistory();
    props.resetPuzzleState();
    props.resetOnlinePlayState();
    
    props.setViewingHallOfFame(false);
    setIsGameSetupPending(false);
    setIsTimeModeSelectionOpen(false);
    setIsGameSetupComplete(false);
    props.setIsMenuOpen(false);

    if (!softResetForModeChange) {
      setGameMode(null);
      const initialMessage = `Open menu or select a mode to start.`;
      // Don't toast on initial load, but maybe on explicit reset
      // props.addToast(initialMessage, 'info'); 
    } else {
       props.setGameStatus({ message: "Initializing new game...", isGameOver: false });
    }

  }, [props]); 

  const handleLogoClick = useCallback(() => {
    resetGameToWelcomeArena();
    props.setIsMenuOpen(false);
  }, [resetGameToWelcomeArena, props.setIsMenuOpen]);

  const handleSelectModeFromWelcomeArena = useCallback((modeId: WelcomeArenaMenuItemId) => {
    resetGameToWelcomeArena(true); 

    if (modeId === 'hof') {
      props.setViewingHallOfFame(true);
      setIsGameSetupPending(false);
      setGameMode(null);
      setIsTimeModeSelectionOpen(false);
      setIsGameSetupComplete(false);
    } else if (modeId === 'puzzle') {
      setIsGameSetupPending(false);
      setIsTimeModeSelectionOpen(false);
      props.setViewingHallOfFame(false);
      setGameMode('puzzle');
    } else {
      setIsGameSetupPending(false);
      setIsTimeModeSelectionOpen(false);
      props.setViewingHallOfFame(false);
      if (modeId === 'online') {
        props.setIsOnlineWarningModalOpen(true);
      } else {
        setGameMode(modeId as GameMode);
        setIsGameSetupPending(true);
        setIsTimeModeSelectionOpen(true);
      }
    }
    props.setIsMenuOpen(false);
  }, [resetGameToWelcomeArena, props]); 

  const handleProceedFromOnlineWarning = useCallback(() => {
    props.setIsOnlineWarningModalOpen(false);
    setIsGameSetupPending(false);
    setIsTimeModeSelectionOpen(false);
    props.setViewingHallOfFame(false);
    setGameMode('online');
    setIsGameSetupPending(true);
    setIsTimeModeSelectionOpen(true);
  }, [props]); 

  const handleTimeModeSelected = useCallback((selectedTime: number | null) => {
    props.setTimeLimitPerPlayer(selectedTime);
    setIsTimeModeSelectionOpen(false);
  }, [props.setTimeLimitPerPlayer]);

  const handlePlayerNameSetup = useCallback((p1Name: string, p2NameProvided?: string, difficulty?: AIDifficultyLevel) => {
    const finalP1Name = p1Name.trim() || "Player 1";
    let finalP2Name = "Player 2";
    props.setPlayer1Name(finalP1Name);

    if (gameMode === 'friend') {
      finalP2Name = p2NameProvided?.trim() || "Player 2";
      props.setPlayer2Name(finalP2Name, gameMode);
    } else if (gameMode === 'computer') {
      finalP2Name = AI_PLAYER_NAME;
      props.setPlayer2Name(finalP2Name, gameMode);
      if (difficulty) props.setAiDifficulty(difficulty);
    } else if (gameMode === 'coach') {
      finalP2Name = COACH_AI_PLAYER_NAME;
      props.setPlayer2Name(finalP2Name, gameMode);
      props.setAiDifficulty(AIDifficultyLevel.GRANDMASTER);
    }

    setIsGameSetupComplete(true);
    setIsGameSetupPending(false);
    props.setViewingHallOfFame(false);
    const startMsg = `Game started. Good luck, ${finalP1Name} and ${finalP2Name}! ${PlayerColor.WHITE}'s turn.`;
    props.setGameStatus({ message: startMsg, isGameOver: false }); 
    props.resetMoveHistory();
    if (props.setTimeLimitPerPlayer && (props as any).timeLimitPerPlayer) { 
        const startTime = Date.now();
        props.setPlayer1TimeLeft((props as any).timeLimitPerPlayer);
        props.setPlayer2TimeLeft((props as any).timeLimitPerPlayer);
        props.setGameStartTimeStamp(startTime);
    }
  }, [gameMode, props]);

  return {
    gameMode, setGameMode, 
    isGameSetupPending, setIsGameSetupPending,
    isTimeModeSelectionOpen, setIsTimeModeSelectionOpen,
    isGameSetupComplete, setIsGameSetupComplete,
    handleSelectModeFromWelcomeArena,
    resetGameToWelcomeArena,
    handleProceedFromOnlineWarning,
    handlePlayerNameSetup,
    handleTimeModeSelected,
    handleLogoClick,
  };
};