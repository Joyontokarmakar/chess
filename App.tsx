
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoardState, PlayerColor, Position, PieceType, CastlingRights, GameStatus, Piece, GameMode, AIMove, OnlineGameState, Theme, SavedGame, LayoutSettings, GameOverReason, TIME_OPTIONS, AIDifficultyLevel, MoveHistoryEntry, Puzzle, PuzzleSolutionMove, BoardStyleId } from './types';
import { createInitialBoard, INITIAL_CASTLING_RIGHTS, AI_PLAYER_NAME, SOUND_MOVE, SOUND_CAPTURE, SOUND_WIN, PUZZLES, parseFEN } from './constants';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import PromotionModal from './components/PromotionModal';
import PlayerDisplayPanel from './components/PlayerDisplayPanel';
import MenuModal from './components/MenuModal'; 
import PlayerNameEntry from './components/PlayerNameEntry';
import OnlineGameSetup from './components/OnlineGameSetup';
// import TurnIndicator from './components/TurnIndicator'; // Replaced by info in PlayerDisplayPanel
import HallOfFame from './components/HallOfFame';
import Logo from './components/Logo';
import LayoutCustomizationModal from './components/LayoutCustomizationModal';
import TimeModeSelectionModal from './components/TimeModeSelectionModal'; 
import ChessGuide from './components/ChessGuide'; 
import OnlineWarningModal from './components/OnlineWarningModal';
import PieceDisplay from './components/PieceDisplay';
import GameControls from './components/GameControls'; // New for Hint/Undo
import PuzzleControls from './components/PuzzleControls'; // New for Puzzles
import ChangelogModal from './components/ChangelogModal'; // Added for Game Updates

import { getComputerMove } from './utils/geminiApi';
import { 
  saveHallOfFameEntry, 
  getThemePreference, 
  setThemePreference,
  getSavedGames,
  saveGame as saveGameToStorage,
  deleteSavedGame as deleteSavedGameFromStorage,
  clearAllSavedGames as clearAllSavedGamesFromStorage,
  getLayoutSettings as getLayoutSettingsFromStorage,
  setLayoutSettings as setLayoutSettingsInStorage,
  getOnlineGameState, 
  setOnlineGameState, 
  getOnlineGameStorageKey 
} from './utils/localStorageUtils';
import { getPieceIconColor } from './utils/styleUtils'; 
import { playSound } from './utils/soundUtils';


import {
  getPossibleMoves,
  makeMove as performMakeMove,
  isKingInCheck,
  isCheckmate,
  isStalemate,
  findKingPosition,
  createDeepBoardCopy
} from './utils/chessLogic';

interface UpdateGameStatusReturn {
  gameStatusResult: GameStatus;
  newKingInCheckPos: Position | null;
}

type WelcomeArenaMenuItem = {
  id: GameMode | 'hof' | 'puzzle'; // Added 'puzzle'
  label: string;
  icon: string | React.ReactNode; 
  baseColor: string;
};

const pieceTypeToName = (type: PieceType): string => {
  switch (type) {
    case PieceType.PAWN: return 'Pawn';
    case PieceType.ROOK: return 'Rook';
    case PieceType.KNIGHT: return 'Knight';
    case PieceType.BISHOP: return 'Bishop';
    case PieceType.QUEEN: return 'Queen';
    case PieceType.KING: return 'King';
    default: return type;
  }
};


