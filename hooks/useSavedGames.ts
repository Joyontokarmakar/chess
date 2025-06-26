
import { useState, useCallback, useEffect } from 'react';
import {
  SavedGame, GameMode, BoardState, PlayerColor, CastlingRights, Position, Piece,
  GameStatus, AIDifficultyLevel, ToastType
} from '../types';
import {
  getSavedGames as getSavedGamesFromStorage,
  saveGame as saveGameToStorageUtil,
  deleteSavedGame as deleteSavedGameFromStorageUtil,
  clearAllSavedGames as clearAllSavedGamesFromStorageUtil
} from '../utils/localStorageUtils';

interface UseSavedGamesProps {
  gameMode: GameMode | null;
  isGameSetupComplete: boolean;
  gameStatus: GameStatus;
  addToast: (message: string, type?: ToastType, duration?: number) => void;
  // Game state for saving
  player1Name: string;
  player2Name: string;
  timeLimitPerPlayer: number | null;
  boardState: BoardState;
  currentPlayer: PlayerColor;
  castlingRights: CastlingRights;
  enPassantTarget: Position | null;
  capturedByWhite: Piece[];
  capturedByBlack: Piece[];
  kingInCheckPosition: Position | null;
  aiDifficulty?: AIDifficultyLevel;
  player1TimeLeft: number | null;
  player2TimeLeft: number | null;
  gameStartTimeStamp: number | null;
  lastMove: { from: Position; to: Position } | null;
  // Functions to update App state after loading
  resetGameToWelcomeArena: (softReset?: boolean) => void;
  setGameMode: (mode: GameMode | null) => void;
  setBoardState: React.Dispatch<React.SetStateAction<BoardState>>;
  setCurrentPlayer: React.Dispatch<React.SetStateAction<PlayerColor>>;
  setPlayer1Name: (name: string) => void;
  setPlayer2Name: (name: string, gameMode?: GameMode) => void;
  setCastlingRights: React.Dispatch<React.SetStateAction<CastlingRights>>;
  setEnPassantTarget: React.Dispatch<React.SetStateAction<Position | null>>;
  setCapturedByWhite: React.Dispatch<React.SetStateAction<Piece[]>>;
  setCapturedByBlack: React.Dispatch<React.SetStateAction<Piece[]>>;
  setGameStatusDirectly: React.Dispatch<React.SetStateAction<GameStatus>>; // Direct setter
  setKingInCheckPosition: React.Dispatch<React.SetStateAction<Position | null>>;
  setLocalPlayerColorForStorage: (color: PlayerColor | null) => void; // From useOnlinePlay
  setAiDifficultyDirectly: (difficulty: AIDifficultyLevel) => void; // Direct setter
  setTimeLimitPerPlayerDirectly: (limit: number | null) => void; // Direct setter
  setPlayer1TimeLeftDirectly: (time: number | null) => void; // Direct setter
  setPlayer2TimeLeftDirectly: (time: number | null) => void; // Direct setter
  setGameStartTimeStampDirectly: (timestamp: number | null) => void; // Direct setter
  setLastMoveDirectly: React.Dispatch<React.SetStateAction<{ from: Position; to: Position } | null>>; // Direct setter
  setIsGameSetupCompleteDirectly: (complete: boolean) => void; // Direct setter
  setIsMenuOpen: (isOpen: boolean) => void; // From useUIState
  resetMoveHistory: () => void; // From useMoveHistory
}

