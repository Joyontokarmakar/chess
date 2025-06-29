
import React, { useCallback, useState, useEffect } from 'react';
import { PlayerColor, PieceType, GameMode, AIMove, LayoutSettings, WelcomeArenaMenuItemId, Piece, Theme, AIDifficultyLevel, OnlineGameState, MoveHistoryEntry, Position, GameAnalysis, CompletedGame, WelcomeArenaMenuItem } from './types';
import { AI_PLAYER_NAME, COACH_AI_PLAYER_NAME, AI_DIFFICULTY_LEVELS } from './constants';
import { getCompletedGames, saveCompletedGame, clearCompletedGames } from './utils/localStorageUtils';

import Board from './components/Board';
import PromotionModal from './components/PromotionModal';
import { PlayerDisplayPanel } from './components/PlayerDisplayPanel';
import MenuModal from './components/MenuModal';
import PlayerNameEntry from './components/PlayerNameEntry';
import OnlineGameSetup from './components/OnlineGameSetup';
import HallOfFame from './components/HallOfFame';
import Logo from './components/Logo';
import LayoutCustomizationModal from './components/LayoutCustomizationModal';
import TimeModeSelectionModal from './components/TimeModeSelectionModal';
import ChessGuide from './components/ChessGuide';
import OnlineWarningModal from './components/OnlineWarningModal';
import ResignConfirmationModal from './components/ResignConfirmationModal';
import GameOverOverlay from './components/GameOverOverlay';
import PieceDisplay from './components/PieceDisplay';
import PuzzleControls from './components/PuzzleControls';
import ChangelogModal from './components/ChangelogModal';
import ToastContainer from './components/ToastContainer';
import RenamePlayerModal from './components/RenamePlayerModal';
import WelcomeModal from './components/WelcomeModal';
import AdBanner from './components/AdBanner';
import AnalysisView from './components/AnalysisView';
import GameHistoryModal from './components/GameHistoryModal';
import InfoModal from './components/InfoModal';
import AboutContent from './content/aboutContent';
import TermsContent from './content/termsContent';
import PrivacyContent from './content/privacyContent';
import { FaUndo, FaLightbulb } from 'react-icons/fa';

import { useTheme } from './hooks/useTheme';
import { useUIState } from './hooks/useUIState';
import { useLayoutSettings } from './hooks/useLayoutSettings';
import { useToasts } from './hooks/useToasts';
import { usePlayerManagement } from './hooks/usePlayerManagement';
import { useGameTimer } from './hooks/useGameTimer';
import { useMoveHistory } from './hooks/useMoveHistory';
import { useGameState } from './hooks/useGameState';
import { useAI } from './hooks/useAI';
import { useOnlinePlay } from './hooks/useOnlinePlay';
import { useSavedGames } from './hooks/useSavedGames';
import { useAnalysis } from './hooks/useAnalysis';

import { getPieceIconColor } from './utils/styleUtils';
import { getFirstVisitDone } from './utils/localStorageUtils';