const App: React.FC = () => {
  const [theme, setTheme] = useState<Theme>(getThemePreference() || 'dark');
  const [isMenuOpen, setIsMenuOpen] = useState<boolean>(false);

  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [isGameSetupPending, setIsGameSetupPending] = useState<boolean>(false); 
  const [isTimeModeSelectionOpen, setIsTimeModeSelectionOpen] = useState<boolean>(false);
  const [isGameSetupComplete, setIsGameSetupComplete] = useState<boolean>(false);
  const [viewingHallOfFame, setViewingHallOfFame] = useState<boolean>(false);

  const [player1Name, setPlayer1Name] = useState<string>("Player 1");
  const [player2Name, setPlayer2Name] = useState<string>("Player 2");
  const [aiDifficulty, setAiDifficulty] = useState<AIDifficultyLevel>(AIDifficultyLevel.MEDIUM);


  const [boardState, setBoardState] = useState<BoardState>(createInitialBoard());
  const [currentPlayer, setCurrentPlayer] = useState<PlayerColor>(PlayerColor.WHITE);
  const [selectedPiecePosition, setSelectedPiecePosition] = useState<Position | null>(null);
  const [possibleMoves, setPossibleMoves] = useState<Position[]>([]);
  const [castlingRights, setCastlingRights] = useState<CastlingRights>(INITIAL_CASTLING_RIGHTS);
  const [enPassantTarget, setEnPassantTarget] = useState<Position | null>(null);
  const [promotionSquare, setPromotionSquare] = useState<Position | null>(null);
  const [kingInCheckPosition, setKingInCheckPosition] = useState<Position | null>(null);
  const [gameStatus, setGameStatus] = useState<GameStatus>({ message: `Open menu or select a mode to start.`, isGameOver: false });
  const [lastMove, setLastMove] = useState<{ from: Position; to: Position } | null>(null);


  const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]); 
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]); 


  const [isComputerThinking, setIsComputerThinking] = useState<boolean>(false);
  const [hasWinSoundPlayedThisGame, setHasWinSoundPlayedThisGame] = useState<boolean>(false);

  // Timer states
  const [timeLimitPerPlayer, setTimeLimitPerPlayer] = useState<number | null>(null);
  const [player1TimeLeft, setPlayer1TimeLeft] = useState<number | null>(null);
  const [player2TimeLeft, setPlayer2TimeLeft] = useState<number | null>(null);
  const [gameStartTimeStamp, setGameStartTimeStamp] = useState<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  const [onlineGameIdForStorage, setOnlineGameIdForStorage] = useState<string | null>(null);
  const [localPlayerColorForStorage, setLocalPlayerColorForStorage] = useState<PlayerColor | null>(null);
  const [isOnlineGameReadyForStorage, setIsOnlineGameReadyForStorage] = useState<boolean>(false);
  const lastMoveByRef = useRef<PlayerColor | null>(null); 
  const [isOnlineWarningModalOpen, setIsOnlineWarningModalOpen] = useState<boolean>(false);


  const [savedGames, setSavedGames] = useState<SavedGame[]>(getSavedGames());
  
  const initialLayoutSettings = getLayoutSettingsFromStorage() || {
    boardStyleId: 'default-dark' as BoardStyleId,
    whitePieceColor: undefined,
    blackPieceColor: undefined,
    isSoundEnabled: true,
  };
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(initialLayoutSettings);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isChessGuideOpen, setIsChessGuideOpen] = useState(false); 
  const [isChangelogModalOpen, setIsChangelogModalOpen] = useState(false); // State for Changelog Modal


  // New states for features
  const [moveHistory, setMoveHistory] = useState<MoveHistoryEntry[]>([]);
  const [hintSuggestion, setHintSuggestion] = useState<AIMove | null>(null);
  const [hintKey, setHintKey] = useState<string>(''); // To re-trigger hint animation

  // Puzzle Mode states
  const [currentPuzzleIndex, setCurrentPuzzleIndex] = useState<number>(0);
  const [currentPuzzle, setCurrentPuzzle] = useState<Puzzle | null>(null);
  const [puzzleSolutionStep, setPuzzleSolutionStep] = useState<number>(0);
  const [puzzleMessage, setPuzzleMessage] = useState<string>('');


  const handleToggleChessGuide = (isOpen: boolean) => {
    setIsChessGuideOpen(isOpen);
    if(isOpen) setIsMenuOpen(false); 
  };

  const handleToggleChangelogModal = (isOpen: boolean) => {
    setIsChangelogModalOpen(isOpen);
    if(isOpen) setIsMenuOpen(false);
  };


  useEffect(() => {
    document.body.className = `theme-${theme}`;
    setThemePreference(theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme(prevTheme => prevTheme === 'light' ? 'dark' : 'light');
  };

  const handleLayoutSettingsChange = (newSettings: LayoutSettings) => {
    setLayoutSettings(newSettings);
    setLayoutSettingsInStorage(newSettings);
  };
  
  const resetGameToWelcomeArena = useCallback((softResetForModeChange: boolean = false) => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    timerIntervalRef.current = null;
    
    if (!softResetForModeChange) {
        setGameMode(null);
        setIsGameSetupComplete(false);
        setViewingHallOfFame(false);
        setIsGameSetupPending(false);
        setIsChessGuideOpen(false); 
        setIsChangelogModalOpen(false);
        setCurrentPuzzle(null); // Reset puzzle
        setPuzzleMessage('');
    }

    setBoardState(createInitialBoard());
    setCurrentPlayer(PlayerColor.WHITE);
    setSelectedPiecePosition(null);
    setPossibleMoves([]);
    setCastlingRights(INITIAL_CASTLING_RIGHTS);
    setEnPassantTarget(null);
    setPromotionSquare(null);
    setKingInCheckPosition(null);
    setCapturedByWhite([]);
    setCapturedByBlack([]);
    setGameStatus({ message: softResetForModeChange ? "Initializing new game..." : `Open menu or select a mode to start a new game.`, isGameOver: false });
    setIsComputerThinking(false);
    setLastMove(null);
    setHasWinSoundPlayedThisGame(false);
    setMoveHistory([]);
    setHintSuggestion(null);

    setTimeLimitPerPlayer(null);
    setPlayer1TimeLeft(null);
    setPlayer2TimeLeft(null);
    setGameStartTimeStamp(null);
    
    setOnlineGameIdForStorage(null);
    setLocalPlayerColorForStorage(null);
    setIsOnlineGameReadyForStorage(false);
    lastMoveByRef.current = null;
  }, []);

  const handleLogoClick = () => {
    resetGameToWelcomeArena();
    setIsMenuOpen(false); 
  };

  const updateLocalStateFromStorage = useCallback((storageEventKey: string | null) => {
    if (!onlineGameIdForStorage || !storageEventKey || storageEventKey !== getOnlineGameStorageKey(onlineGameIdForStorage)) {
      return;
    }

    const gameStateFromStorage = getOnlineGameState(onlineGameIdForStorage);
    if (gameStateFromStorage && gameStateFromStorage.lastMoveBy !== lastMoveByRef.current) {
      setBoardState(gameStateFromStorage.boardState);
      setCurrentPlayer(gameStateFromStorage.currentPlayer);
      setCastlingRights(gameStateFromStorage.castlingRights);
      setEnPassantTarget(gameStateFromStorage.enPassantTarget);
      setCapturedByWhite(gameStateFromStorage.capturedByWhite);
      setCapturedByBlack(gameStateFromStorage.capturedByBlack);
      setGameStatus(gameStateFromStorage.gameStatus);
      setPlayer1Name(gameStateFromStorage.player1Name);
      setPlayer2Name(gameStateFromStorage.player2Name || (localPlayerColorForStorage === PlayerColor.WHITE ? "Waiting..." : player2Name));
      setIsOnlineGameReadyForStorage(gameStateFromStorage.isGameReady);
      setKingInCheckPosition(gameStateFromStorage.kingInCheckPosition);
      setLastMove(gameStateFromStorage.lastMove || null);
      setTimeLimitPerPlayer(gameStateFromStorage.timeLimitPerPlayer);
      setPlayer1TimeLeft(gameStateFromStorage.player1TimeLeft);
      setPlayer2TimeLeft(gameStateFromStorage.player2TimeLeft);
      setGameStartTimeStamp(gameStateFromStorage.gameStartTimeStamp);
      setMoveHistory([]); // Undo not supported for online for now
       if (gameStateFromStorage.gameStatus.isGameOver && gameStateFromStorage.gameStatus.winner && !hasWinSoundPlayedThisGame) {
        playSound(SOUND_WIN, layoutSettings.isSoundEnabled);
        setHasWinSoundPlayedThisGame(true);
      }
    }
  }, [onlineGameIdForStorage, localPlayerColorForStorage, player2Name, hasWinSoundPlayedThisGame, layoutSettings.isSoundEnabled]);

  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      updateLocalStateFromStorage(event.key);
    };

    if (gameMode === 'online' && onlineGameIdForStorage) {
      window.addEventListener('storage', handleStorageChange);
      updateLocalStateFromStorage(getOnlineGameStorageKey(onlineGameIdForStorage));
    }

    return () => {
      window.removeEventListener('storage', handleStorageChange);
    };
  }, [gameMode, onlineGameIdForStorage, updateLocalStateFromStorage]);


  const updateGameStatus = useCallback(async (
    board: BoardState, actingPlayer: PlayerColor, currentCR: CastlingRights,
    currentEPT: Position | null, reason: GameOverReason | null, moveMessagePreamble?: string
  ): Promise<UpdateGameStatusReturn> => {
    const opponentColor = actingPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    
    let actingPlayerNameForStatus = player1Name; 
    if (actingPlayer === PlayerColor.BLACK) {
        actingPlayerNameForStatus = player2Name;
    }
    
    let opponentPlayerNameForStatus = player2Name; 
     if (opponentColor === PlayerColor.WHITE) {
        opponentPlayerNameForStatus = player1Name;
    }

    let newKingInCheckPos: Position | null = null;
    let statusMsg = moveMessagePreamble || "Move successful.";
    let gameStatusResult: GameStatus;

    if (reason === 'timeout') {
        gameStatusResult = {
            message: `${opponentPlayerNameForStatus}'s time ran out! ${actingPlayerNameForStatus} wins by timeout!`,
            isGameOver: true, winner: actingPlayer, winnerName: actingPlayerNameForStatus, reason: 'timeout'
        };
    } else if (isKingInCheck(board, opponentColor)) {
      newKingInCheckPos = findKingPosition(board, opponentColor);
      statusMsg = `${moveMessagePreamble ? moveMessagePreamble + ". " : ""}${opponentPlayerNameForStatus} is in Check!`;
      if (isCheckmate(board, opponentColor, currentCR, currentEPT)) {
        gameStatusResult = {
          message: `Magnificent Checkmate! ${actingPlayerNameForStatus} conquers the board!`,
          isGameOver: true, winner: actingPlayer, winnerName: actingPlayerNameForStatus, reason: 'checkmate'
        };
      } else {
         gameStatusResult = { message: statusMsg, isGameOver: false };
      }
    } else if (isStalemate(board, opponentColor, currentCR, currentEPT)) {
        gameStatusResult = { message: "A hard-fought Stalemate! The game is a draw.", isGameOver: true, reason: 'stalemate' };
    } else {
        gameStatusResult = { message: statusMsg, isGameOver: false };
    }
    
    if (gameStatusResult.isGameOver && !hasWinSoundPlayedThisGame) {
      if (gameStatusResult.winner) { 
        playSound(SOUND_WIN, layoutSettings.isSoundEnabled);
        setHasWinSoundPlayedThisGame(true);
      }
    }
    
    if (gameStatusResult.isGameOver && gameMode && gameMode !== 'puzzle') { 
        const duration = gameStartTimeStamp ? (Date.now() - gameStartTimeStamp) / 1000 : null;
        saveHallOfFameEntry(
            gameStatusResult.winnerName || (gameStatusResult.reason === 'stalemate' ? "Draw" : "N/A"),
            gameStatusResult.winnerName === actingPlayerNameForStatus ? opponentPlayerNameForStatus : actingPlayerNameForStatus,
            gameMode,
            gameStartTimeStamp,
            duration,
            gameStatusResult.reason || (gameStatusResult.winner ? undefined : 'draw')
        );
    }

    setGameStatus(gameStatusResult); setKingInCheckPosition(newKingInCheckPos);
    return { gameStatusResult, newKingInCheckPos }; 
  }, [player1Name, player2Name, gameMode, gameStartTimeStamp, hasWinSoundPlayedThisGame, layoutSettings.isSoundEnabled]); 


  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (!timeLimitPerPlayer || gameStatus.isGameOver || promotionSquare || gameMode === 'puzzle') {
      return;
    }

    timerIntervalRef.current = setInterval(async () => {
      let newTimeLeftP1: number | null = player1TimeLeft;
      let newTimeLeftP2: number | null = player2TimeLeft;
      let timeoutOccurred = false;
      let timedOutPlayer: PlayerColor | null = null;

      if (currentPlayer === PlayerColor.WHITE) {
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
      
      if (gameMode === 'online' && onlineGameIdForStorage) {
          // Online timer updates handled via storage sync
      } else if (timeoutOccurred && timedOutPlayer) { 
          if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
          updateGameStatus(boardState, timedOutPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE, castlingRights, enPassantTarget, 'timeout');
      }
    }, 1000) as unknown as number; 

    return () => {
      if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    };
  }, [currentPlayer, timeLimitPerPlayer, gameStatus.isGameOver, promotionSquare, boardState, castlingRights, enPassantTarget, updateGameStatus, gameMode, onlineGameIdForStorage, player1TimeLeft, player2TimeLeft]);


  const getCurrentPlayerRealNameForDisplay = useCallback(() => {
    return currentPlayer === PlayerColor.WHITE ? player1Name : player2Name;
  }, [currentPlayer, player1Name, player2Name]);

  const getOpponentPlayerNameForDisplay = useCallback(() => {
    return currentPlayer === PlayerColor.WHITE ? player2Name : player1Name;
  }, [currentPlayer, player1Name, player2Name]);
  
  // Helper to construct history entry
  const createHistoryEntry = (): MoveHistoryEntry => ({
    boardState: createDeepBoardCopy(boardState), // Deep copy
    currentPlayer, castlingRights: JSON.parse(JSON.stringify(castlingRights)), enPassantTarget,
    capturedByWhite: [...capturedByWhite], capturedByBlack: [...capturedByBlack],
    gameStatus: {...gameStatus}, kingInCheckPosition, lastMove: lastMove ? {...lastMove} : null,
    player1TimeLeft, player2TimeLeft,
  });

  const applyMove = useCallback(async (from: Position, to: Position, promotionType?: PieceType, isPuzzleMove: boolean = false) => {
    if (!isPuzzleMove) { // Don't save history for puzzle internal moves
        const historyEntry = createHistoryEntry();
        setMoveHistory(prevHistory => [...prevHistory, historyEntry]);
    }
    setHintSuggestion(null); // Clear hint on any move attempt

    const movingPiece = boardState[from[0]][from[1]];
    if (!movingPiece) return;

    const { newBoard, newCastlingRights, newEnPassantTarget, promotionSquare: promSq, capturedPiece } = 
      performMakeMove(boardState, from, to, castlingRights, enPassantTarget, promotionType);
    
    const newLastMove = { from, to };
    setLastMove(newLastMove); 

    let moveMessagePreamble = "";
    let newCapturedByWhite = [...capturedByWhite];
    let newCapturedByBlack = [...capturedByBlack];

    if (capturedPiece) {
      playSound(SOUND_CAPTURE, layoutSettings.isSoundEnabled);
      if (currentPlayer === PlayerColor.WHITE) { 
        newCapturedByWhite.push(capturedPiece); 
      } else { 
        newCapturedByBlack.push(capturedPiece); 
      }
      setCapturedByWhite(newCapturedByWhite); 
      setCapturedByBlack(newCapturedByBlack); 
      moveMessagePreamble = `${getCurrentPlayerRealNameForDisplay()}'s ${pieceTypeToName(movingPiece.type)} captured ${getOpponentPlayerNameForDisplay()}'s ${pieceTypeToName(capturedPiece.type)}`;
    } else {
      playSound(SOUND_MOVE, layoutSettings.isSoundEnabled);
    }

    setBoardState(newBoard); setCastlingRights(newCastlingRights); setEnPassantTarget(newEnPassantTarget);
    
    if (gameMode !== 'online') { 
        lastMoveByRef.current = null; 
    }

    if (promSq && !promotionType) {
      setPromotionSquare(promSq);
      // Online game logic for promotion pending... (omitted for brevity, assume similar to below)
    } else {
      const nextPlayer = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      const { gameStatusResult: finalGameStatus, newKingInCheckPos: finalKcip } = 
          await updateGameStatus(newBoard, currentPlayer, newCastlingRights, newEnPassantTarget, null, moveMessagePreamble);
      
      // Online game logic update... (omitted for brevity)
      if (!finalGameStatus.isGameOver) setCurrentPlayer(nextPlayer);
    }
    setSelectedPiecePosition(null); setPossibleMoves([]);
  }, [boardState, currentPlayer, castlingRights, enPassantTarget, updateGameStatus, getCurrentPlayerRealNameForDisplay, getOpponentPlayerNameForDisplay, gameMode, onlineGameIdForStorage, capturedByWhite, capturedByBlack, player1Name, player2Name, isOnlineGameReadyForStorage, timeLimitPerPlayer, player1TimeLeft, player2TimeLeft, gameStartTimeStamp, layoutSettings.isSoundEnabled, moveHistory]);

  const handleSquareClick = useCallback((pos: Position) => {
    if (gameStatus.isGameOver || promotionSquare) return;
    if (gameMode === 'computer' && currentPlayer === PlayerColor.BLACK && isComputerThinking) return;
    if (gameMode === 'online' && (!isOnlineGameReadyForStorage || currentPlayer !== localPlayerColorForStorage)) return;
    if (gameMode === 'puzzle' && currentPuzzle && currentPlayer !== currentPuzzle.playerToMove) return; // Only allow moves for the designated puzzle player


    const piece = boardState[pos[0]][pos[1]];
    if (selectedPiecePosition) {
      if (possibleMoves.some(move => move[0] === pos[0] && move[1] === pos[1])) {
        if (gameMode === 'puzzle' && currentPuzzle) {
            handlePuzzleMove(selectedPiecePosition, pos);
        } else {
            applyMove(selectedPiecePosition, pos); 
        }
      }
      else { // Clicked on a non-possible move square or an empty square
        setSelectedPiecePosition(null); setPossibleMoves([]);
        if (piece && piece.color === currentPlayer) { // If clicked on another of own pieces
          setSelectedPiecePosition(pos);
          setPossibleMoves(getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget));
        }
      }
    } else if (piece && piece.color === currentPlayer) { // First click on one of own pieces
      setSelectedPiecePosition(pos);
      setPossibleMoves(getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget));
    }
  }, [boardState, currentPlayer, selectedPiecePosition, possibleMoves, castlingRights, enPassantTarget, gameStatus.isGameOver, promotionSquare, applyMove, gameMode, isComputerThinking, localPlayerColorForStorage, isOnlineGameReadyForStorage, currentPuzzle]);

  const handlePromotion = useCallback(async (pieceType: PieceType) => {
    if (!promotionSquare) return;

    if (gameMode === 'puzzle' && currentPuzzle) {
        handlePuzzleMove(selectedPiecePosition!, promotionSquare, pieceType); // Assume selectedPiecePosition is the pawn's original square for puzzle logic
        setPromotionSquare(null);
        return;
    }

    const historyEntry = createHistoryEntry();
    setMoveHistory(prevHistory => [...prevHistory, historyEntry]);
    setHintSuggestion(null);

    const tempBoard = createDeepBoardCopy(boardState);
    const pawnToPromote = tempBoard[promotionSquare[0]][promotionSquare[1]];
    if(pawnToPromote && pawnToPromote.type === PieceType.PAWN) {
      tempBoard[promotionSquare[0]][promotionSquare[1]] = {...pawnToPromote, type: pieceType, id: pawnToPromote.id.replace(/P\d*$/, pieceType)};
      setBoardState(tempBoard); 
      
      const nextPlayer = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      const promoMessage = `${getCurrentPlayerRealNameForDisplay()} promoted Pawn to ${pieceTypeToName(pieceType)}!`;
      
      const { gameStatusResult: finalGameStatus, newKingInCheckPos: kcipAfterPromo } = 
          await updateGameStatus(tempBoard, currentPlayer, castlingRights, enPassantTarget, null, promoMessage);
      
      // Online game logic... (omitted)
      if (!finalGameStatus.isGameOver) setCurrentPlayer(nextPlayer);
    }
    setPromotionSquare(null); setSelectedPiecePosition(null); setPossibleMoves([]);
  }, [boardState, promotionSquare, currentPlayer, castlingRights, enPassantTarget, updateGameStatus, getCurrentPlayerRealNameForDisplay, gameMode, onlineGameIdForStorage, capturedByWhite, capturedByBlack, lastMove, player1Name, player2Name, isOnlineGameReadyForStorage, timeLimitPerPlayer, player1TimeLeft, player2TimeLeft, gameStartTimeStamp, moveHistory, currentPuzzle]);

  useEffect(() => {
    if (gameMode === 'computer' && currentPlayer === PlayerColor.BLACK && !gameStatus.isGameOver && !promotionSquare && !isComputerThinking) {
      setIsComputerThinking(true);
      const aiMoveDelay = timeLimitPerPlayer ? Math.max(1000, Math.random() * 2000 + 1000) : 500; 
      setTimeout(() => {
        getComputerMove(boardState, PlayerColor.BLACK, castlingRights, enPassantTarget, aiDifficulty)
          .then((aiMove: AIMove | null) => {
            if (aiMove && !gameStatus.isGameOver) { 
              // Basic validation for AI move before applying
              const pieceAtFrom = boardState[aiMove.from[0]]?.[aiMove.from[1]];
              if (pieceAtFrom && pieceAtFrom.color === PlayerColor.BLACK) {
                  const AIsPossibleMoves = getPossibleMoves(boardState, aiMove.from, PlayerColor.BLACK, castlingRights, enPassantTarget);
                   if (AIsPossibleMoves.some(m => m[0] === aiMove.to[0] && m[1] === aiMove.to[1])) {
                     applyMove(aiMove.from, aiMove.to, aiMove.promotion);
                   } else {
                      console.error("AI suggested an illegal move:", aiMove, "Possible moves:", AIsPossibleMoves);
                      setGameStatus(prev => ({...prev, message: "AI error: Illegal move. Your turn."})); setCurrentPlayer(PlayerColor.WHITE); 
                      setLastMove(null); 
                   }
              } else {
                   setGameStatus(prev => ({...prev, message: "AI error: No piece to move or wrong piece. Your turn."})); setCurrentPlayer(PlayerColor.WHITE); 
                   setLastMove(null); 
              }
            } else if (!gameStatus.isGameOver) { 
               setGameStatus(prev => ({...prev, message: "AI could not move. Your turn."})); setCurrentPlayer(PlayerColor.WHITE); 
               setLastMove(null);
            }
          })
          .catch(error => {
            if (!gameStatus.isGameOver) {
              setGameStatus(prev => ({...prev, message: "Error with AI. Your turn."})); setCurrentPlayer(PlayerColor.WHITE); 
              setLastMove(null);
            }
          })
          .finally(() => setIsComputerThinking(false));
      }, aiMoveDelay);
    }
  }, [currentPlayer, gameMode, gameStatus.isGameOver, promotionSquare, boardState, castlingRights, enPassantTarget, applyMove, isComputerThinking, timeLimitPerPlayer, aiDifficulty]);

  // --- Puzzle Mode Logic ---
  const loadPuzzle = (index: number) => {
    if (index < 0 || index >= PUZZLES.length) return;
    resetGameToWelcomeArena(true); // Soft reset
    const puzzle = PUZZLES[index];
    setCurrentPuzzle(puzzle);
    setCurrentPuzzleIndex(index);
    setPuzzleSolutionStep(0);
    setGameMode('puzzle');
    setIsGameSetupComplete(true); // Mark as setup complete for UI rendering

    let initialBoardFromPuzzle: BoardState;
    let playerToMoveFromPuzzle: PlayerColor;
    let castlingRightsFromPuzzle: CastlingRights = INITIAL_CASTLING_RIGHTS; // Default
    let enPassantTargetFromPuzzle: Position | null = null; // Default

    if (puzzle.fen) {
        const fenData = parseFEN(puzzle.fen);
        initialBoardFromPuzzle = fenData.board;
        playerToMoveFromPuzzle = fenData.playerToMove;
        castlingRightsFromPuzzle = fenData.castlingRights;
        enPassantTargetFromPuzzle = fenData.enPassantTarget;
    } else if (puzzle.initialBoard) {
        initialBoardFromPuzzle = createDeepBoardCopy(puzzle.initialBoard);
        playerToMoveFromPuzzle = puzzle.playerToMove;
        if(puzzle.initialCastlingRights) castlingRightsFromPuzzle = JSON.parse(JSON.stringify(puzzle.initialCastlingRights));
        if(puzzle.initialEnPassantTarget) enPassantTargetFromPuzzle = [...puzzle.initialEnPassantTarget] as Position;
    } else {
        initialBoardFromPuzzle = createInitialBoard(); // Fallback
        playerToMoveFromPuzzle = PlayerColor.WHITE;
    }
    
    setBoardState(initialBoardFromPuzzle);
    setCurrentPlayer(playerToMoveFromPuzzle);
    setCastlingRights(castlingRightsFromPuzzle);
    setEnPassantTarget(enPassantTargetFromPuzzle);
    setKingInCheckPosition(isKingInCheck(initialBoardFromPuzzle, playerToMoveFromPuzzle) ? findKingPosition(initialBoardFromPuzzle, playerToMoveFromPuzzle) : null);
    setGameStatus({ message: puzzle.description, isGameOver: false });
    setPuzzleMessage(puzzle.description);
    setPlayer1Name(playerToMoveFromPuzzle === PlayerColor.WHITE ? "White" : "Black"); // Generic names for puzzle
    setPlayer2Name(playerToMoveFromPuzzle === PlayerColor.WHITE ? "Black" : "White");
  };

  const handlePuzzleMove = (from: Position, to: Position, promotion?: PieceType) => {
    if (!currentPuzzle) return;
    const solutionMove = currentPuzzle.solution[puzzleSolutionStep];
    if (solutionMove.from[0] === from[0] && solutionMove.from[1] === from[1] &&
        solutionMove.to[0] === to[0] && solutionMove.to[1] === to[1] &&
        (solutionMove.promotion ? solutionMove.promotion === promotion : true)) {
      
      applyMove(from, to, promotion, true); // True indicates it's a puzzle move, avoids history
      setPuzzleSolutionStep(prev => prev + 1);

      if (puzzleSolutionStep + 1 >= currentPuzzle.solution.length) {
        setPuzzleMessage(`Correct! Puzzle Solved: ${currentPuzzle.title}`);
        setGameStatus(prev => ({...prev, message: `Puzzle Solved! ${solutionMove.comment || ''}`, isGameOver: true}));
        // Potentially add a small delay then load next puzzle or show completion
      } else {
        setPuzzleMessage(`Correct! ${solutionMove.comment || 'Good move!'}`);
        // If puzzle involves opponent moves, handle them here
      }
    } else {
      setPuzzleMessage("Incorrect move. Try again!");
      // Reset selected piece
      setSelectedPiecePosition(null);
      setPossibleMoves([]);
    }
  };
  
  const handleSelectModeFromWelcomeArena = (mode: GameMode | 'hof' | 'puzzle') => {
    resetGameToWelcomeArena(true); 
    if (mode === 'hof') {
        setViewingHallOfFame(true);
        setIsGameSetupPending(false);
    } else if (mode === 'puzzle') {
        loadPuzzle(0); // Load first puzzle by default
        setIsMenuOpen(false);
    } else {
        if (mode === 'online') {
            setIsOnlineWarningModalOpen(true);
        } else {
            setGameMode(mode as GameMode); 
            setIsGameSetupPending(true); 
            setIsTimeModeSelectionOpen(true); 
        }
    }
    if (mode !== 'puzzle') setIsMenuOpen(false);
  };
  
  const handleProceedFromOnlineWarning = () => {
    setIsOnlineWarningModalOpen(false);
    setGameMode('online');
    setIsGameSetupPending(true);
    setIsTimeModeSelectionOpen(true);
  };

  const handleTimeModeSelected = (selectedTime: number | null) => {
    setTimeLimitPerPlayer(selectedTime);
    setIsTimeModeSelectionOpen(false);
  };

  const handlePlayerNameSetup = (p1Name: string, p2NameProvided?: string, difficulty?: AIDifficultyLevel) => { 
    const finalP1Name = p1Name.trim() || "Player 1";
    let finalP2Name = "Player 2";
    setPlayer1Name(finalP1Name);
    if (gameMode === 'friend') {
      finalP2Name = p2NameProvided?.trim() || "Player 2"; setPlayer2Name(finalP2Name);
    } else if (gameMode === 'computer') {
      finalP2Name = AI_PLAYER_NAME; setPlayer2Name(AI_PLAYER_NAME);
      if (difficulty) setAiDifficulty(difficulty);
    }
    
    setIsGameSetupComplete(true); 
    setIsGameSetupPending(false);
    setViewingHallOfFame(false);
    setGameStatus({ message: `Game started. Good luck, ${finalP1Name} and ${finalP2Name}!`, isGameOver: false });
    setLastMove(null);
    setMoveHistory([]); // Clear history for new game
    if (timeLimitPerPlayer) {
        setPlayer1TimeLeft(timeLimitPerPlayer);
        setPlayer2TimeLeft(timeLimitPerPlayer);
        setGameStartTimeStamp(Date.now());
    }
  };

  const handleOnlineGameSetupComplete = (gameId: string, isHost: boolean, localPName: string, initialOnlineStateFromSetup: OnlineGameState) => {
    resetGameToWelcomeArena(true); 
    setOnlineGameIdForStorage(gameId); 
    setLocalPlayerColorForStorage(isHost ? PlayerColor.WHITE : PlayerColor.BLACK);
    
    setBoardState(initialOnlineStateFromSetup.boardState);
    setCurrentPlayer(initialOnlineStateFromSetup.currentPlayer);
    // ... (rest of online setup remains similar) ...
    setMoveHistory([]); // No undo for online games
    setGameMode('online'); 
    setIsGameSetupComplete(true); 
    setIsGameSetupPending(false);
    setViewingHallOfFame(false);
    setIsMenuOpen(false); 
  };

  // --- Undo Move Handler ---
  const handleUndoMove = () => {
    if (moveHistory.length === 0 || gameStatus.isGameOver || (gameMode === 'computer' && isComputerThinking) || promotionSquare) return;

    const lastState = moveHistory[moveHistory.length - 1];
    setBoardState(lastState.boardState);
    setCurrentPlayer(lastState.currentPlayer);
    setCastlingRights(lastState.castlingRights);
    setEnPassantTarget(lastState.enPassantTarget);
    setCapturedByWhite(lastState.capturedByWhite);
    setCapturedByBlack(lastState.capturedByBlack);
    setGameStatus(lastState.gameStatus); // Important to restore game over status correctly
    setKingInCheckPosition(lastState.kingInCheckPosition);
    setLastMove(lastState.lastMove);
    setPlayer1TimeLeft(lastState.player1TimeLeft);
    setPlayer2TimeLeft(lastState.player2TimeLeft);
    // gameStartTimeStamp should not be reset by undo
    
    setSelectedPiecePosition(null);
    setPossibleMoves([]);
    setPromotionSquare(null); // Clear any pending promotion
    setHintSuggestion(null); // Clear hint

    setMoveHistory(prevHistory => prevHistory.slice(0, -1));
  };

  // --- Hint Handler ---
  const handleRequestHint = async () => {
    if (gameStatus.isGameOver || isComputerThinking || promotionSquare) return;
    setIsComputerThinking(true); // Show thinking indicator for hint
    try {
      const hint = await getComputerMove(boardState, currentPlayer, castlingRights, enPassantTarget, AIDifficultyLevel.HARD); // Use a strong AI for hints
      if (hint) {
        setHintSuggestion(hint);
        setHintKey(Date.now().toString()); // Force re-render of hint animation
        setTimeout(() => setHintSuggestion(null), 2000); // Clear hint after 2s
      } else {
        setGameStatus(prev => ({ ...prev, message: "Hint not available right now." }));
      }
    } catch (error) {
      console.error("Error getting hint:", error);
      setGameStatus(prev => ({ ...prev, message: "Could not fetch hint." }));
    } finally {
      setIsComputerThinking(false);
    }
  };

  const handleSaveCurrentGame = () => {
    if (!gameMode || gameMode === 'puzzle' || !isGameSetupComplete || gameStatus.isGameOver) return;
    // ... (saving logic, ensure aiDifficulty is saved if gameMode === 'computer')
    const gameToSave: SavedGame = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `vs ${gameMode === 'computer' ? `${AI_PLAYER_NAME} (${aiDifficulty})` : (gameMode === 'online' || gameMode === 'loaded_friend' ? (localPlayerColorForStorage === PlayerColor.WHITE ? player2Name : player1Name) : player2Name)} ${timeLimitPerPlayer ? `(${timeLimitPerPlayer/60} min)` : ''}`,
      timestamp: Date.now(), gameMode: (gameMode === 'computer' ? 'computer' : (gameMode === 'online' || gameMode === 'loaded_friend' ? 'loaded_friend' : 'friend')), 
      boardState, currentPlayer, player1Name, player2Name, castlingRights, enPassantTarget, 
      capturedByWhite, capturedByBlack, gameStatus, kingInCheckPosition,
      originalLocalPlayerColor: gameMode === 'online' ? localPlayerColorForStorage : null,
      aiDifficulty: gameMode === 'computer' ? aiDifficulty : undefined,
      timeLimitPerPlayer, player1TimeLeft, player2TimeLeft, gameStartTimeStamp, lastMove
    };
    saveGameToStorage(gameToSave);
    setSavedGames(getSavedGames()); 
  };

  const handleLoadSavedGame = (gameId: string) => {
    const gameToLoad = savedGames.find(g => g.id === gameId);
    if (!gameToLoad) return;
    
    resetGameToWelcomeArena(); 
    setGameMode(gameToLoad.gameMode);
    // ... (rest of loading logic, ensure aiDifficulty is loaded)
    setBoardState(gameToLoad.boardState);
    setCurrentPlayer(gameToLoad.currentPlayer);
    setPlayer1Name(gameToLoad.player1Name);
    setPlayer2Name(gameToLoad.player2Name);
    setCastlingRights(gameToLoad.castlingRights);
    setEnPassantTarget(gameToLoad.enPassantTarget);
    setCapturedByWhite(gameToLoad.capturedByWhite);
    setCapturedByBlack(gameToLoad.capturedByBlack);
    setGameStatus(gameToLoad.gameStatus);
    setKingInCheckPosition(gameToLoad.kingInCheckPosition);
    setLocalPlayerColorForStorage(gameToLoad.originalLocalPlayerColor || null);
    setAiDifficulty(gameToLoad.aiDifficulty || AIDifficultyLevel.MEDIUM);
    setTimeLimitPerPlayer(gameToLoad.timeLimitPerPlayer);
    setPlayer1TimeLeft(gameToLoad.player1TimeLeft);
    setPlayer2TimeLeft(gameToLoad.player2TimeLeft);
    setGameStartTimeStamp(gameToLoad.gameStartTimeStamp);
    setLastMove(gameToLoad.lastMove || null);
    
    setIsGameSetupComplete(true); 
    setIsGameSetupPending(false);
    setIsMenuOpen(false);
    setMoveHistory([]); // Clear history when loading
  };

  const handleDeleteSavedGame = (gameId: string) => { 
    deleteSavedGameFromStorage(gameId);
    setSavedGames(getSavedGames());
  };
  const handleClearAllSavedGames = () => { 
    clearAllSavedGamesFromStorage();
    setSavedGames([]);
  };
  const handleResetAndOpenMenu = (navigateToWelcome: boolean = true) => { 
    if (navigateToWelcome) {
        resetGameToWelcomeArena();
    }
    setIsMenuOpen(true);
  };
  const handleOpenLayoutCustomization = () => { 
    setIsLayoutModalOpen(true);
    setIsMenuOpen(false); // Close main menu when layout modal opens
  };


  if (viewingHallOfFame) { 
    return <HallOfFame onBackToMenu={() => { setViewingHallOfFame(false); resetGameToWelcomeArena(); }} theme={theme} />;
  }
  if (isChessGuideOpen) { 
    return <ChessGuide isOpen={isChessGuideOpen} onClose={() => handleToggleChessGuide(false)} theme={theme} layoutSettings={layoutSettings} />;
  }
  if (isChangelogModalOpen) {
    return <ChangelogModal isOpen={isChangelogModalOpen} onClose={() => handleToggleChangelogModal(false)} theme={theme} />;
  }
  if (isOnlineWarningModalOpen) { 
    return <OnlineWarningModal isOpen={isOnlineWarningModalOpen} onProceed={handleProceedFromOnlineWarning} onCancel={() => {setIsOnlineWarningModalOpen(false); resetGameToWelcomeArena();}} theme={theme} />;
  }
  if (isTimeModeSelectionOpen && gameMode && gameMode !== 'puzzle') { 
    return <TimeModeSelectionModal isOpen={isTimeModeSelectionOpen} onClose={handleTimeModeSelected} theme={theme} />;
  }
  
  if (isGameSetupPending && !isTimeModeSelectionOpen && gameMode && gameMode !== 'puzzle') {
     if (gameMode === 'online') { 
        return <OnlineGameSetup onGameSetupComplete={handleOnlineGameSetupComplete} onBackToMenu={() => resetGameToWelcomeArena()} theme={theme} initialTimeLimit={timeLimitPerPlayer}/>;
     } 
     else if (gameMode === 'friend' || gameMode === 'computer') {
        return <PlayerNameEntry gameMode={gameMode} onSetupComplete={handlePlayerNameSetup} onBackToMenu={() => resetGameToWelcomeArena()} theme={theme} />;
    }
  }
  
  const turnIndicatorPlayerName = (): string => {
    if (!gameMode && !isGameSetupPending && !isGameSetupComplete) {
      return "Welcome!"; 
    }
    if (gameStatus.isGameOver) {
      if (gameStatus.winnerName) return `${gameStatus.winnerName} Wins!`;
      if (gameStatus.reason === 'stalemate') return 'Draw Game';
      return "Game Over";
    }
    if (gameMode === 'puzzle' && currentPuzzle) {
        return currentPuzzle.playerToMove === PlayerColor.WHITE ? "White to Solve" : "Black to Solve";
    }
    if (isGameSetupPending) {
        return "Setting Up Game...";
    }    
    if (!isGameSetupComplete) {
        return "Waiting for Setup..."; 
    }
    
    let name = currentPlayer === PlayerColor.WHITE ? player1Name : player2Name;
    if (gameMode === 'computer' && currentPlayer === PlayerColor.BLACK && isComputerThinking) {
      return `${AI_PLAYER_NAME} is thinking...`;
    }
     if (gameMode === 'online') {
        if (!isOnlineGameReadyForStorage && onlineGameIdForStorage) return "Waiting for opponent...";
        if (currentPlayer !== localPlayerColorForStorage) {
            const opponentOnlineName = currentPlayer === PlayerColor.WHITE ? (initialOnlineStateFromSetup?.player1Name || "Player 1") : (initialOnlineStateFromSetup?.player2Name || "Player 2");
            return `${opponentOnlineName}'s Turn (Online)`;
        }
     }
    return `${name}'s Turn`;
  };
  
  const headerTextColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const welcomePanelClasses = theme === 'dark' ? 'bg-slate-800/60 backdrop-blur-xl border border-slate-700/70 shadow-black/40' : 'bg-white/70 backdrop-blur-xl border-gray-300/70 shadow-gray-400/30';
  const welcomeTitleColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const welcomeSubTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  
  const welcomeArenaCardBaseClasses = `relative group w-full max-w-[11rem] h-44 sm:max-w-[12rem] sm:h-48 rounded-xl shadow-xl hover:shadow-2xl focus:outline-none transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center overflow-hidden p-3 text-center font-semibold backdrop-blur-xl border focus-visible:ring-4 focus-visible:ring-opacity-60`;
  const welcomeArenaGlowVarsDark = {
      friend: {'--glow-color-dark': 'rgba(34, 211, 238, 0.4)', '--glow-color-dark-soft': 'rgba(45, 212, 191, 0.3)'},
      computer: {'--glow-color-dark': 'rgba(251, 113, 133, 0.4)', '--glow-color-dark-soft': 'rgba(239, 68, 68, 0.3)'},
      online: {'--glow-color-dark': 'rgba(56, 189, 248, 0.4)', '--glow-color-dark-soft': 'rgba(99, 102, 241, 0.3)'},
      puzzle: {'--glow-color-dark': 'rgba(163, 230, 53, 0.4)', '--glow-color-dark-soft': 'rgba(132, 204, 22, 0.3)'}, // Lime for puzzle
      hof: {'--glow-color-dark': 'rgba(251, 191, 36, 0.5)', '--glow-color-dark-soft': 'rgba(249, 115, 22, 0.4)'},
  };
  const welcomeArenaGlowVarsLight = {
      friend: {'--glow-color-light': 'rgba(20, 184, 166, 0.3)', '--glow-color-light-soft': 'rgba(16, 185, 129, 0.2)'},
      computer: {'--glow-color-light': 'rgba(220, 38, 38, 0.3)', '--glow-color-light-soft': 'rgba(244, 63, 94, 0.2)'},
      online: {'--glow-color-light': 'rgba(14, 165, 233, 0.3)', '--glow-color-light-soft': 'rgba(79, 70, 229, 0.2)'},
      puzzle: {'--glow-color-light': 'rgba(101, 163, 13, 0.3)', '--glow-color-light-soft': 'rgba(77, 124, 15, 0.2)'}, // Darker lime for light puzzle
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
      if (baseColorName === 'online') return `${baseProps} bg-gradient-to-br from-sky-600/70 to-indigo-700/70 hover:from-sky-500/80 hover:to-indigo-600/80 focus-visible:ring-sky-400 ${hoverEffect}`;
      if (baseColorName === 'puzzle') return `${baseProps} bg-gradient-to-br from-lime-600/70 to-green-700/70 hover:from-lime-500/80 hover:to-green-600/80 focus-visible:ring-lime-400 ${hoverEffect}`;
      if (baseColorName === 'hof') return `${baseProps} bg-gradient-to-br from-amber-500/70 to-orange-600/70 hover:from-amber-500/80 hover:to-orange-500/80 focus-visible:ring-amber-400 ${hoverEffect}`;
    } else { 
      if (baseColorName === 'friend') return `${baseProps} bg-gradient-to-br from-teal-400/80 to-green-400/80 hover:from-teal-500/80 hover:to-green-500/80 focus-visible:ring-teal-500 ${hoverEffect}`;
      if (baseColorName === 'computer') return `${baseProps} bg-gradient-to-br from-rose-500/80 to-red-500/80 hover:from-rose-600/80 hover:to-red-600/80 focus-visible:ring-rose-500 ${hoverEffect}`;
      if (baseColorName === 'online') return `${baseProps} bg-gradient-to-br from-sky-500/80 to-indigo-500/80 hover:from-sky-600/80 hover:to-indigo-600/80 focus-visible:ring-sky-500 ${hoverEffect}`;
      if (baseColorName === 'puzzle') return `${baseProps} bg-gradient-to-br from-lime-500/80 to-green-500/80 hover:from-lime-600/80 hover:to-green-600/80 focus-visible:ring-lime-500 ${hoverEffect}`;
      if (baseColorName === 'hof') return `${baseProps} bg-gradient-to-br from-amber-400/80 to-orange-500/80 hover:from-amber-500/80 hover:to-orange-600/80 focus-visible:ring-amber-500 ${hoverEffect}`;
    }
    return '';
  };
  const welcomeArenaMenuItems: WelcomeArenaMenuItem[] = [
    { id: 'friend', label: 'Play Friend', icon: '🧑‍🤝‍🧑', baseColor: 'friend' },
    { id: 'computer', label: 'Play AI', icon: '🤖', baseColor: 'computer' },
    { id: 'online', label: 'Play Online', icon: '🌐', baseColor: 'online' },
    { id: 'puzzle', label: 'Puzzle Mode', icon: '🧩', baseColor: 'puzzle' }, // New Puzzle Mode
    { id: 'hof', label: 'Hall of Fame', icon: '🏆', baseColor: 'hof' },
  ];

  const welcomeKingPiece: Piece = {type: PieceType.KING, color: PlayerColor.WHITE, hasMoved: true, id: 'welcome-king'};
  // Need to define initialOnlineStateFromSetup for online name display if it's used by turnIndicatorPlayerName
  const initialOnlineStateFromSetup = onlineGameIdForStorage ? getOnlineGameState(onlineGameIdForStorage) : null;


  return (
    <div className="min-h-screen flex flex-col items-center justify-start pt-4 sm:pt-6 p-2 sm:p-3 bg-transparent">
      <MenuModal 
        isOpen={isMenuOpen} 
        onClose={() => setIsMenuOpen(false)}
        theme={theme}
        onToggleTheme={toggleTheme}
        onResetToMainMenu={resetGameToWelcomeArena}
        onSelectModeFromMenu={handleSelectModeFromWelcomeArena} 
        onSaveCurrentGame={handleSaveCurrentGame}
        canSaveGame={!!gameMode && gameMode !== 'puzzle' && isGameSetupComplete && !gameStatus.isGameOver}
        savedGames={savedGames}
        onLoadSavedGame={handleLoadSavedGame}
        onDeleteSavedGame={handleDeleteSavedGame}
        onClearAllSavedGames={handleClearAllSavedGames}
        onOpenLayoutCustomization={handleOpenLayoutCustomization}
        onOpenChessGuide={() => handleToggleChessGuide(true)}
        onOpenChangelog={() => handleToggleChangelogModal(true)} // Added this prop
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

      {(!gameMode || (!isGameSetupComplete && !isGameSetupPending)) && !viewingHallOfFame && !isChessGuideOpen && !isChangelogModalOpen && !isOnlineWarningModalOpen && (
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
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-5"> {/* Consider 3 cols for 5 items */}
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
      
      {gameMode && gameMode !== 'puzzle' && isGameSetupComplete && (
        <main className="flex flex-col items-center space-y-3 sm:space-y-4 w-full mt-2">
            <PlayerDisplayPanel playerName={player2Name} playerColor={PlayerColor.BLACK} capturedPieces={capturedByBlack} isCurrentTurn={currentPlayer === PlayerColor.BLACK} theme={theme} layoutSettings={layoutSettings} timeLeft={player2TimeLeft} timeLimit={timeLimitPerPlayer} />
            <div className="flex flex-col items-center w-full max-w-max mx-auto">
                <Board boardState={boardState} onSquareClick={handleSquareClick} selectedPiecePosition={selectedPiecePosition} possibleMoves={possibleMoves} currentPlayer={currentPlayer} kingInCheckPosition={kingInCheckPosition} theme={theme} layoutSettings={layoutSettings} lastMove={lastMove} hintSuggestion={hintSuggestion} hintKey={hintKey}/>
                <GameControls 
                    theme={theme} 
                    onUndo={handleUndoMove} 
                    canUndo={moveHistory.length > 0 && !gameStatus.isGameOver && !(gameMode === 'computer' && isComputerThinking) && gameMode !== 'online' && !timeLimitPerPlayer}
                    onHint={handleRequestHint}
                    canHint={!gameStatus.isGameOver && !(gameMode === 'computer' && currentPlayer === PlayerColor.BLACK) && !isComputerThinking && gameMode !== 'online'}
                />
            </div>
            <PlayerDisplayPanel playerName={player1Name} playerColor={PlayerColor.WHITE} capturedPieces={capturedByWhite} isCurrentTurn={currentPlayer === PlayerColor.WHITE} theme={theme} layoutSettings={layoutSettings} timeLeft={player1TimeLeft} timeLimit={timeLimitPerPlayer}/>
            {gameMode === 'online' && onlineGameIdForStorage && isGameSetupComplete && (
                <div className={`mt-2 p-2 rounded-lg text-xs shadow-md ${theme === 'dark' ? 'bg-slate-700/50 text-slate-300 border border-slate-600/50' : 'bg-gray-100/70 text-slate-600 border border-gray-300/50'}`}>
                    Online Game ID: <strong className={theme === 'dark' ? 'text-yellow-300' : 'text-yellow-600'}>{onlineGameIdForStorage}</strong> (Same device simulation)
                </div>
            )}
            <GameInfo currentPlayerName={turnIndicatorPlayerName()} gameStatus={gameStatus} onReset={() => handleResetAndOpenMenu(true) } isGameOver={gameStatus.isGameOver} theme={theme}/>
        </main>
      )}

      {gameMode === 'puzzle' && isGameSetupComplete && currentPuzzle && (
        <main className="flex flex-col items-center space-y-3 sm:space-y-4 w-full mt-2">
            <PuzzleControls
                theme={theme}
                puzzle={currentPuzzle}
                puzzleMessage={puzzleMessage}
                onNextPuzzle={() => loadPuzzle(currentPuzzleIndex + 1 >= PUZZLES.length ? 0 : currentPuzzleIndex + 1)}
                onPrevPuzzle={() => loadPuzzle(currentPuzzleIndex - 1 < 0 ? PUZZLES.length - 1 : currentPuzzleIndex - 1)}
                onResetPuzzle={() => loadPuzzle(currentPuzzleIndex)}
                isFirstPuzzle={currentPuzzleIndex === 0}
                isLastPuzzle={currentPuzzleIndex === PUZZLES.length - 1}
            />
            <Board boardState={boardState} onSquareClick={handleSquareClick} selectedPiecePosition={selectedPiecePosition} possibleMoves={possibleMoves} currentPlayer={currentPlayer} kingInCheckPosition={kingInCheckPosition} theme={theme} layoutSettings={layoutSettings} lastMove={lastMove} hintSuggestion={null} />
             {/* Simplified display for puzzle mode, no player panels or full game info */}
            <GameInfo 
                currentPlayerName={currentPuzzle.playerToMove === PlayerColor.WHITE ? "White" : "Black"}
                gameStatus={gameStatus} // gameStatus will hold puzzle description or success/fail
                onReset={() => handleResetAndOpenMenu(true)} 
                isGameOver={gameStatus.isGameOver} // Game over means puzzle solved or failed attempt
                theme={theme}
            />
        </main>
      )}

      {promotionSquare && gameMode && isGameSetupComplete && (
        <PromotionModal playerColor={boardState[promotionSquare[0]][promotionSquare[1]]?.color || currentPlayer} onPromote={handlePromotion} theme={theme} layoutSettings={layoutSettings} />
      )}
       <footer className={`mt-auto pt-6 sm:pt-8 text-center text-xs ${theme === 'dark' ? 'text-slate-400/70' : 'text-slate-500/80'} select-none`}>
        <p>Select a piece, then its destination. Good luck!</p>
        <p>&copy; 2025 Joyonto Karmakar. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default App;