export const useSavedGames = (props: UseSavedGamesProps) => {
  const [savedGames, setSavedGamesState] = useState<SavedGame[]>([]);

  useEffect(() => {
    setSavedGamesState(getSavedGamesFromStorage());
  }, []);

  const fetchSavedGames = useCallback(() => {
    setSavedGamesState(getSavedGamesFromStorage());
  }, []);

  const handleSaveCurrentGame = useCallback(() => {
    const gameCannotBeSavedDueToMode =
      props.gameMode === 'puzzle' ||
      props.gameMode === 'coach' ||
      props.gameMode === 'computer' ||
      props.gameMode === 'online';

    if (!props.gameMode || gameCannotBeSavedDueToMode || !props.isGameSetupComplete || props.gameStatus.isGameOver) {
      if (props.gameMode !== 'friend') {
        props.addToast("Game can only be saved in 'Play with Friend' mode.", 'warning');
      } else {
        props.addToast("Cannot save game at this time.", 'warning');
      }
      return;
    }

    const gameToSave: SavedGame = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `vs ${props.player2Name} ${props.timeLimitPerPlayer ? `(${props.timeLimitPerPlayer / 60} min)` : ''}`,
      timestamp: Date.now(),
      gameMode: 'friend', // Only friend mode save implemented this way
      boardState: props.boardState, currentPlayer: props.currentPlayer, player1Name: props.player1Name,
      player2Name: props.player2Name, castlingRights: props.castlingRights, enPassantTarget: props.enPassantTarget,
      capturedByWhite: props.capturedByWhite, capturedByBlack: props.capturedByBlack, gameStatus: props.gameStatus,
      kingInCheckPosition: props.kingInCheckPosition,
      originalLocalPlayerColor: null, 
      aiDifficulty: props.aiDifficulty,
      timeLimitPerPlayer: props.timeLimitPerPlayer, player1TimeLeft: props.player1TimeLeft,
      player2TimeLeft: props.player2TimeLeft, gameStartTimeStamp: props.gameStartTimeStamp, lastMove: props.lastMove,
    };
    saveGameToStorageUtil(gameToSave);
    fetchSavedGames();
    props.addToast("Game saved successfully!", 'success');
  }, [props, fetchSavedGames]);

  const handleLoadSavedGame = useCallback((gameId: string) => {
    const gameToLoad = savedGames.find(g => g.id === gameId);
    if (!gameToLoad) {
      props.addToast("Failed to load game.", 'error');
      return;
    }

    props.resetGameToWelcomeArena(true);
    props.setGameMode(gameToLoad.gameMode as GameMode | null); // Cast needed if gameMode type in SavedGame is stricter
    props.setBoardState(gameToLoad.boardState);
    props.setCurrentPlayer(gameToLoad.currentPlayer);
    props.setPlayer1Name(gameToLoad.player1Name);
    props.setPlayer2Name(gameToLoad.player2Name, gameToLoad.gameMode);
    props.setCastlingRights(gameToLoad.castlingRights);
    props.setEnPassantTarget(gameToLoad.enPassantTarget);
    props.setCapturedByWhite(gameToLoad.capturedByWhite);
    props.setCapturedByBlack(gameToLoad.capturedByBlack);
    props.setGameStatusDirectly(gameToLoad.gameStatus); // Use direct setter
    props.setKingInCheckPosition(gameToLoad.kingInCheckPosition);
    props.setLocalPlayerColorForStorage(gameToLoad.originalLocalPlayerColor || null);
    props.setAiDifficultyDirectly(gameToLoad.aiDifficulty || AIDifficultyLevel.MEDIUM);
    props.setTimeLimitPerPlayerDirectly(gameToLoad.timeLimitPerPlayer);
    props.setPlayer1TimeLeftDirectly(gameToLoad.player1TimeLeft);
    props.setPlayer2TimeLeftDirectly(gameToLoad.player2TimeLeft);
    props.setGameStartTimeStampDirectly(gameToLoad.gameStartTimeStamp);
    props.setLastMoveDirectly(gameToLoad.lastMove || null);
    props.setIsGameSetupCompleteDirectly(true);
    props.setIsMenuOpen(false);
    props.resetMoveHistory();
    props.addToast(`Game "${gameToLoad.name}" loaded.`, 'info');
  }, [savedGames, props]);

  const handleDeleteSavedGame = useCallback((gameId: string) => {
    deleteSavedGameFromStorageUtil(gameId);
    fetchSavedGames();
    props.addToast("Saved game deleted.", 'info');
  }, [props.addToast, fetchSavedGames]);

  const handleClearAllSavedGames = useCallback(() => {
    clearAllSavedGamesFromStorageUtil();
    fetchSavedGames();
    props.addToast("All saved games cleared.", 'info');
  }, [props.addToast, fetchSavedGames]);

  return {
    savedGames,
    handleSaveCurrentGame,
    handleLoadSavedGame,
    handleDeleteSavedGame,
    handleClearAllSavedGames,
  };
};