const App: React.FC = () => {
  const { theme, toggleTheme } = useTheme();
  const { layoutSettings, handleLayoutSettingsChange, isLayoutSettingsInitialized } = useLayoutSettings(theme);
  
  const { 
    activeToasts, addToast, removeToast, determineToastTypeForGameStatus 
  } = useToasts(layoutSettings.showGameToasts);

  const {
    isMenuOpen, setIsMenuOpen,
    viewingHallOfFame, setViewingHallOfFame,
    isLayoutModalOpen, setIsLayoutModalOpen,
    isChessGuideOpen, setIsChessGuideOpen,
    isChangelogModalOpen, setIsChangelogModalOpen,
    isResignModalOpen, setIsResignModalOpen,
    playerAttemptingResign, setPlayerAttemptingResign,
    isRenameModalOpen, setIsRenameModalOpen,
    playerToRename, setPlayerToRename,
    isOnlineWarningModalOpen, setIsOnlineWarningModalOpen,
    showWelcomeModal,
    handleWelcomeModalClose,
    isGameHistoryModalOpen, setIsGameHistoryModalOpen,
    infoPage, setInfoPage,
    resetUIState
  } = useUIState(!getFirstVisitDone());

  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [isGameSetupPending, setIsGameSetupPending] = useState<boolean>(false);
  const [isTimeModeSelectionOpen, setIsTimeModeSelectionOpen] = useState<boolean>(false);
  const [isGameSetupComplete, setIsGameSetupComplete] = useState<boolean>(false);
  
  const {
    player1Name, setPlayer1Name,
    player2Name, setPlayer2Name,
    aiDifficulty, setAiDifficulty,
    handleRequestRename,
    executePlayerRename,
    cancelPlayerRename,
    getCurrentPlayerRealName,
    getOpponentPlayerName,
    resetPlayerManagementState
  } = usePlayerManagement({ addToast, setPlayerToRename, setIsRenameModalOpen });

  const {
    onlineGameIdForStorage, setOnlineGameIdForStorage,
    localPlayerColorForStorage, setLocalPlayerColorForStorage,
    isOnlineGameReadyForStorage, setIsOnlineGameReadyForStorage,
    lastMoveByRef, updateOnlineGameState, resetOnlinePlayState
  } = useOnlinePlay({
    gameMode, gameStatus: { message: "", isGameOver: false },
    setBoardState: () => {}, setCurrentPlayer: () => {}, setCastlingRights: () => {}, setEnPassantTarget: () => {},
    setCapturedByWhite: () => {}, setCapturedByBlack: () => {}, setGameStatus: () => {}, addToast, determineToastTypeForGameStatus,
    setPlayer1Name, setPlayer2Name, 
    setKingInCheckPosition: () => {}, setLastMove: () => {}, setTimeLimitPerPlayer: () => {}, setPlayer1TimeLeft: () => {}, setPlayer2TimeLeft: () => {},
    setGameStartTimeStamp: () => {}, setHasWinSoundPlayedThisGame: () => {}, layoutSettings, player2Name
  });

  const {
    timeLimitPerPlayer, setTimeLimitPerPlayer,
    player1TimeLeft, setPlayer1TimeLeft,
    player2TimeLeft, setPlayer2TimeLeft,
    gameStartTimeStamp, setGameStartTimeStamp,
    resetTimerState
  } = useGameTimer({ 
    currentPlayer: PlayerColor.WHITE, gameStatus: { message: "", isGameOver: false }, promotionSquare: null, isResignModalOpen, 
    boardState: [], castlingRights: { [PlayerColor.WHITE]: {kingSide:false, queenSide:false}, [PlayerColor.BLACK]: {kingSide:false, queenSide:false} }, enPassantTarget: null, updateGameStatus: async () => {},
    gameMode, onlineGameIdForStorage, localPlayerColorForStorage, updateOnlineGameState
  });
  
  const gameState = useGameState({
    player1Name, player2Name, getCurrentPlayerRealName, getOpponentPlayerName,
    layoutSettings, addToast, determineToastTypeForGameStatus,
    setPlayerAttemptingResign, setIsResignModalOpen, playerAttemptingResign,
    setPlayer1Name, setPlayer2Name,
    gameMode, gameStartTimeStamp,
    onlineGameIdForStorage, isOnlineGameReadyForStorage,
    updateOnlineGameState, lastMoveByRef,
  });

  const ai = useAI({
    gameStatus: gameState.gameStatus, currentPlayer: gameState.currentPlayer, promotionSquare: gameState.promotionSquare, 
    isResignModalOpen, isRenameModalOpen,
    boardState: gameState.boardState, castlingRights: gameState.castlingRights, enPassantTarget: gameState.enPassantTarget, 
    applyMove: gameState.applyMove,
    timeLimitPerPlayer, aiDifficulty, addToast, gameMode,
  });

  const moveHistory = useMoveHistory({
    gameStatus: gameState.gameStatus, currentPlayer: gameState.currentPlayer, isComputerThinking: ai.isComputerThinking,
    promotionSquare: gameState.promotionSquare, isResignModalOpen, isRenameModalOpen,
    gameMode,
    setBoardState: gameState.setBoardState, setCurrentPlayer: gameState.setCurrentPlayer, setCastlingRights: gameState.setCastlingRights, 
    setEnPassantTarget: gameState.setEnPassantTarget,
    setCapturedByWhite: gameState.setCapturedByWhite, setCapturedByBlack: gameState.setCapturedByBlack, 
    setGameStatus: gameState.setGameStatus, addToast,
    setKingInCheckPosition: gameState.setKingInCheckPosition, setLastMove: gameState.setLastMove, 
    setPlayer1TimeLeft, setPlayer2TimeLeft,
    setSelectedPiecePosition: gameState.setSelectedPiecePosition, setPossibleMoves: gameState.setPossibleMoves, 
    setPromotionSquare: gameState.setPromotionSquare,
    setHintSuggestion: ai.setHintSuggestion,
    setCoachExplanation: ai.setCoachExplanation,
    moveHistory: [],
  });
  
  const resetGameToWelcomeArena = useCallback((softResetForModeChange: boolean = false) => {
    gameState.resetCoreGameState();
    resetPlayerManagementState();
    resetTimerState();
    ai.resetAIState();
    moveHistory.resetMoveHistory();
    resetOnlinePlayState();
    
    resetUIState();
    setIsGameSetupPending(false);
    setIsTimeModeSelectionOpen(false);
    setIsGameSetupComplete(false);
    setIsMenuOpen(false);

    if (!softResetForModeChange) {
      setGameMode(null);
    } else {
       gameState.setGameStatus({ message: "Initializing new game...", isGameOver: false });
    }
  }, [gameState, resetPlayerManagementState, resetTimerState, ai, moveHistory, resetOnlinePlayState, resetUIState, setIsMenuOpen]);

  const handleLogoClick = useCallback(() => {
    resetGameToWelcomeArena(false);
    setIsMenuOpen(false);
  }, [resetGameToWelcomeArena, setIsMenuOpen]);

  const handleSelectModeFromWelcomeArena = useCallback((modeId: WelcomeArenaMenuItemId) => {
    resetGameToWelcomeArena(true); 

    if (modeId === 'hof') {
      setViewingHallOfFame(true);
      setGameMode(null);
    } else if (modeId === 'puzzle') {
      setGameMode('puzzle');
      setIsGameSetupPending(true);
      setViewingHallOfFame(false);
    } else {
      setViewingHallOfFame(false);
      if (modeId === 'online') {
        setIsOnlineWarningModalOpen(true);
      } else {
        setGameMode(modeId as GameMode);
        setIsGameSetupPending(true);
        setIsTimeModeSelectionOpen(true);
      }
    }
    setIsMenuOpen(false);
  }, [resetGameToWelcomeArena, setViewingHallOfFame, setIsOnlineWarningModalOpen, setIsMenuOpen]);

  const handleProceedFromOnlineWarning = useCallback(() => {
    setIsOnlineWarningModalOpen(false);
    setGameMode('online');
    setIsGameSetupPending(true);
    setIsTimeModeSelectionOpen(true);
  }, [setIsOnlineWarningModalOpen]);

  const handleTimeModeSelected = useCallback((selectedTime: number | null) => {
    setTimeLimitPerPlayer(selectedTime);
    setIsTimeModeSelectionOpen(false);
  }, [setTimeLimitPerPlayer]);

  const handlePlayerNameSetup = useCallback((p1Name: string, p2NameProvided?: string, difficulty?: AIDifficultyLevel) => {
    const finalP1Name = p1Name.trim() || "Player 1";
    let finalP2Name = "Player 2";
    setPlayer1Name(finalP1Name);

    if (gameMode === 'friend') {
      finalP2Name = p2NameProvided?.trim() || "Player 2";
      setPlayer2Name(finalP2Name, gameMode);
    } else if (gameMode === 'computer') {
      finalP2Name = AI_PLAYER_NAME;
      setPlayer2Name(finalP2Name, gameMode);
      if (difficulty) setAiDifficulty(difficulty);
    } else if (gameMode === 'coach') {
      finalP2Name = COACH_AI_PLAYER_NAME;
      setPlayer2Name(finalP2Name, gameMode);
      setAiDifficulty(AIDifficultyLevel.GRANDMASTER);
    }

    setIsGameSetupComplete(true);
    setIsGameSetupPending(false);
    setViewingHallOfFame(false);
    const startMsg = `Game started. Good luck, ${finalP1Name} and ${finalP2Name}! ${PlayerColor.WHITE}'s turn.`;
    gameState.setGameStatus({ message: startMsg, isGameOver: false }); 
    moveHistory.resetMoveHistory();
    if (timeLimitPerPlayer) { 
        const startTime = Date.now();
        setPlayer1TimeLeft(timeLimitPerPlayer);
        setPlayer2TimeLeft(timeLimitPerPlayer);
        setGameStartTimeStamp(startTime);
    }
  }, [gameMode, setPlayer1Name, setPlayer2Name, setAiDifficulty, gameState.setGameStatus, moveHistory.resetMoveHistory, timeLimitPerPlayer, setPlayer1TimeLeft, setPlayer2TimeLeft, setGameStartTimeStamp, setViewingHallOfFame]);
  
  useEffect(() => {
    if (gameMode === 'puzzle' && isGameSetupPending) {
      gameState.loadPuzzle(0); // Load the first puzzle
      setIsGameSetupPending(false);
      setIsGameSetupComplete(true);
    }
  }, [gameMode, isGameSetupPending, gameState.loadPuzzle]);
  
  const handleOnlineGameSetupComplete = useCallback((
    gameId: string, 
    isHost: boolean, 
    localPlayerName: string, 
    initialOnlineState: OnlineGameState
  ) => {
    resetGameToWelcomeArena(true); 

    setOnlineGameIdForStorage(gameId);
    setLocalPlayerColorForStorage(isHost ? PlayerColor.WHITE : PlayerColor.BLACK);
    setIsOnlineGameReadyForStorage(initialOnlineState.isGameReady);
    
    setGameMode('online');
    gameState.setBoardState(initialOnlineState.boardState);
    gameState.setCurrentPlayer(initialOnlineState.currentPlayer);
    gameState.setCastlingRights(initialOnlineState.castlingRights);
    gameState.setEnPassantTarget(initialOnlineState.enPassantTarget);
    gameState.setCapturedByWhite(initialOnlineState.capturedByWhite);
    gameState.setCapturedByBlack(initialOnlineState.capturedByBlack);
    gameState.setKingInCheckPosition(initialOnlineState.kingInCheckPosition);
    gameState.setLastMove(initialOnlineState.lastMove || null);

    setPlayer1Name(initialOnlineState.player1Name);
    if (initialOnlineState.player2Name) {
      setPlayer2Name(initialOnlineState.player2Name);
    } else {
      setPlayer2Name("Waiting for Player...");
    }

    setTimeLimitPerPlayer(initialOnlineState.timeLimitPerPlayer);
    setPlayer1TimeLeft(initialOnlineState.player1TimeLeft);
    setPlayer2TimeLeft(initialOnlineState.player2TimeLeft);
    setGameStartTimeStamp(initialOnlineState.gameStartTimeStamp);

    setIsGameSetupPending(false);
    setIsGameSetupComplete(true);
    
    gameState.setGameStatus(initialOnlineState.gameStatus);
    
    addToast(
      isHost 
        ? `Game created! ID: ${gameId}. Waiting for opponent.`
        : `Joined game ${gameId}! It's ${initialOnlineState.player1Name}'s turn.`,
      'success'
    );
  }, [
    resetGameToWelcomeArena, addToast,
    setOnlineGameIdForStorage, setLocalPlayerColorForStorage, setIsOnlineGameReadyForStorage, 
    setGameMode, gameState,
    setPlayer1Name, setPlayer2Name,
    setTimeLimitPerPlayer, setPlayer1TimeLeft, setPlayer2TimeLeft, setGameStartTimeStamp,
    setIsGameSetupPending, setIsGameSetupComplete
  ]);
  
  const [completedGames, setCompletedGames] = useState<CompletedGame[]>([]);
  const [lastProcessedGameTimestamp, setLastProcessedGameTimestamp] = useState<number | null>(null);

  useEffect(() => {
    setCompletedGames(getCompletedGames());
  }, []);

  useEffect(() => {
    if (gameState.gameStatus.isGameOver && gameMode && gameMode !== 'puzzle' && isGameSetupComplete && gameStartTimeStamp && lastProcessedGameTimestamp !== gameStartTimeStamp) {
      setLastProcessedGameTimestamp(gameStartTimeStamp);

      const finalHistory = [...moveHistory.moveHistory];
      const finalStateEntry = moveHistory.createHistoryEntry(
          gameState.boardState, gameState.currentPlayer, gameState.castlingRights, gameState.enPassantTarget,
          gameState.capturedByWhite, gameState.capturedByBlack, gameState.gameStatus, gameState.kingInCheckPosition,
          gameState.lastMove, player1TimeLeft, player2TimeLeft, finalHistory.length
      );
      finalHistory.push(finalStateEntry);

      const newCompletedGame: CompletedGame = {
        id: gameStartTimeStamp.toString(),
        player1Name,
        player2Name,
        gameMode,
        gameStartDate: new Date(gameStartTimeStamp).toISOString(),
        durationSeconds: gameStartTimeStamp ? (Date.now() - gameStartTimeStamp) / 1000 : null,
        result: {
          winner: gameState.gameStatus.winner,
          winnerName: gameState.gameStatus.winnerName,
          reason: gameState.gameStatus.reason
        },
        moveHistory: finalHistory
      };
      
      saveCompletedGame(newCompletedGame);
      setCompletedGames(getCompletedGames());
    }
  }, [gameState.gameStatus, gameMode, isGameSetupComplete, gameStartTimeStamp, lastProcessedGameTimestamp, moveHistory, gameState.boardState, gameState.currentPlayer, gameState.castlingRights, gameState.enPassantTarget, gameState.capturedByWhite, gameState.capturedByBlack, gameState.kingInCheckPosition, gameState.lastMove, player1TimeLeft, player2TimeLeft, player1Name, player2Name]);

  const { analysis, isAnalyzing, runAnalysis, clearAnalysis } = useAnalysis({ addToast });
  const [isAnalysisMode, setIsAnalysisMode] = useState(false);
  const [analysisTarget, setAnalysisTarget] = useState<{ moveHistory: MoveHistoryEntry[], player1Name: string, player2Name: string } | null>(null);

  const handleStartAnalysis = (gameToAnalyze: CompletedGame) => {
    if (!gameToAnalyze.moveHistory || gameToAnalyze.moveHistory.length === 0) {
      addToast("No game history available for analysis.", "warning");
      return;
    }
    setAnalysisTarget({
      moveHistory: gameToAnalyze.moveHistory,
      player1Name: gameToAnalyze.player1Name,
      player2Name: gameToAnalyze.player2Name,
    });
    runAnalysis(gameToAnalyze.moveHistory);
    setIsAnalysisMode(true);
    setIsGameHistoryModalOpen(false);
  };

  const handleExitAnalysis = () => {
    clearAnalysis();
    setIsAnalysisMode(false);
    setAnalysisTarget(null);
    resetGameToWelcomeArena(false);
  };

  const handleAnalyzeLatestGame = () => {
    const latestGame = getCompletedGames()[0];
    if (latestGame) {
      handleStartAnalysis(latestGame);
    } else {
      addToast("No completed games found to analyze.", "warning");
    }
  };
  
  const handleClearGameHistory = () => {
    if (window.confirm("Are you sure you want to clear all game history? This cannot be undone.")) {
      clearCompletedGames();
      setCompletedGames([]);
      addToast("Game history cleared.", "info");
    }
  };

  const handleRematch = useCallback(() => {
    gameState.resetCoreGameState();
    moveHistory.resetMoveHistory();
    ai.resetAIState();
    
    if (timeLimitPerPlayer) {
      const startTime = Date.now();
      setPlayer1TimeLeft(timeLimitPerPlayer);
      setPlayer2TimeLeft(timeLimitPerPlayer);
      setGameStartTimeStamp(startTime);
    } else {
      resetTimerState();
    }
    
    const startMsg = `Rematch! Good luck, ${player1Name} and ${player2Name}! ${PlayerColor.WHITE}'s turn.`;
    gameState.setGameStatus({ message: startMsg, isGameOver: false });
  }, [
    gameState, moveHistory.resetMoveHistory, ai.resetAIState, resetTimerState,
    timeLimitPerPlayer, setPlayer1TimeLeft, setPlayer2TimeLeft, setGameStartTimeStamp,
    player1Name, player2Name
  ]);
  
  const savedGamesHook = useSavedGames({
    gameMode, isGameSetupComplete, gameStatus: gameState.gameStatus, addToast,
    player1Name, player2Name, timeLimitPerPlayer, boardState: gameState.boardState, currentPlayer: gameState.currentPlayer,
    castlingRights: gameState.castlingRights, enPassantTarget: gameState.enPassantTarget, capturedByWhite: gameState.capturedByWhite, capturedByBlack: gameState.capturedByBlack,
    kingInCheckPosition: gameState.kingInCheckPosition, aiDifficulty, player1TimeLeft, player2TimeLeft,
    gameStartTimeStamp, lastMove: gameState.lastMove,
    resetGameToWelcomeArena: () => resetGameToWelcomeArena(true),
    setGameMode, setBoardState: gameState.setBoardState, setCurrentPlayer: gameState.setCurrentPlayer, setPlayer1Name, setPlayer2Name,
    setCastlingRights: gameState.setCastlingRights, setEnPassantTarget: gameState.setEnPassantTarget, setCapturedByWhite: gameState.setCapturedByWhite, setCapturedByBlack: gameState.setCapturedByBlack,
    setGameStatusDirectly: gameState.setGameStatus, setKingInCheckPosition: gameState.setKingInCheckPosition, setLocalPlayerColorForStorage,
    setAiDifficultyDirectly: setAiDifficulty, setTimeLimitPerPlayerDirectly: setTimeLimitPerPlayer,
    setPlayer1TimeLeftDirectly: setPlayer1TimeLeft, setPlayer2TimeLeftDirectly: setPlayer2TimeLeft,
    setGameStartTimeStampDirectly: setGameStartTimeStamp, setLastMoveDirectly: gameState.setLastMove,
    setIsGameSetupCompleteDirectly: setIsGameSetupComplete, setIsMenuOpen, resetMoveHistory: moveHistory.resetMoveHistory
  });

  const shouldShowWelcomeArena = (!gameMode || (!isGameSetupComplete && !isGameSetupPending)) &&
                               !viewingHallOfFame &&
                               !isChessGuideOpen &&
                               !isChangelogModalOpen &&
                               !isOnlineWarningModalOpen &&
                               !showWelcomeModal &&
                               !isAnalysisMode &&
                               !isGameHistoryModalOpen &&
                               !infoPage;

  const shouldShowGameArea = gameMode && gameMode !== 'puzzle' && isGameSetupComplete && !isAnalysisMode;
  const shouldShowPuzzleArea = gameMode === 'puzzle' && isGameSetupComplete && gameState.currentPuzzle && !isAnalysisMode;

  const showPlayerNameEntry = isGameSetupPending && (gameMode === 'friend' || gameMode === 'computer' || gameMode === 'coach') && !isTimeModeSelectionOpen && !viewingHallOfFame;
  const showOnlineGameSetup = isGameSetupPending && gameMode === 'online' && !isTimeModeSelectionOpen && !viewingHallOfFame;
  const showTimeModeSelection = isTimeModeSelectionOpen && gameMode && isGameSetupPending && !viewingHallOfFame;
  
  const showUndoButtonInGame = layoutSettings.showUndoButton && (gameMode === 'friend' || (gameMode === 'computer' && aiDifficulty !== AIDifficultyLevel.GRANDMASTER) || gameMode === 'coach');
  const showHintButtonInGame = layoutSettings.showHintButton && gameMode === 'coach';

  const headerTextColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const welcomePanelClasses = theme === 'dark' ? 'bg-slate-800/60 backdrop-blur-xl border border-slate-700/70 shadow-black/40' : 'bg-white/70 backdrop-blur-xl border-gray-300/70 shadow-gray-400/30';
  const welcomeTitleColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const welcomeSubTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  const welcomeArenaCardBaseClasses = `relative group w-full max-w-[11rem] h-44 sm:max-w-[12rem] sm:h-48 rounded-xl shadow-xl hover:shadow-2xl focus:outline-none transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center overflow-hidden p-3 text-center font-semibold backdrop-blur-xl border focus-visible:ring-4 focus-visible:ring-opacity-60`;
  const welcomeKingPiece: Piece = {type: PieceType.KING, color: PlayerColor.WHITE, hasMoved: true, id: 'welcome-king'};
  
  const sideButtonBase = `p-2 rounded-full transition-all duration-150 ease-in-out transform hover:scale-110 focus:outline-none focus-visible:ring-2 focus-visible:ring-opacity-75 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none`;
  const undoButtonTheme = theme === 'dark' ? 'bg-amber-600/80 hover:bg-amber-500/90 text-white focus-visible:ring-amber-300' : 'bg-amber-500/90 hover:bg-amber-600/95 text-white focus-visible:ring-amber-400';
  const hintButtonTheme = theme === 'dark' ? 'bg-sky-600/80 hover:bg-sky-500/90 text-white focus-visible:ring-sky-300' : 'bg-sky-500/90 hover:bg-sky-600/95 text-white focus-visible:ring-sky-400';

  const welcomeArenaGlowVarsDark = {
      friend: {'--glow-color-dark': 'rgba(34, 211, 238, 0.4)', '--glow-color-dark-soft': 'rgba(45, 212, 191, 0.3)'},
      computer: {'--glow-color-dark': 'rgba(251, 113, 133, 0.4)', '--glow-color-dark-soft': 'rgba(239, 68, 68, 0.3)'},
      coach: {'--glow-color-dark': 'rgba(129, 140, 248, 0.4)', '--glow-color-dark-soft': 'rgba(109, 99, 255, 0.3)'},
      online: {'--glow-color-dark': 'rgba(56, 189, 248, 0.4)', '--glow-color-dark-soft': 'rgba(99, 102, 241, 0.3)'},
      puzzle: {'--glow-color-dark': 'rgba(163, 230, 53, 0.4)', '--glow-color-dark-soft': 'rgba(132, 204, 22, 0.3)'},
      hof: {'--glow-color-dark': 'rgba(251, 191, 36, 0.5)', '--glow-color-dark-soft': 'rgba(249, 115, 22, 0.4)'},
  };
  const welcomeArenaGlowVarsLight = {
      friend: {'--glow-color-light': 'rgba(20, 184, 166, 0.3)', '--glow-color-light-soft': 'rgba(16, 185, 129, 0.2)'},
      computer: {'--glow-color-light': 'rgba(220, 38, 38, 0.3)', '--glow-color-light-soft': 'rgba(244, 63, 94, 0.2)'},
      coach: {'--glow-color-light': 'rgba(99, 102, 241, 0.3)', '--glow-color-light-soft': 'rgba(79, 70, 229, 0.2)'},
      online: {'--glow-color-light': 'rgba(14, 165, 233, 0.3)', '--glow-color-light-soft': 'rgba(79, 70, 229, 0.2)'},
      puzzle: {'--glow-color-light': 'rgba(101, 163, 13, 0.3)', '--glow-color-light-soft': 'rgba(77, 124, 15, 0.2)'},
      hof: {'--glow-color-light': 'rgba(245, 158, 11, 0.4)', '--glow-color-light-soft': 'rgba(234, 88, 12, 0.2)'},
  };
  const getWelcomeArenaCardThemeClasses = (baseColorName: string, currentTheme: Theme) => {
    let baseProps = currentTheme === 'dark'
      ? 'text-white border-white/20 focus-visible:ring-offset-slate-900 shadow-black/30 hover:shadow-black/50'
      : `text-slate-800 border-gray-400/40 focus-visible:ring-offset-gray-100 shadow-gray-400/20 hover:shadow-gray-400/40`;
    let hoverEffect = currentTheme === 'dark'
      ? 'hover:shadow-[0_0_25px_-5px_var(--glow-color-dark),_0_0_15px_-7px_var(--glow-color-dark-soft)]'
      : 'hover:shadow-[0_0_25px_-5px_var(--glow-color-light),_0_0_15px_-7px_var(--glow-color-light-soft)]';

    if (currentTheme === 'dark') {
      if (baseColorName === 'friend') return `${baseProps} bg-gradient-to-br from-teal-600/70 to-green-600/70 hover:from-teal-500/80 hover:to-green-500/80 focus-visible:ring-teal-400 ${hoverEffect}`;
      if (baseColorName === 'computer') return `${baseProps} bg-gradient-to-br from-rose-600/70 to-red-700/70 hover:from-rose-500/80 hover:to-red-600/80 focus-visible:ring-rose-400 ${hoverEffect}`;
      if (baseColorName === 'coach') return `${baseProps} bg-gradient-to-br from-indigo-600/70 to-purple-700/70 hover:from-indigo-500/80 hover:to-purple-600/80 focus-visible:ring-indigo-400 ${hoverEffect}`;
      if (baseColorName === 'online') return `${baseProps} bg-gradient-to-br from-sky-600/70 to-indigo-700/70 hover:from-sky-500/80 hover:to-indigo-600/80 focus-visible:ring-sky-400 ${hoverEffect}`;
      if (baseColorName === 'puzzle') return `${baseProps} bg-gradient-to-br from-lime-600/70 to-green-700/70 hover:from-lime-500/80 hover:to-green-600/80 focus-visible:ring-lime-400 ${hoverEffect}`;
      if (baseColorName === 'hof') return `${baseProps} bg-gradient-to-br from-amber-500/70 to-orange-600/70 hover:from-amber-500/80 hover:to-orange-500/80 focus-visible:ring-amber-400 ${hoverEffect}`;
    } else {
      if (baseColorName === 'friend') return `${baseProps} bg-gradient-to-br from-teal-400/80 to-green-400/80 hover:from-teal-500/80 hover:to-green-500/80 focus-visible:ring-teal-500 ${hoverEffect}`;
      if (baseColorName === 'computer') return `${baseProps} bg-gradient-to-br from-rose-500/80 to-red-500/80 hover:from-rose-600/80 hover:to-red-600/80 focus-visible:ring-rose-500 ${hoverEffect}`;
      if (baseColorName === 'coach') return `${baseProps} bg-gradient-to-br from-indigo-500/80 to-purple-500/80 hover:from-indigo-600/80 hover:to-purple-600/80 focus-visible:ring-indigo-500 ${hoverEffect}`;
      if (baseColorName === 'online') return `${baseProps} bg-gradient-to-br from-sky-500/80 to-indigo-500/80 hover:from-sky-600/80 hover:to-indigo-600/80 focus-visible:ring-sky-500 ${hoverEffect}`;
      if (baseColorName === 'puzzle') return `${baseProps} bg-gradient-to-br from-lime-500/80 to-green-500/80 hover:from-lime-600/80 hover:to-green-600/80 focus-visible:ring-lime-500 ${hoverEffect}`;
      if (baseColorName === 'hof') return `${baseProps} bg-gradient-to-br from-amber-400/80 to-orange-500/80 hover:from-amber-500/80 hover:to-orange-600/80 focus-visible:ring-amber-500 ${hoverEffect}`;
    }
    return '';
  };
  const welcomeArenaMenuItems: WelcomeArenaMenuItem[] = [
    { id: 'friend', label: 'Play Friend', icon: '🧑‍🤝‍🧑', baseColor: 'friend' },
    { id: 'computer', label: 'Play AI', icon: '🤖', baseColor: 'computer' },
    { id: 'coach', label: 'Learn with Coach', icon: '🧑‍🏫', baseColor: 'coach' },
    { id: 'online', label: 'Play Online', icon: '🌐', baseColor: 'online' },
    { id: 'puzzle', label: 'Puzzle Mode', icon: '🧩', baseColor: 'puzzle' },
    { id: 'hof', label: 'Hall of Fame', icon: '🏆', baseColor: 'hof' },
  ];
  
  if (!isLayoutSettingsInitialized) {
    return <div className={`min-h-screen flex items-center justify-center ${theme === 'dark' ? 'bg-slate-900 text-white' : 'bg-gray-100 text-black'}`}>Loading settings...</div>;
  }
  
  if (isAnalysisMode && analysisTarget) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-start pt-4 sm:pt-6 p-2 sm:p-3 bg-transparent">
            <ToastContainer toasts={activeToasts} onDismiss={removeToast} theme={theme} />
            <AnalysisView
                theme={theme}
                layoutSettings={layoutSettings}
                analysis={analysis}
                isAnalyzing={isAnalyzing}
                moveHistory={analysisTarget.moveHistory}
                onExit={handleExitAnalysis}
                player1Name={analysisTarget.player1Name}
                player2Name={analysisTarget.player2Name}
            />
        </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-4 sm:pt-6 p-2 sm:p-3 bg-transparent">
      <ToastContainer toasts={activeToasts} onDismiss={removeToast} theme={theme} />
      
      {infoPage && (
          <InfoModal
            isOpen={!!infoPage}
            onClose={() => setInfoPage(null)}
            theme={theme}
            title={
              infoPage === 'about' ? 'About the Developer' :
              infoPage === 'terms' ? 'Terms & Conditions' :
              'Privacy Policy'
            }
            content={
              infoPage === 'about' ? <AboutContent theme={theme} /> :
              infoPage === 'terms' ? <TermsContent theme={theme} /> :
              <PrivacyContent theme={theme} />
            }
          />
      )}

      {showWelcomeModal && (
        <WelcomeModal
            isOpen={showWelcomeModal}
            onClose={handleWelcomeModalClose}
            theme={theme}
        />
      )}
      <MenuModal
        isOpen={isMenuOpen}
        onClose={() => setIsMenuOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetToMainMenu={() => resetGameToWelcomeArena(true)}
        onSelectModeFromMenu={handleSelectModeFromWelcomeArena}
        onSaveCurrentGame={savedGamesHook.handleSaveCurrentGame}
        canSaveGame={gameMode === 'friend' && isGameSetupComplete && !gameState.gameStatus.isGameOver}
        gameMode={gameMode}
        savedGames={savedGamesHook.savedGames}
        onLoadSavedGame={savedGamesHook.handleLoadSavedGame}
        onDeleteSavedGame={savedGamesHook.handleDeleteSavedGame}
        onClearAllSavedGames={savedGamesHook.handleClearAllSavedGames}
        onOpenLayoutCustomization={() => { setIsLayoutModalOpen(true); setIsMenuOpen(false); }}
        onOpenChessGuide={() => { setIsChessGuideOpen(true); setIsMenuOpen(false); }}
        onOpenChangelog={() => { setIsChangelogModalOpen(true); setIsMenuOpen(false); }}
        layoutSettings={layoutSettings}
        onLayoutSettingsChange={handleLayoutSettingsChange}
        onOpenGameHistory={() => setIsGameHistoryModalOpen(true)}
        isHistoryAvailable={completedGames.length > 0}
      />
      {isGameHistoryModalOpen && (
        <GameHistoryModal
          isOpen={isGameHistoryModalOpen}
          onClose={() => setIsGameHistoryModalOpen(false)}
          theme={theme}
          games={completedGames}
          onAnalyze={handleStartAnalysis}
          onClearHistory={handleClearGameHistory}
        />
      )}
      {isLayoutModalOpen && (
        <LayoutCustomizationModal
            isOpen={isLayoutModalOpen}
            currentSettings={layoutSettings}
            onApplySettings={(newSettings) => {
                handleLayoutSettingsChange(newSettings);
                setIsLayoutModalOpen(false);
            }}
            onClose={() => setIsLayoutModalOpen(false)}
            theme={theme}
        />
       )}
       {isResignModalOpen && playerAttemptingResign && (
        <ResignConfirmationModal
          isOpen={isResignModalOpen}
          onConfirm={gameState.executeResignation}
          onCancel={() => setIsResignModalOpen(false)}
          resigningPlayerName={playerAttemptingResign === PlayerColor.WHITE ? player1Name : player2Name}
          winningPlayerName={playerAttemptingResign === PlayerColor.WHITE ? player2Name : player1Name}
          theme={theme}
        />
      )}
      {isRenameModalOpen && playerToRename && (
        <RenamePlayerModal
            isOpen={isRenameModalOpen}
            currentName={playerToRename === PlayerColor.WHITE ? player1Name : player2Name}
            onConfirm={executePlayerRename}
            onCancel={cancelPlayerRename}
            theme={theme}
        />
      )}
      {gameState.gameStatus.isGameOver && isGameSetupComplete && (gameMode !== 'puzzle' || (gameState.currentPuzzle && gameState.currentPuzzle.solution.length === gameState.puzzleSolutionStep)) && (
        <GameOverOverlay
          gameStatus={gameState.gameStatus}
          theme={theme}
          onRematch={handleRematch}
          onBackToHome={() => resetGameToWelcomeArena(false)}
          player1Name={player1Name}
          player2Name={player2Name}
          onAnalyzeGame={handleAnalyzeLatestGame}
        />
      )}

      <header className="mb-3 sm:mb-4 text-center w-full relative px-2 sm:px-4">
        <div className="flex items-center justify-between w-full">
            <button
                onClick={handleLogoClick}
                className={`p-1.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 ${theme === 'dark' ? 'hover:bg-slate-700/60 focus-visible:ring-sky-400' : 'hover:bg-gray-200/70 focus-visible:ring-sky-500'}`}
                aria-label="Home - Reset Game"
            >
                <Logo theme={theme} className={`w-12 h-12 sm:w-14 sm:h-14 ${headerTextColor}`} />
            </button>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl font-bold ${headerTextColor} absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 whitespace-nowrap`} style={{textShadow: theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2)' : '0 0 8px rgba(0,0,0,0.1)'}}>
                Classic Chess
            </h1>
            <button
                onClick={() => setIsMenuOpen(true)}
                className={`p-2.5 rounded-lg transition-colors focus:outline-none focus-visible:ring-2 ${theme === 'dark' ? 'text-slate-300 hover:text-white hover:bg-slate-700/60 focus-visible:ring-sky-400' : 'text-slate-600 hover:text-slate-900 hover:bg-gray-200/70 focus-visible:ring-sky-500'}`}
                aria-label="Open Game Menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-7 h-7 sm:w-8 sm:h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>
        </div>
      </header>

      {shouldShowWelcomeArena && (
         <div className="flex-grow flex flex-col items-center justify-center text-center p-4 w-full">
            <div className={`p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-xl ${welcomePanelClasses}`}>
                 <div className="flex justify-center mb-5 sm:mb-7">
                    <PieceDisplay piece={welcomeKingPiece} size="60px" color={getPieceIconColor(PlayerColor.WHITE, theme, layoutSettings)} className="drop-shadow-lg"/>
                </div>
                <h2 className={`text-2xl sm:text-3xl font-bold mb-2 ${welcomeTitleColor}`} style={{textShadow: theme === 'dark' ? '0 0 8px rgba(255,255,255,0.15)' : '0 0 6px rgba(0,0,0,0.1)'}}>
                    Welcome to the Arena!
                </h2>
                <p className={`text-sm sm:text-base mb-6 sm:mb-8 ${welcomeSubTextColor}`}>
                    Choose your challenge or explore past glories.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 sm:gap-4">
                    {welcomeArenaMenuItems.map(item => {
                        const cardThemeClasses = getWelcomeArenaCardThemeClasses(item.baseColor, theme);
                        // @ts-ignore
                        const glowVars = (theme === 'dark' ? welcomeArenaGlowVarsDark : welcomeArenaGlowVarsLight)[item.baseColor];
                        return (
                            <button key={item.id} onClick={() => handleSelectModeFromWelcomeArena(item.id)}
                                className={`${welcomeArenaCardBaseClasses} ${cardThemeClasses}`}
                                style={glowVars as React.CSSProperties} aria-label={item.label}>
                                <span className="text-3xl sm:text-4xl mb-1.5 group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                <span className="text-xs sm:text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      {viewingHallOfFame && (
        <HallOfFame onBackToMenu={() => { setViewingHallOfFame(false); setIsMenuOpen(true); }} theme={theme} />
      )}

      {showPlayerNameEntry && (
        <PlayerNameEntry
          gameMode={gameMode!}
          onSetupComplete={handlePlayerNameSetup}
          onBackToMenu={() => { resetGameToWelcomeArena(false); setIsMenuOpen(true);}}
          theme={theme}
        />
      )}

      {showOnlineGameSetup && (
        <OnlineGameSetup
          onGameSetupComplete={handleOnlineGameSetupComplete}
          onBackToMenu={() => { resetGameToWelcomeArena(false); setIsMenuOpen(true);}}
          theme={theme}
          initialTimeLimit={timeLimitPerPlayer}
        />
      )}

      {shouldShowGameArea && (
        <main className="flex flex-col items-center space-y-1 sm:space-y-2 w-full mt-2">
            <PlayerDisplayPanel
                playerName={player2Name}
                playerColor={PlayerColor.BLACK}
                capturedPieces={gameState.capturedByBlack}
                isCurrentTurn={gameState.currentPlayer === PlayerColor.BLACK && !gameState.gameStatus.isGameOver}
                theme={theme}
                layoutSettings={layoutSettings}
                timeLeft={player2TimeLeft}
                timeLimit={timeLimitPerPlayer}
                onRenameRequest={handleRequestRename}
                onResignRequest={() => { setPlayerAttemptingResign(PlayerColor.BLACK); setIsResignModalOpen(true); }}
                showResignButton={layoutSettings.showResignButton}
                isResignDisabled={!!gameState.promotionSquare || isResignModalOpen || isRenameModalOpen || gameState.gameStatus.isGameOver}
                gameMode={gameMode}
                isGameOver={gameState.gameStatus.isGameOver}
            />

            <div className="flex items-center justify-center w-full max-w-max mx-auto mt-2 space-x-2 sm:space-x-3">
                 {showUndoButtonInGame ? (
                    <button
                        onClick={moveHistory.handleUndoMove}
                        disabled={moveHistory.moveHistory.length === 0 || gameState.gameStatus.isGameOver || ((gameMode === 'computer' || gameMode === 'coach') && ai.isComputerThinking) || !!gameState.promotionSquare || isResignModalOpen || isRenameModalOpen}
                        className={`${sideButtonBase} ${undoButtonTheme} w-10 h-10 sm:w-12 sm:h-12`}
                        aria-label="Undo last move"
                        title="Undo Move"
                    >
                        <FaUndo size="1.2em" />
                    </button>
                 ) : <div className="w-10 sm:w-12 h-10 sm:h-12" /> }

                <Board boardState={gameState.boardState} onSquareClick={gameState.handleSquareClick} selectedPiecePosition={gameState.selectedPiecePosition} possibleMoves={gameState.possibleMoves} currentPlayer={gameState.currentPlayer} kingInCheckPosition={gameState.kingInCheckPosition} theme={theme} layoutSettings={layoutSettings} lastMove={gameState.lastMove} hintSuggestion={ai.hintSuggestion} hintKey={ai.hintKey}/>

                {showHintButtonInGame ? (
                    <button
                        onClick={ai.handleRequestHint}
                        disabled={gameState.gameStatus.isGameOver || (gameState.currentPlayer === PlayerColor.BLACK && ai.isComputerThinking) || !!gameState.promotionSquare || isResignModalOpen || isRenameModalOpen}
                        className={`${sideButtonBase} ${hintButtonTheme} w-10 h-10 sm:w-12 sm:h-12`}
                        aria-label="Request Coach Hint"
                        title="Get Coach Hint"
                    >
                        <FaLightbulb size="1.2em" />
                    </button>
                ) : <div className="w-10 sm:w-12 h-10 sm:h-12" /> }
            </div>

            <PlayerDisplayPanel
                playerName={player1Name}
                playerColor={PlayerColor.WHITE}
                capturedPieces={gameState.capturedByWhite}
                isCurrentTurn={gameState.currentPlayer === PlayerColor.WHITE && !gameState.gameStatus.isGameOver}
                theme={theme}
                layoutSettings={layoutSettings}
                timeLeft={player1TimeLeft}
                timeLimit={timeLimitPerPlayer}
                onRenameRequest={handleRequestRename}
                onResignRequest={() => { setPlayerAttemptingResign(PlayerColor.WHITE); setIsResignModalOpen(true); }}
                showResignButton={layoutSettings.showResignButton}
                isResignDisabled={!!gameState.promotionSquare || isResignModalOpen || isRenameModalOpen || gameState.gameStatus.isGameOver}
                gameMode={gameMode}
                isGameOver={gameState.gameStatus.isGameOver}
            />
            
            {gameMode === 'online' && onlineGameIdForStorage && isGameSetupComplete && (
                <div className={`mt-2 p-2 rounded-lg text-xs shadow-md ${theme === 'dark' ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50' : 'bg-gray-100/70 text-slate-600 border border-gray-300/50'}`}>
                    Online Game ID: <strong className={theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}>{onlineGameIdForStorage}</strong> (Same device simulation)
                </div>
            )}
        </main>
      )}

      {shouldShowPuzzleArea && gameState.currentPuzzle && (
        <main className="flex flex-col items-center space-y-3 sm:space-y-4 w-full mt-2">
            <PuzzleControls
                theme={theme}
                puzzle={gameState.currentPuzzle}
                onNextPuzzle={() => gameState.loadPuzzle(gameState.currentPuzzleIndex + 1 >= 10 ? 0 : gameState.currentPuzzleIndex + 1)} // Assuming PUZZLES.length
                onPrevPuzzle={() => gameState.loadPuzzle(gameState.currentPuzzleIndex - 1 < 0 ? 9 : gameState.currentPuzzleIndex - 1)} // Assuming PUZZLES.length
                onResetPuzzle={() => gameState.loadPuzzle(gameState.currentPuzzleIndex)}
                isFirstPuzzle={gameState.currentPuzzleIndex === 0}
                isLastPuzzle={gameState.currentPuzzleIndex === 9} // Assuming PUZZLES.length
            />
            <Board boardState={gameState.boardState} onSquareClick={gameState.handleSquareClick} selectedPiecePosition={gameState.selectedPiecePosition} possibleMoves={gameState.possibleMoves} currentPlayer={gameState.currentPlayer} kingInCheckPosition={gameState.kingInCheckPosition} theme={theme} layoutSettings={layoutSettings} lastMove={gameState.lastMove} hintSuggestion={null} />
        </main>
      )}

      {showTimeModeSelection && (
        <TimeModeSelectionModal
          isOpen={isTimeModeSelectionOpen}
          onClose={handleTimeModeSelected}
          theme={theme}
        />
      )}
      {isOnlineWarningModalOpen && (
        <OnlineWarningModal
            isOpen={isOnlineWarningModalOpen}
            onProceed={handleProceedFromOnlineWarning}
            onCancel={() => { setIsOnlineWarningModalOpen(false); resetGameToWelcomeArena(false); }}
            theme={theme}
        />
      )}
      {gameState.promotionSquare && gameMode && isGameSetupComplete && !gameState.gameStatus.isGameOver && (
        <PromotionModal playerColor={gameState.boardState[gameState.promotionSquare[0]][gameState.promotionSquare[1]]?.color || gameState.currentPlayer} onPromote={gameState.handlePromotion} theme={theme} layoutSettings={layoutSettings} />
      )}
      {isChessGuideOpen && (
        <ChessGuide
            isOpen={isChessGuideOpen}
            onClose={() => { setIsChessGuideOpen(false); setIsMenuOpen(true); }}
            theme={theme}
            layoutSettings={layoutSettings}
        />
      )}
      {isChangelogModalOpen && (
        <ChangelogModal
          isOpen={isChangelogModalOpen}
          onClose={() => { setIsChangelogModalOpen(false); setIsMenuOpen(true); }}
          theme={theme}
        />
      )}
       <footer className={`mt-auto pt-6 sm:pt-8 text-center text-xs ${theme === 'dark' ? 'text-slate-400' : 'text-slate-500'}`}>
        <div className="mb-2">
          <AdBanner 
            theme={theme}
            slot="YOUR_AD_SLOT_ID"
          />
        </div>
        <div className="mb-2 space-x-4">
          <button onClick={() => setInfoPage('about')} className="hover:underline focus:outline-none focus:ring-1 rounded">About the Developer</button>
          <button onClick={() => setInfoPage('terms')} className="hover:underline focus:outline-none focus:ring-1 rounded">Terms & Conditions</button>
          <button onClick={() => setInfoPage('privacy')} className="hover:underline focus:outline-none focus:ring-1 rounded">Privacy Policy</button>
        </div>
        <p>{'©'} 2025 Joyonto Karmakar. All Rights Reserved.</p>
      </footer>
    </div>
  );
};

export default App;
