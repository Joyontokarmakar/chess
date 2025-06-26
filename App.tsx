

import React, { useCallback } from 'react';
import { PlayerColor, PieceType, GameMode, AIMove, LayoutSettings, BoardStyleId, WelcomeArenaMenuItem, WelcomeArenaMenuItemId, Piece, Theme, AIDifficultyLevel, OnlineGameState, MoveHistoryEntry, Position } from './types';
import { PUZZLES, AI_PLAYER_NAME, AI_DIFFICULTY_LEVELS } from './constants';

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
import { FaFlag, FaUndo, FaLightbulb } from 'react-icons/fa';

import { useTheme } from './hooks/useTheme';
import { useUIState } from './hooks/useUIState';
import { useLayoutSettings } from './hooks/useLayoutSettings';
import { useToasts } from './hooks/useToasts';
import { usePlayerManagement } from './hooks/usePlayerManagement';
import { useGameTimer } from './hooks/useGameTimer';
import { useMoveHistory } from './hooks/useMoveHistory';
import { useGameState } from './hooks/useGameState';
import { useAI } from './hooks/useAI';
import { usePuzzleMode } from './hooks/usePuzzleMode';
import { useOnlinePlay } from './hooks/useOnlinePlay';
import { useSavedGames } from './hooks/useSavedGames';
import { useGameFlow } from './hooks/useGameFlow';

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
    resetUIState
  } = useUIState(!getFirstVisitDone());

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
    gameMode: null, // Placeholder, updated by gameFlow
    gameStatus: {isGameOver: false, message: ''}, // Placeholder
    setBoardState: () => {}, setCurrentPlayer: () => {}, setCastlingRights: () => {}, setEnPassantTarget: () => {},
    setCapturedByWhite: () => {}, setCapturedByBlack: () => {}, setGameStatus: () => {}, addToast, determineToastTypeForGameStatus,
    setPlayer1Name, setPlayer2Name, 
    setKingInCheckPosition: () => {}, setLastMove: () => {}, setTimeLimitPerPlayer: () => {}, setPlayer1TimeLeft: () => {}, setPlayer2TimeLeft: () => {},
    setGameStartTimeStamp: () => {}, setHasWinSoundPlayedThisGame: () => {}, layoutSettings, player2Name
  });
  
  const {
    currentPuzzle, currentPuzzleIndex,
    puzzleSolutionStep, setPuzzleSolutionStep,
    loadPuzzle, handlePuzzleMove, resetPuzzleState
  } = usePuzzleMode({
    resetGameToWelcomeArena: () => {}, // Placeholder
    setGameMode: () => {}, setIsGameSetupComplete: () => {}, setBoardState: () => {}, setCurrentPlayer: () => {},
    setCastlingRights: () => {}, setEnPassantTarget: () => {}, setKingInCheckPosition: () => {}, setGameStatus: () => {},
    setPlayer1Name, setPlayer2Name, addToast,
    applyMove: async () => {}, setSelectedPiecePosition: () => {}, setPossibleMoves: () => {}, setPromotionSquare: () => {}
  });

  const {
    boardState, setBoardState, currentPlayer, setCurrentPlayer,
    selectedPiecePosition, setSelectedPiecePosition, possibleMoves, setPossibleMoves,
    castlingRights, setCastlingRights, enPassantTarget, setEnPassantTarget,
    promotionSquare, setPromotionSquare, kingInCheckPosition, setKingInCheckPosition,
    gameStatus, setGameStatus, lastMove, setLastMove,
    capturedByWhite, setCapturedByWhite, capturedByBlack, setCapturedByBlack,
    hasWinSoundPlayedThisGame, setHasWinSoundPlayedThisGame,
    applyMove, handleSquareClick, handlePromotion, updateGameStatus,
    executeResignation, resetCoreGameState
  } = useGameState({
    player1Name, player2Name, getCurrentPlayerRealName, getOpponentPlayerName,
    layoutSettings, addToast, determineToastTypeForGameStatus,
    setPlayerAttemptingResign, setIsResignModalOpen, playerAttemptingResign,
    gameMode: null, gameStartTimeStamp: null,
    onlineGameIdForStorage, isOnlineGameReadyForStorage, updateOnlineGameState, lastMoveByRef,
    currentPuzzle, handleSuccessfulPuzzleMove: (comment?: string) => {
      if (currentPuzzle && puzzleSolutionStep + 1 >= currentPuzzle.solution.length) {
        const successMsg = `Correct! Puzzle Solved: ${currentPuzzle.title}`;
        addToast(successMsg, 'success');
        setGameStatus({ message: `Puzzle Solved! ${comment || ''}`, isGameOver: true });
      } else {
        const correctMsg = `Correct! ${comment || 'Good move!'}`;
        addToast(correctMsg, 'info');
      }
      setPuzzleSolutionStep(prev => prev + 1);
    },
    player1TimeLeft: null, player2TimeLeft: null
  });

  const {
    timeLimitPerPlayer, setTimeLimitPerPlayer,
    player1TimeLeft, setPlayer1TimeLeft,
    player2TimeLeft, setPlayer2TimeLeft,
    gameStartTimeStamp, setGameStartTimeStamp,
    resetTimerState
  } = useGameTimer({ 
    currentPlayer, gameStatus, promotionSquare, isResignModalOpen, 
    boardState, castlingRights, enPassantTarget, updateGameStatus,
    gameMode: null, onlineGameIdForStorage, localPlayerColorForStorage, updateOnlineGameState
  });

  const {
    isComputerThinking, handleRequestHint, hintSuggestion, hintKey, resetAIState,
    setHintSuggestion, setCoachExplanation,
  } = useAI({
    gameStatus, currentPlayer, promotionSquare, isResignModalOpen, isRenameModalOpen,
    boardState, castlingRights, enPassantTarget, applyMove,
    timeLimitPerPlayer, aiDifficulty, addToast, gameMode: null,
  });

  const {
    moveHistory, addMoveToHistory, createHistoryEntry, handleUndoMove, resetMoveHistory
  } = useMoveHistory({
    gameStatus, currentPlayer, isComputerThinking,
    promotionSquare, isResignModalOpen, isRenameModalOpen,
    gameMode: null,
    setBoardState, setCurrentPlayer, setCastlingRights, setEnPassantTarget,
    setCapturedByWhite, setCapturedByBlack, setGameStatus, addToast,
    setKingInCheckPosition, setLastMove, setPlayer1TimeLeft, setPlayer2TimeLeft,
    setSelectedPiecePosition, setPossibleMoves, setPromotionSquare,
    setHintSuggestion, setCoachExplanation,
  });

  const {
    gameMode, setGameMode, isGameSetupPending, setIsGameSetupPending,
    isTimeModeSelectionOpen, setIsTimeModeSelectionOpen, isGameSetupComplete, setIsGameSetupComplete,
    handleSelectModeFromWelcomeArena, resetGameToWelcomeArena,
    handleProceedFromOnlineWarning, handlePlayerNameSetup,
    handleLogoClick
  } = useGameFlow({
    setViewingHallOfFame, setIsMenuOpen, setIsOnlineWarningModalOpen,
    resetCoreGameState, resetPlayerManagementState, resetTimerState,
    resetAIState, resetMoveHistory, resetPuzzleState, resetOnlinePlayState,
    setPlayer1Name, setPlayer2Name, setAiDifficulty,
    setTimeLimitPerPlayer, setGameStartTimeStamp, setPlayer1TimeLeft, setPlayer2TimeLeft,
    setGameStatus, addToast
  });

  // --- Orchestration Callbacks ---
  const handleAppApplyMove = useCallback(async (from: Position, to: Position, promotionType?: PieceType) => {
    // Before move, create a history entry
    const historyEntry = createHistoryEntry(
        boardState, currentPlayer, castlingRights, enPassantTarget,
        capturedByWhite, capturedByBlack, gameStatus, kingInCheckPosition,
        lastMove, player1TimeLeft, player2TimeLeft
    );
    addMoveToHistory(historyEntry);
    await applyMove(from, to, promotionType);
  }, [
    createHistoryEntry, boardState, currentPlayer, castlingRights, enPassantTarget,
    capturedByWhite, capturedByBlack, gameStatus, kingInCheckPosition,
    lastMove, player1TimeLeft, player2TimeLeft, addMoveToHistory, applyMove
  ]);

  const handleOnlineGameSetupComplete = useCallback((
    gameId: string, isHost: boolean, localPName: string, initialOnlineState: OnlineGameState
  ) => {
    resetGameToWelcomeArena(true);
    setOnlineGameIdForStorage(gameId);
    setLocalPlayerColorForStorage(isHost ? PlayerColor.WHITE : PlayerColor.BLACK);
    setBoardState(initialOnlineState.boardState);
    setCurrentPlayer(initialOnlineState.currentPlayer);
    setCastlingRights(initialOnlineState.castlingRights);
    setEnPassantTarget(initialOnlineState.enPassantTarget);
    setCapturedByWhite(initialOnlineState.capturedByWhite);
    setCapturedByBlack(initialOnlineState.capturedByBlack);
    setGameStatus(initialOnlineState.gameStatus);
    setKingInCheckPosition(initialOnlineState.kingInCheckPosition);
    setPlayer1Name(initialOnlineState.player1Name);
    setPlayer2Name(initialOnlineState.player2Name || (isHost ? "Waiting..." : localPName), 'online');
    setIsOnlineGameReadyForStorage(initialOnlineState.isGameReady);
    setLastMove(initialOnlineState.lastMove || null);
    setTimeLimitPerPlayer(initialOnlineState.timeLimitPerPlayer);
    setPlayer1TimeLeft(initialOnlineState.player1TimeLeft);
    setPlayer2TimeLeft(initialOnlineState.player2TimeLeft);
    setGameStartTimeStamp(initialOnlineState.gameStartTimeStamp);
    resetMoveHistory();
    setGameMode('online');
    setIsGameSetupComplete(true);
    setIsGameSetupPending(false);
    setViewingHallOfFame(false);
    setIsMenuOpen(false);
  }, [
    resetGameToWelcomeArena, setOnlineGameIdForStorage, setLocalPlayerColorForStorage,
    setBoardState, setCurrentPlayer, setCastlingRights, setEnPassantTarget,
    setCapturedByWhite, setCapturedByBlack, setGameStatus, setKingInCheckPosition,
    setLastMove, setPlayer1Name, setPlayer2Name, setIsOnlineGameReadyForStorage,
    setTimeLimitPerPlayer, setPlayer1TimeLeft, setPlayer2TimeLeft, setGameStartTimeStamp,
    resetMoveHistory, setGameMode, setIsGameSetupComplete, setIsGameSetupPending,
    setViewingHallOfFame, setIsMenuOpen
  ]);
  
  const {
    savedGames, handleSaveCurrentGame, handleLoadSavedGame,
    handleDeleteSavedGame, handleClearAllSavedGames,
  } = useSavedGames({
    gameMode, isGameSetupComplete, gameStatus, addToast,
    player1Name, player2Name, timeLimitPerPlayer, boardState, currentPlayer,
    castlingRights, enPassantTarget, capturedByWhite, capturedByBlack,
    kingInCheckPosition, aiDifficulty, player1TimeLeft, player2TimeLeft,
    gameStartTimeStamp, lastMove,
    resetGameToWelcomeArena: () => resetGameToWelcomeArena(true),
    setGameMode, setBoardState, setCurrentPlayer, setPlayer1Name, setPlayer2Name,
    setCastlingRights, setEnPassantTarget, setCapturedByWhite, setCapturedByBlack,
    setGameStatusDirectly: setGameStatus, setKingInCheckPosition, setLocalPlayerColorForStorage,
    setAiDifficultyDirectly: setAiDifficulty, setTimeLimitPerPlayerDirectly: setTimeLimitPerPlayer,
    setPlayer1TimeLeftDirectly: setPlayer1TimeLeft, setPlayer2TimeLeftDirectly: setPlayer2TimeLeft,
    setGameStartTimeStampDirectly: setGameStartTimeStamp, setLastMoveDirectly: setLastMove,
    setIsGameSetupCompleteDirectly: setIsGameSetupComplete, setIsMenuOpen, resetMoveHistory
  });

  // Derived UI visibility conditions
  const shouldShowWelcomeArena = (!gameMode || (!isGameSetupComplete && !isGameSetupPending)) &&
                               !viewingHallOfFame &&
                               !isChessGuideOpen &&
                               !isChangelogModalOpen &&
                               !isOnlineWarningModalOpen &&
                               !showWelcomeModal;

  const shouldShowGameArea = gameMode && gameMode !== 'puzzle' && isGameSetupComplete;
  const shouldShowPuzzleArea = gameMode === 'puzzle' && isGameSetupComplete && currentPuzzle;

  const showPlayerNameEntry = isGameSetupPending && (gameMode === 'friend' || gameMode === 'computer' || gameMode === 'coach') && !isTimeModeSelectionOpen && !viewingHallOfFame;
  const showOnlineGameSetup = isGameSetupPending && gameMode === 'online' && !isTimeModeSelectionOpen && !viewingHallOfFame;
  const showTimeModeSelection = isTimeModeSelectionOpen && gameMode && isGameSetupPending && !viewingHallOfFame;
  
  const showUndoButtonInGame = layoutSettings.showUndoButton && (gameMode === 'friend' || (gameMode === 'computer' && aiDifficulty !== AIDifficultyLevel.GRANDMASTER) || gameMode === 'coach');
  const showHintButtonInGame = layoutSettings.showHintButton && gameMode === 'coach';


  // Constants for rendering
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

  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-4 sm:pt-6 p-2 sm:p-3 bg-transparent">
      <ToastContainer toasts={activeToasts} onDismiss={removeToast} theme={theme} />
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
        onSaveCurrentGame={handleSaveCurrentGame}
        canSaveGame={gameMode === 'friend' && isGameSetupComplete && !gameStatus.isGameOver}
        gameMode={gameMode}
        savedGames={savedGames}
        onLoadSavedGame={handleLoadSavedGame}
        onDeleteSavedGame={handleDeleteSavedGame}
        onClearAllSavedGames={handleClearAllSavedGames}
        onOpenLayoutCustomization={() => { setIsLayoutModalOpen(true); setIsMenuOpen(false); }}
        onOpenChessGuide={() => { setIsChessGuideOpen(true); setIsMenuOpen(false); }}
        onOpenChangelog={() => { setIsChangelogModalOpen(true); setIsMenuOpen(false); }}
        layoutSettings={layoutSettings}
        onLayoutSettingsChange={handleLayoutSettingsChange}
      />
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
          onConfirm={executeResignation}
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
      {gameStatus.isGameOver && isGameSetupComplete && (gameMode !== 'puzzle' || (currentPuzzle && currentPuzzle.solution.length === puzzleSolutionStep)) && (
        <GameOverOverlay
          gameStatus={gameStatus}
          theme={theme}
          onPlayAgain={() => resetGameToWelcomeArena(false)}
          player1Name={player1Name}
          player2Name={player2Name}
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
        <HallOfFame onBackToMenu={() => { resetGameToWelcomeArena(false); setViewingHallOfFame(false); setIsMenuOpen(true); }} theme={theme} />
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
                capturedPieces={capturedByBlack}
                isCurrentTurn={currentPlayer === PlayerColor.BLACK && !gameStatus.isGameOver}
                theme={theme}
                layoutSettings={layoutSettings}
                timeLeft={player2TimeLeft}
                timeLimit={timeLimitPerPlayer}
                onRenameRequest={handleRequestRename}
                onResignRequest={() => { setPlayerAttemptingResign(PlayerColor.BLACK); setIsResignModalOpen(true); }}
                showResignButton={layoutSettings.showResignButton}
                isResignDisabled={!!promotionSquare || isResignModalOpen || isRenameModalOpen || gameStatus.isGameOver}
                gameMode={gameMode}
                isGameOver={gameStatus.isGameOver}
            />

            <div className="flex items-center justify-center w-full max-w-max mx-auto mt-2 space-x-2 sm:space-x-3">
                 {showUndoButtonInGame ? (
                    <button
                        onClick={handleUndoMove}
                        disabled={moveHistory.length === 0 || gameStatus.isGameOver || ((gameMode === 'computer' || gameMode === 'coach') && isComputerThinking) || !!timeLimitPerPlayer || !!promotionSquare || isResignModalOpen || isRenameModalOpen}
                        className={`${sideButtonBase} ${undoButtonTheme} w-10 h-10 sm:w-12 sm:h-12`}
                        aria-label="Undo last move"
                        title="Undo Move"
                    >
                        <FaUndo size="1.2em" />
                    </button>
                 ) : <div className="w-10 sm:w-12 h-10 sm:h-12" /> }

                <Board boardState={boardState} onSquareClick={handleSquareClick} selectedPiecePosition={selectedPiecePosition} possibleMoves={possibleMoves} currentPlayer={currentPlayer} kingInCheckPosition={kingInCheckPosition} theme={theme} layoutSettings={layoutSettings} lastMove={lastMove} hintSuggestion={hintSuggestion} hintKey={hintKey}/>

                {showHintButtonInGame ? (
                    <button
                        onClick={handleRequestHint}
                        disabled={gameStatus.isGameOver || (currentPlayer === PlayerColor.BLACK && isComputerThinking) || !!promotionSquare || isResignModalOpen || isRenameModalOpen}
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
                capturedPieces={capturedByWhite}
                isCurrentTurn={currentPlayer === PlayerColor.WHITE && !gameStatus.isGameOver}
                theme={theme}
                layoutSettings={layoutSettings}
                timeLeft={player1TimeLeft}
                timeLimit={timeLimitPerPlayer}
                onRenameRequest={handleRequestRename}
                onResignRequest={() => { setPlayerAttemptingResign(PlayerColor.WHITE); setIsResignModalOpen(true); }}
                showResignButton={layoutSettings.showResignButton}
                isResignDisabled={!!promotionSquare || isResignModalOpen || isRenameModalOpen || gameStatus.isGameOver}
                gameMode={gameMode}
                isGameOver={gameStatus.isGameOver}
            />
            
            {gameMode === 'online' && onlineGameIdForStorage && isGameSetupComplete && (
                <div className={`mt-2 p-2 rounded-lg text-xs shadow-md ${theme === 'dark' ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50' : 'bg-gray-100/70 text-slate-600 border border-gray-300/50'}`}>
                    Online Game ID: <strong className={theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}>{onlineGameIdForStorage}</strong> (Same device simulation)
                </div>
            )}
        </main>
      )}

      {shouldShowPuzzleArea && currentPuzzle && (
        <main className="flex flex-col items-center space-y-3 sm:space-y-4 w-full mt-2">
            <PuzzleControls
                theme={theme}
                puzzle={currentPuzzle}
                onNextPuzzle={() => loadPuzzle(currentPuzzleIndex + 1 >= PUZZLES.length ? 0 : currentPuzzleIndex + 1)}
                onPrevPuzzle={() => loadPuzzle(currentPuzzleIndex - 1 < 0 ? PUZZLES.length - 1 : currentPuzzleIndex - 1)}
                onResetPuzzle={() => loadPuzzle(currentPuzzleIndex)}
                isFirstPuzzle={currentPuzzleIndex === 0}
                isLastPuzzle={currentPuzzleIndex === PUZZLES.length - 1}
            />
            <Board boardState={boardState} onSquareClick={handleSquareClick} selectedPiecePosition={selectedPiecePosition} possibleMoves={possibleMoves} currentPlayer={currentPlayer} kingInCheckPosition={kingInCheckPosition} theme={theme} layoutSettings={layoutSettings} lastMove={lastMove} hintSuggestion={null} />
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
      {promotionSquare && gameMode && isGameSetupComplete && !gameStatus.isGameOver && (
        <PromotionModal playerColor={boardState[promotionSquare[0]][promotionSquare[1]]?.color || currentPlayer} onPromote={handlePromotion} theme={theme} layoutSettings={layoutSettings} />
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
       <footer className={`mt-auto pt-6 sm:pt-8 text-center text-xs ${theme === 'dark' ? 'text-slate-400/70' : 'text-slate-500/80'} select-none`}>
        <p>Select a piece, then its destination. Good luck!</p>
        <p>{'©'} 2025 Joyonto Karmakar. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default App;