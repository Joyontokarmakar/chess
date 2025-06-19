
import React, { useState, useEffect, useCallback, useRef } from 'react';
import { BoardState, PlayerColor, Position, PieceType, CastlingRights, GameStatus, Piece, GameMode, AIMove, OnlineGameState, Theme, SavedGame, LayoutSettings, BoardStyleId, PieceColorOption, GameOverReason, TIME_OPTIONS } from './types';
import { createInitialBoard, INITIAL_CASTLING_RIGHTS, AI_PLAYER_NAME, PIECE_SYMBOLS } from './constants';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import PromotionModal from './components/PromotionModal';
import PlayerDisplayPanel from './components/PlayerDisplayPanel';
import MenuModal from './components/MenuModal'; 
import PlayerNameEntry from './components/PlayerNameEntry';
import OnlineGameSetup from './components/OnlineGameSetup';
import TurnIndicator from './components/TurnIndicator';
import HallOfFame from './components/HallOfFame';
import Logo from './components/Logo';
import LayoutCustomizationModal from './components/LayoutCustomizationModal';
import TimeModeSelectionModal from './components/TimeModeSelectionModal'; 
import ChessGuide from './components/ChessGuide'; 
import OnlineWarningModal from './components/OnlineWarningModal'; // New Modal
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
  getOnlineGameState, // Added for localStorage online play
  setOnlineGameState, // Added for localStorage online play
  getOnlineGameStorageKey // Added for localStorage online play
} from './utils/localStorageUtils';

// Firebase imports removed

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
  id: GameMode | 'hof';
  label: string;
  icon: string;
  baseColor: string;
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

  // Timer states
  const [timeLimitPerPlayer, setTimeLimitPerPlayer] = useState<number | null>(null);
  const [player1TimeLeft, setPlayer1TimeLeft] = useState<number | null>(null);
  const [player2TimeLeft, setPlayer2TimeLeft] = useState<number | null>(null);
  const [gameStartTimeStamp, setGameStartTimeStamp] = useState<number | null>(null);
  const timerIntervalRef = useRef<number | null>(null);

  // Online game state (localStorage based)
  const [onlineGameIdForStorage, setOnlineGameIdForStorage] = useState<string | null>(null);
  const [localPlayerColorForStorage, setLocalPlayerColorForStorage] = useState<PlayerColor | null>(null);
  const [isOnlineGameReadyForStorage, setIsOnlineGameReadyForStorage] = useState<boolean>(false);
  const lastMoveByRef = useRef<PlayerColor | null>(null); // To avoid self-updating from storage events
  const [isOnlineWarningModalOpen, setIsOnlineWarningModalOpen] = useState<boolean>(false);


  const [savedGames, setSavedGames] = useState<SavedGame[]>(getSavedGames());
  
  const initialLayoutSettings = getLayoutSettingsFromStorage() || {
    boardStyleId: 'default-dark' as BoardStyleId,
    whitePieceColor: 'white-theme-default' as PieceColorOption,
    blackPieceColor: 'black-theme-default' as PieceColorOption,
  };
  const [layoutSettings, setLayoutSettings] = useState<LayoutSettings>(initialLayoutSettings);
  const [isLayoutModalOpen, setIsLayoutModalOpen] = useState(false);
  const [isChessGuideOpen, setIsChessGuideOpen] = useState(false); 

  const handleToggleChessGuide = (isOpen: boolean) => {
    setIsChessGuideOpen(isOpen);
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
    }
  }, [onlineGameIdForStorage, localPlayerColorForStorage, player2Name]);

  // Effect for localStorage listener
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      updateLocalStateFromStorage(event.key);
    };

    if (gameMode === 'online' && onlineGameIdForStorage) {
      window.addEventListener('storage', handleStorageChange);
      // Also fetch initial state in case already updated by other tab before listener attached
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
    
    if (gameStatusResult.isGameOver && gameMode) { 
        const duration = gameStartTimeStamp ? (Date.now() - gameStartTimeStamp) / 1000 : null;
        saveHallOfFameEntry(
            gameStatusResult.winnerName || (gameStatusResult.reason === 'stalemate' ? "Draw" : "N/A"),
            gameStatusResult.winnerName === actingPlayerNameForStatus ? opponentPlayerNameForStatus : actingPlayerNameForStatus,
            gameMode, // Save with the actual gameMode, including 'online' if desired
            gameStartTimeStamp,
            duration,
            gameStatusResult.reason || (gameStatusResult.winner ? undefined : 'draw')
        );
    }

    setGameStatus(gameStatusResult); setKingInCheckPosition(newKingInCheckPos);
    return { gameStatusResult, newKingInCheckPos }; 
  }, [player1Name, player2Name, gameMode, gameStartTimeStamp]); 


  useEffect(() => {
    if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
    if (!timeLimitPerPlayer || gameStatus.isGameOver || promotionSquare) {
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
          const currentOnlineState = getOnlineGameState(onlineGameIdForStorage);
          if (currentOnlineState) {
            const updates: Partial<OnlineGameState> = { 
                player1TimeLeft: newTimeLeftP1, 
                player2TimeLeft: newTimeLeftP2 
            };
            if (timeoutOccurred && timedOutPlayer) {
                const winner = timedOutPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
                const winnerName = winner === PlayerColor.WHITE ? currentOnlineState.player1Name : (currentOnlineState.player2Name || "Player 2");
                const loserName = timedOutPlayer === PlayerColor.WHITE ? currentOnlineState.player1Name : (currentOnlineState.player2Name || "Player 2");
                updates.gameStatus = {
                    message: `${loserName}'s time ran out! ${winnerName} wins by timeout!`,
                    isGameOver: true, winner, winnerName, reason: 'timeout'
                };
                if (timerIntervalRef.current) clearInterval(timerIntervalRef.current);
            }
            setOnlineGameState(onlineGameIdForStorage, { ...currentOnlineState, ...updates, lastMoveBy: currentPlayer });
            lastMoveByRef.current = currentPlayer;
          }
      } else if (timeoutOccurred && timedOutPlayer) { // Non-online game timeout
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

  const applyMove = useCallback(async (from: Position, to: Position, promotionType?: PieceType) => {
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
      if (currentPlayer === PlayerColor.WHITE) { 
        newCapturedByWhite.push(capturedPiece); 
      } else { 
        newCapturedByBlack.push(capturedPiece); 
      }
      setCapturedByWhite(newCapturedByWhite); 
      setCapturedByBlack(newCapturedByBlack); 
      moveMessagePreamble = `${getCurrentPlayerRealNameForDisplay()}'s ${PIECE_SYMBOLS[movingPiece.color][movingPiece.type]} captured ${getOpponentPlayerNameForDisplay()}'s ${PIECE_SYMBOLS[capturedPiece.color][capturedPiece.type]}`;
    }

    setBoardState(newBoard); setCastlingRights(newCastlingRights); setEnPassantTarget(newEnPassantTarget);
    
    if (gameMode !== 'online') { // For local modes, set currentPlayer immediately if no promotion
        lastMoveByRef.current = null; // Not used for local modes
    }

    if (promSq && !promotionType) {
      setPromotionSquare(promSq);
      if (gameMode === 'online' && onlineGameIdForStorage) {
        const { gameStatusResult: tempStatus, newKingInCheckPos: kcipForOnline } = 
            await updateGameStatus(newBoard, currentPlayer, newCastlingRights, newEnPassantTarget, null, moveMessagePreamble);
        
        const onlineUpdate: OnlineGameState = {
            boardState: newBoard, currentPlayer, castlingRights: newCastlingRights, enPassantTarget: newEnPassantTarget,
            capturedByWhite: newCapturedByWhite, capturedByBlack: newCapturedByBlack, gameStatus: tempStatus,
            lastMoveBy: currentPlayer, kingInCheckPosition: kcipForOnline,
            lastMove: newLastMove,
            player1Name, player2Name: player2Name || null, isGameReady: isOnlineGameReadyForStorage,
            timeLimitPerPlayer, player1TimeLeft, player2TimeLeft, gameStartTimeStamp,
        };
        setOnlineGameState(onlineGameIdForStorage, onlineUpdate);
        lastMoveByRef.current = currentPlayer;
      }
    } else {
      const nextPlayer = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      const { gameStatusResult: finalGameStatus, newKingInCheckPos: finalKcip } = 
          await updateGameStatus(newBoard, currentPlayer, newCastlingRights, newEnPassantTarget, null, moveMessagePreamble);
      
      if (gameMode === 'online' && onlineGameIdForStorage) {
         const onlineUpdate: OnlineGameState = {
          boardState: newBoard, currentPlayer: nextPlayer, castlingRights: newCastlingRights, enPassantTarget: newEnPassantTarget,
          capturedByWhite: newCapturedByWhite, capturedByBlack: newCapturedByBlack, gameStatus: finalGameStatus,
          lastMoveBy: currentPlayer, kingInCheckPosition: finalKcip,
          lastMove: newLastMove,
          player1Name, player2Name: player2Name || null, isGameReady: isOnlineGameReadyForStorage,
          timeLimitPerPlayer, player1TimeLeft, player2TimeLeft, gameStartTimeStamp,
        };
        setOnlineGameState(onlineGameIdForStorage, onlineUpdate);
        lastMoveByRef.current = currentPlayer;
      }
      if (!finalGameStatus.isGameOver) setCurrentPlayer(nextPlayer);
    }
    setSelectedPiecePosition(null); setPossibleMoves([]);
  }, [boardState, currentPlayer, castlingRights, enPassantTarget, updateGameStatus, getCurrentPlayerRealNameForDisplay, getOpponentPlayerNameForDisplay, gameMode, onlineGameIdForStorage, capturedByWhite, capturedByBlack, player1Name, player2Name, isOnlineGameReadyForStorage, timeLimitPerPlayer, player1TimeLeft, player2TimeLeft, gameStartTimeStamp]);

  const handleSquareClick = useCallback((pos: Position) => {
    if (gameStatus.isGameOver || promotionSquare) return;
    if (gameMode === 'computer' && currentPlayer === PlayerColor.BLACK && isComputerThinking) return;
    if (gameMode === 'online' && (!isOnlineGameReadyForStorage || currentPlayer !== localPlayerColorForStorage)) return;

    const piece = boardState[pos[0]][pos[1]];
    if (selectedPiecePosition) {
      if (possibleMoves.some(move => move[0] === pos[0] && move[1] === pos[1])) {
        applyMove(selectedPiecePosition, pos); 
      }
      else {
        setSelectedPiecePosition(null); setPossibleMoves([]);
        if (piece && piece.color === currentPlayer) {
          setSelectedPiecePosition(pos);
          setPossibleMoves(getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget));
        }
      }
    } else if (piece && piece.color === currentPlayer) {
      setSelectedPiecePosition(pos);
      setPossibleMoves(getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget));
    }
  }, [boardState, currentPlayer, selectedPiecePosition, possibleMoves, castlingRights, enPassantTarget, gameStatus.isGameOver, promotionSquare, applyMove, gameMode, isComputerThinking, localPlayerColorForStorage, isOnlineGameReadyForStorage]);

  const handlePromotion = useCallback(async (pieceType: PieceType) => {
    if (!promotionSquare) return;
    const tempBoard = createDeepBoardCopy(boardState);
    const pawnToPromote = tempBoard[promotionSquare[0]][promotionSquare[1]];
    if(pawnToPromote && pawnToPromote.type === PieceType.PAWN) {
      tempBoard[promotionSquare[0]][promotionSquare[1]] = {...pawnToPromote, type: pieceType, id: pawnToPromote.id.replace(/P\d*$/, pieceType)};
      setBoardState(tempBoard); 
      
      const nextPlayer = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      const promoMessage = `${getCurrentPlayerRealNameForDisplay()} promoted Pawn to ${PIECE_SYMBOLS[currentPlayer][pieceType]}!`;
      
      const { gameStatusResult: finalGameStatus, newKingInCheckPos: kcipAfterPromo } = 
          await updateGameStatus(tempBoard, currentPlayer, castlingRights, enPassantTarget, null, promoMessage);
      
      if (gameMode !== 'online') {
          lastMoveByRef.current = null;
      }

      if (gameMode === 'online' && onlineGameIdForStorage) {
        const onlineUpdate: OnlineGameState = {
            boardState: tempBoard, currentPlayer: nextPlayer, castlingRights, enPassantTarget,
            capturedByWhite, capturedByBlack, gameStatus: finalGameStatus,
            lastMoveBy: currentPlayer, kingInCheckPosition: kcipAfterPromo,
            lastMove: lastMove,
            player1Name, player2Name: player2Name || null, isGameReady: isOnlineGameReadyForStorage,
            timeLimitPerPlayer, player1TimeLeft, player2TimeLeft, gameStartTimeStamp,
        };
        setOnlineGameState(onlineGameIdForStorage, onlineUpdate);
        lastMoveByRef.current = currentPlayer;
      }
      if (!finalGameStatus.isGameOver) setCurrentPlayer(nextPlayer);
    }
    setPromotionSquare(null); setSelectedPiecePosition(null); setPossibleMoves([]);
  }, [boardState, promotionSquare, currentPlayer, castlingRights, enPassantTarget, updateGameStatus, getCurrentPlayerRealNameForDisplay, gameMode, onlineGameIdForStorage, capturedByWhite, capturedByBlack, lastMove, player1Name, player2Name, isOnlineGameReadyForStorage, timeLimitPerPlayer, player1TimeLeft, player2TimeLeft, gameStartTimeStamp]);

  useEffect(() => {
    if (gameMode === 'computer' && currentPlayer === PlayerColor.BLACK && !gameStatus.isGameOver && !promotionSquare && !isComputerThinking) {
      setIsComputerThinking(true);
      const aiMoveDelay = timeLimitPerPlayer ? Math.max(1000, Math.random() * 2000 + 1000) : 500; 
      setTimeout(() => {
        getComputerMove(boardState, PlayerColor.BLACK, castlingRights, enPassantTarget)
          .then((aiMove: AIMove | null) => {
            if (aiMove && !gameStatus.isGameOver) { 
              const pieceAtFrom = boardState[aiMove.from[0]][aiMove.from[1]];
              if (pieceAtFrom && pieceAtFrom.color === PlayerColor.BLACK) {
                  const AIsPossibleMoves = getPossibleMoves(boardState, aiMove.from, PlayerColor.BLACK, castlingRights, enPassantTarget);
                  if (AIsPossibleMoves.some(m => m[0] === aiMove.to[0] && m[1] === aiMove.to[1])) {
                     applyMove(aiMove.from, aiMove.to, aiMove.promotion);
                  }
                  else {
                      setGameStatus(prev => ({...prev, message: "AI error: Invalid move. Your turn."})); setCurrentPlayer(PlayerColor.WHITE); 
                      setLastMove(null); 
                  }
              } else {
                   setGameStatus(prev => ({...prev, message: "AI error: No piece to move. Your turn."})); setCurrentPlayer(PlayerColor.WHITE); 
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
  }, [currentPlayer, gameMode, gameStatus.isGameOver, promotionSquare, boardState, castlingRights, enPassantTarget, applyMove, isComputerThinking, timeLimitPerPlayer]);

  const handleSelectModeFromWelcomeArena = (mode: GameMode | 'hof') => {
    resetGameToWelcomeArena(true); 
    if (mode === 'hof') {
        setViewingHallOfFame(true);
        setIsGameSetupPending(false);
    } else {
        if (mode === 'online') {
            setIsOnlineWarningModalOpen(true);
            // Game setup for 'online' will proceed from the warning modal's confirmation
        } else {
            setGameMode(mode as GameMode); 
            setIsGameSetupPending(true); 
            setIsTimeModeSelectionOpen(true); 
        }
    }
    setIsMenuOpen(false);
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
    // If gameMode is not 'online', isGameSetupPending should remain true to proceed to PlayerNameEntry
    // If it *is* 'online', isGameSetupPending also remains true to proceed to OnlineGameSetup.
    // This seems correct as OnlineGameSetup or PlayerNameEntry are the next steps.
  };

  const handlePlayerNameSetup = (p1Name: string, p2NameProvided?: string) => { 
    const finalP1Name = p1Name.trim() || "Player 1";
    let finalP2Name = "Player 2";
    setPlayer1Name(finalP1Name);
    if (gameMode === 'friend') {
      finalP2Name = p2NameProvided?.trim() || "Player 2"; setPlayer2Name(finalP2Name);
    } else if (gameMode === 'computer') {
      finalP2Name = AI_PLAYER_NAME; setPlayer2Name(AI_PLAYER_NAME);
    }
    
    setIsGameSetupComplete(true); 
    setIsGameSetupPending(false);
    setViewingHallOfFame(false);
    setGameStatus({ message: `Game started. Good luck, ${finalP1Name} and ${finalP2Name}!`, isGameOver: false });
    setLastMove(null);
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
    setCastlingRights(initialOnlineStateFromSetup.castlingRights);
    setEnPassantTarget(initialOnlineStateFromSetup.enPassantTarget);
    setCapturedByWhite(initialOnlineStateFromSetup.capturedByWhite);
    setCapturedByBlack(initialOnlineStateFromSetup.capturedByBlack);
    setGameStatus(initialOnlineStateFromSetup.gameStatus);
    setPlayer1Name(initialOnlineStateFromSetup.player1Name);
    setPlayer2Name(initialOnlineStateFromSetup.player2Name || (isHost ? "Waiting..." : localPName));
    setIsOnlineGameReadyForStorage(initialOnlineStateFromSetup.isGameReady);
    setKingInCheckPosition(initialOnlineStateFromSetup.kingInCheckPosition);
    setLastMove(initialOnlineStateFromSetup.lastMove || null);
    setTimeLimitPerPlayer(initialOnlineStateFromSetup.timeLimitPerPlayer);
    setPlayer1TimeLeft(initialOnlineStateFromSetup.player1TimeLeft);
    setPlayer2TimeLeft(initialOnlineStateFromSetup.player2TimeLeft);
    setGameStartTimeStamp(initialOnlineStateFromSetup.gameStartTimeStamp);
    
    if (!isHost) { // If joining, set own name explicitly if not already set by host somehow
        setPlayer2Name(localPName);
    }
    lastMoveByRef.current = initialOnlineStateFromSetup.lastMoveBy;


    setGameMode('online'); 
    setIsGameSetupComplete(true); 
    setIsGameSetupPending(false);
    setViewingHallOfFame(false);
    setIsMenuOpen(false); 
  };

  const handleSaveCurrentGame = () => {
    if (!gameMode || !isGameSetupComplete || gameStatus.isGameOver) return;
    let gameModeToSave: 'friend' | 'computer' | 'loaded_friend' = 'friend';
    if (gameMode === 'computer') gameModeToSave = 'computer';
    else if (gameMode === 'online') gameModeToSave = 'loaded_friend'; 
    else if (gameMode === 'loaded_friend') gameModeToSave = 'loaded_friend';
    else gameModeToSave = 'friend';

    const gameToSave: SavedGame = {
      id: `${Date.now()}-${Math.random().toString(36).substring(2, 7)}`,
      name: `vs ${gameMode === 'computer' ? AI_PLAYER_NAME : (gameMode === 'online' || gameMode === 'loaded_friend' ? (localPlayerColorForStorage === PlayerColor.WHITE ? player2Name : player1Name) : player2Name)} ${timeLimitPerPlayer ? `(${timeLimitPerPlayer/60} min)` : ''}`,
      timestamp: Date.now(), gameMode: gameModeToSave, boardState, currentPlayer, player1Name,
      player2Name, castlingRights, enPassantTarget, capturedByWhite, capturedByBlack, gameStatus, kingInCheckPosition,
      originalLocalPlayerColor: gameMode === 'online' ? localPlayerColorForStorage : null,
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
    setPlayer1Name(gameToLoad.player1Name); setPlayer2Name(gameToLoad.player2Name);
    setBoardState(gameToLoad.boardState); setCurrentPlayer(gameToLoad.currentPlayer);
    setCastlingRights(gameToLoad.castlingRights); setEnPassantTarget(gameToLoad.enPassantTarget);
    setCapturedByWhite(gameToLoad.capturedByWhite); setCapturedByBlack(gameToLoad.capturedByBlack);
    setGameStatus(gameToLoad.gameStatus); setKingInCheckPosition(gameToLoad.kingInCheckPosition);
    setLastMove(gameToLoad.lastMove || null);
    
    setTimeLimitPerPlayer(gameToLoad.timeLimitPerPlayer);
    setPlayer1TimeLeft(gameToLoad.player1TimeLeft);
    setPlayer2TimeLeft(gameToLoad.player2TimeLeft);
    setGameStartTimeStamp(gameToLoad.gameStartTimeStamp);

    // Ensure online-specific states are reset when loading a local game
    setOnlineGameIdForStorage(null);
    setLocalPlayerColorForStorage(null);
    setIsOnlineGameReadyForStorage(false);

    setIsGameSetupComplete(true); 
    setIsGameSetupPending(false);
    setIsMenuOpen(false);
  };

  const handleDeleteSavedGame = (gameId: string) => {
    deleteSavedGameFromStorage(gameId);
    setSavedGames(getSavedGames());
  };

  const handleClearAllSavedGames = () => {
    if (window.confirm("Are you sure you want to delete ALL saved games? This cannot be undone.")) {
      clearAllSavedGamesFromStorage();
      setSavedGames([]);
    }
  };

  const handleResetAndOpenMenu = (navigateToWelcome: boolean = true) => {
    resetGameToWelcomeArena(!navigateToWelcome); 
    setIsMenuOpen(true);
  };

  const handleOpenLayoutCustomization = () => {
    setIsLayoutModalOpen(true);
    setIsMenuOpen(false); 
  };


  if (viewingHallOfFame) {
    return <HallOfFame onBackToMenu={() => { setViewingHallOfFame(false); resetGameToWelcomeArena(); }} theme={theme} />;
  }

  if (isChessGuideOpen) {
    return <ChessGuide isOpen={isChessGuideOpen} onClose={() => handleToggleChessGuide(false)} theme={theme} />;
  }

  if (isOnlineWarningModalOpen) {
    return (
      <OnlineWarningModal 
        isOpen={isOnlineWarningModalOpen}
        onProceed={handleProceedFromOnlineWarning}
        onCancel={() => { setIsOnlineWarningModalOpen(false); resetGameToWelcomeArena(); }}
        theme={theme}
      />
    );
  }

  if (isTimeModeSelectionOpen && gameMode) {
    return <TimeModeSelectionModal isOpen={isTimeModeSelectionOpen} onClose={handleTimeModeSelected} theme={theme} />;
  }
  
  if (isGameSetupPending && !isTimeModeSelectionOpen && gameMode) {
     if (gameMode === 'online') {
        return <OnlineGameSetup onGameSetupComplete={handleOnlineGameSetupComplete} onBackToMenu={() => resetGameToWelcomeArena()} theme={theme} initialTimeLimit={timeLimitPerPlayer} />;
    } else if (gameMode === 'friend' || gameMode === 'computer') {
        return <PlayerNameEntry gameMode={gameMode} onSetupComplete={handlePlayerNameSetup} onBackToMenu={() => resetGameToWelcomeArena()} theme={theme} />;
    }
  }
  
  const turnIndicatorPlayerName = () => {
    if (gameMode === 'computer' && currentPlayer === PlayerColor.BLACK && isComputerThinking) return AI_PLAYER_NAME;
    if (gameMode === 'online') return currentPlayer === PlayerColor.WHITE ? player1Name : (player2Name || 'Player 2');
    return getCurrentPlayerRealNameForDisplay();
  }
  
  const headerTextColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const headerTextShadow = theme === 'dark' ? '0 0 10px rgba(180,180,255,0.2), 0 0 20px rgba(120,120,255,0.25)' : '0 0 8px rgba(0,0,0,0.15)';
  const onlineIdContainerClass = theme === 'dark' ? 'bg-slate-700/60 backdrop-blur-md border border-slate-600/50' : 'bg-slate-200/70 backdrop-blur-md border border-slate-300/60';
  const onlineIdText = theme === 'dark' ? 'text-sky-300' : 'text-sky-700';
  const onlineIdSubText = theme === 'dark' ? 'text-slate-400' : 'text-slate-500';
  const onlineIdValueText = theme === 'dark' ? 'text-yellow-300 font-bold' : 'text-yellow-600 font-bold';
  const footerTextColor = theme === 'dark' ? 'text-slate-400/70' : 'text-slate-500/80';
  const waitingMsgContainerClass = theme === 'dark' ? 'bg-yellow-600/20 backdrop-blur-lg border border-yellow-500/40 text-yellow-200' : 'bg-yellow-100/80 backdrop-blur-lg border border-yellow-300/60 text-yellow-700';
  const joiningMsgContainerClass = theme === 'dark' ? 'bg-sky-600/20 backdrop-blur-lg border border-sky-500/40 text-sky-200' : 'bg-sky-100/80 backdrop-blur-lg border border-sky-300/60 text-sky-700';
  const waitingIdValueText = theme === 'dark' ? 'text-yellow-100' : 'text-yellow-800';
  const hamburgerIconColor = theme === 'dark' ? 'text-slate-300 hover:text-sky-300 focus-visible:text-sky-300' : 'text-slate-600 hover:text-sky-600 focus-visible:text-sky-600';
  
  const welcomePanelClasses = theme === 'dark' ? 'bg-slate-800/60 backdrop-blur-xl border border-slate-700/70 shadow-black/40' : 'bg-white/70 backdrop-blur-xl border-gray-300/70 shadow-gray-400/30';
  const welcomeTitleColor = theme === 'dark' ? 'text-slate-100' : 'text-slate-800';
  const welcomeSubTextColor = theme === 'dark' ? 'text-slate-300' : 'text-slate-600';
  const welcomeIconColor = theme === 'dark' ? 'text-slate-400' : 'text-slate-500'; 
  
  const welcomeArenaCardBaseClasses = `relative group w-full max-w-[11rem] h-44 sm:max-w-[12rem] sm:h-48 rounded-xl shadow-xl hover:shadow-2xl focus:outline-none transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center overflow-hidden p-3 text-center font-semibold backdrop-blur-xl border focus-visible:ring-4 focus-visible:ring-opacity-60`;
  const welcomeArenaGlowVarsDark = {
      friend: {'--glow-color-dark': 'rgba(34, 211, 238, 0.4)', '--glow-color-dark-soft': 'rgba(45, 212, 191, 0.3)'},
      computer: {'--glow-color-dark': 'rgba(251, 113, 133, 0.4)', '--glow-color-dark-soft': 'rgba(239, 68, 68, 0.3)'},
      online: {'--glow-color-dark': 'rgba(56, 189, 248, 0.4)', '--glow-color-dark-soft': 'rgba(99, 102, 241, 0.3)'},
      hof: {'--glow-color-dark': 'rgba(251, 191, 36, 0.5)', '--glow-color-dark-soft': 'rgba(249, 115, 22, 0.4)'},
  };
  const welcomeArenaGlowVarsLight = {
      friend: {'--glow-color-light': 'rgba(20, 184, 166, 0.3)', '--glow-color-light-soft': 'rgba(16, 185, 129, 0.2)'},
      computer: {'--glow-color-light': 'rgba(220, 38, 38, 0.3)', '--glow-color-light-soft': 'rgba(244, 63, 94, 0.2)'},
      online: {'--glow-color-light': 'rgba(14, 165, 233, 0.3)', '--glow-color-light-soft': 'rgba(79, 70, 229, 0.2)'},
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
      if (baseColorName === 'hof') return `${baseProps} bg-gradient-to-br from-amber-500/70 to-orange-600/70 hover:from-amber-500/80 hover:to-orange-500/80 focus-visible:ring-amber-400 ${hoverEffect}`;
    } else { 
      if (baseColorName === 'friend') return `${baseProps} bg-gradient-to-br from-teal-400/80 to-green-400/80 hover:from-teal-500/80 hover:to-green-500/80 focus-visible:ring-teal-500 ${hoverEffect}`;
      if (baseColorName === 'computer') return `${baseProps} bg-gradient-to-br from-rose-500/80 to-red-500/80 hover:from-rose-600/80 hover:to-red-600/80 focus-visible:ring-rose-500 ${hoverEffect}`;
      if (baseColorName === 'online') return `${baseProps} bg-gradient-to-br from-sky-500/80 to-indigo-500/80 hover:from-sky-600/80 hover:to-indigo-600/80 focus-visible:ring-sky-500 ${hoverEffect}`;
      if (baseColorName === 'hof') return `${baseProps} bg-gradient-to-br from-amber-400/80 to-orange-500/80 hover:from-amber-500/80 hover:to-orange-600/80 focus-visible:ring-amber-500 ${hoverEffect}`;
    }
    return '';
  };
  const welcomeArenaMenuItems: WelcomeArenaMenuItem[] = [
    { id: 'friend', label: 'Play Friend', icon: '🧑‍🤝‍🧑', baseColor: 'friend' },
    { id: 'computer', label: 'Play AI', icon: '🤖', baseColor: 'computer' },
    { id: 'online', label: 'Play Online', icon: '🌐', baseColor: 'online' },
    { id: 'hof', label: 'Hall of Fame', icon: '🏆', baseColor: 'hof' },
  ];

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
        canSaveGame={!!gameMode && isGameSetupComplete && !gameStatus.isGameOver}
        savedGames={savedGames}
        onLoadSavedGame={handleLoadSavedGame}
        onDeleteSavedGame={handleDeleteSavedGame}
        onClearAllSavedGames={handleClearAllSavedGames}
        onOpenLayoutCustomization={handleOpenLayoutCustomization}
        onOpenChessGuide={() => handleToggleChessGuide(true)}
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
        <div className="flex justify-between items-center w-full max-w-6xl mx-auto">
            <button
                onClick={handleLogoClick}
                className={`p-1 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${theme === 'dark' ? 'focus-visible:ring-sky-400' : 'focus-visible:ring-sky-600'} ${headerTextColor}`}
                aria-label="Home and open menu"
            >
              <Logo theme={theme} className="h-10 sm:h-12 w-auto" />
            </button>
            
            <div 
              className={`absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 flex items-center justify-center h-10 sm:h-12 lg:h-14 ${headerTextColor} select-none pointer-events-none opacity-0 md:opacity-100`}
              style={{ textShadow: headerTextShadow }}
              aria-hidden="true" 
            >
              <Logo theme={theme} className="h-full w-auto" />
            </div>

            <button 
                onClick={() => setIsMenuOpen(true)} 
                className={`p-2 rounded-lg transition-colors duration-150 focus:outline-none focus-visible:ring-2 ${theme === 'dark' ? 'focus-visible:ring-sky-400' : 'focus-visible:ring-sky-600'} ${hamburgerIconColor}`}
                aria-label="Open menu"
            >
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-7 h-7 sm:w-8 sm:h-8">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5" />
                </svg>
            </button>
        </div>
        {gameMode === 'online' && onlineGameIdForStorage && isGameSetupComplete && (
            <div className={`mt-2.5 text-xs sm:text-sm ${onlineIdText} font-medium tracking-wide ${onlineIdContainerClass} px-4 py-2 rounded-lg inline-block shadow-lg`}>
                Online Game ID: <span className={onlineIdValueText}>{onlineGameIdForStorage}</span> 
                {localPlayerColorForStorage ? <span className={onlineIdSubText}> (You are {localPlayerColorForStorage})</span> : ''}
            </div>
        )}
      </header>

      {(!gameMode || (!isGameSetupComplete && !isGameSetupPending)) && !viewingHallOfFame && !isChessGuideOpen && !isOnlineWarningModalOpen && (
         <div className="flex-grow flex flex-col items-center justify-center text-center p-4 w-full">
            <div className={`p-6 sm:p-8 md:p-10 rounded-2xl shadow-2xl w-full max-w-xl ${welcomePanelClasses}`}>
                <div className={`text-5xl sm:text-6xl mb-4 ${welcomeIconColor} opacity-100`}>
                    ♔
                </div>
                <h1 className={`text-2xl sm:text-3xl font-bold mb-3 ${welcomeTitleColor}`}>
                    Welcome to the Chess Arena!
                </h1>
                <p className={`text-sm sm:text-base mb-6 sm:mb-8 ${welcomeSubTextColor}`}>
                    Choose a mode below or use the menu to start your strategic journey.
                </p>
                <div className="grid grid-cols-2 sm:grid-cols-2 gap-4 sm:gap-5">
                    {welcomeArenaMenuItems.map(item => {
                        const cardThemeClasses = getWelcomeArenaCardThemeClasses(item.baseColor, theme);
                        const selectedGlowSet = theme === 'dark' ? welcomeArenaGlowVarsDark : welcomeArenaGlowVarsLight;
                        // @ts-ignore
                        const glowVars = selectedGlowSet[item.baseColor];

                        return (
                            <button
                                key={item.id}
                                onClick={() => handleSelectModeFromWelcomeArena(item.id as GameMode | 'hof')}
                                className={`${welcomeArenaCardBaseClasses} ${cardThemeClasses}`}
                                style={glowVars as React.CSSProperties}
                                aria-label={item.label}
                            >
                                <span className="text-3xl sm:text-4xl mb-1.5 group-hover:scale-110 transition-transform duration-200">{item.icon}</span>
                                <span className="text-xs sm:text-sm">{item.label}</span>
                            </button>
                        );
                    })}
                </div>
            </div>
        </div>
      )}

      {gameMode && isGameSetupComplete && (
        <main className="flex flex-col items-center space-y-3 sm:space-y-4 w-full mt-2">
            <PlayerDisplayPanel
                playerName={player2Name}
                playerColor={PlayerColor.BLACK}
                capturedPieces={capturedByBlack}
                isCurrentTurn={currentPlayer === PlayerColor.BLACK}
                theme={theme}
                layoutSettings={layoutSettings}
                timeLeft={player2TimeLeft}
                timeLimit={timeLimitPerPlayer}
            />
            <div className="flex flex-row items-center justify-center w-full max-w-max mx-auto gap-1 sm:gap-2 md:gap-3">
                <Board
                    boardState={boardState}
                    onSquareClick={handleSquareClick}
                    selectedPiecePosition={selectedPiecePosition}
                    possibleMoves={possibleMoves}
                    currentPlayer={currentPlayer}
                    kingInCheckPosition={kingInCheckPosition}
                    theme={theme}
                    layoutSettings={layoutSettings}
                    lastMove={lastMove}
                />
            </div>
            
            <PlayerDisplayPanel
                playerName={player1Name}
                playerColor={PlayerColor.WHITE}
                capturedPieces={capturedByWhite}
                isCurrentTurn={currentPlayer === PlayerColor.WHITE}
                theme={theme}
                layoutSettings={layoutSettings}
                timeLeft={player1TimeLeft}
                timeLimit={timeLimitPerPlayer}
            />
            
            {gameMode === 'online' && !isOnlineGameReadyForStorage && onlineGameIdForStorage && localPlayerColorForStorage === PlayerColor.WHITE && (
                <div className={`p-4 ${waitingMsgContainerClass} rounded-lg shadow-xl text-center font-medium max-w-md w-full`}>
                    Waiting for Player 2 to join with Game ID: <strong className={waitingIdValueText}>{onlineGameIdForStorage}</strong>
                </div>
            )}
            {gameMode === 'online' && !isOnlineGameReadyForStorage && onlineGameIdForStorage && localPlayerColorForStorage === PlayerColor.BLACK && (
                <div className={`p-4 ${joiningMsgContainerClass} rounded-lg shadow-xl text-center font-medium max-w-md w-full`}>
                    Attempting to join game... Ensure host is waiting.
                </div>
            )}

            <GameInfo
                currentPlayerName={turnIndicatorPlayerName()}
                gameStatus={gameStatus}
                onReset={() => handleResetAndOpenMenu(true) } 
                isGameOver={gameStatus.isGameOver}
                theme={theme}
            />
        </main>
      )}

      {promotionSquare && gameMode && isGameSetupComplete && (
        <PromotionModal
            playerColor={boardState[promotionSquare[0]][promotionSquare[1]]?.color || currentPlayer}
            onPromote={handlePromotion}
            theme={theme} 
        />
      )}
       <footer className={`mt-auto pt-6 sm:pt-8 text-center text-xs ${footerTextColor} select-none`}>
        <p>Select a piece, then its destination. Good luck!</p>
        <p>&copy; 2025 Joyonto Karmakar. All Rights Reserved</p>
      </footer>
    </div>
  );
};

export default App;