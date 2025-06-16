import React, { useState, useEffect, useCallback } from 'react';
import { BoardState, PlayerColor, Position, PieceType, CastlingRights, GameStatus, Piece, GameMode, AIMove, LeaderboardEntry } from './types';
import { createInitialBoard, INITIAL_CASTLING_RIGHTS, AI_PLAYER_NAME, PIECE_SYMBOLS } from './constants';
import Board from './components/Board';
import GameInfo from './components/GameInfo';
import PromotionModal from './components/PromotionModal';
import CapturedPiecesDisplay from './components/CapturedPiecesDisplay';
// import ModeSelection from './components/ModeSelection'; // Now part of InitialScreen
import PlayerNameEntry from './components/PlayerNameEntry';
import InitialScreen from './components/InitialScreen'; // New
import { getComputerMove } from './utils/geminiApi'; 

import {
  getPossibleMoves,
  makeMove as performMakeMove,
  isKingInCheck,
  isCheckmate,
  isStalemate,
  findKingPosition,
  createDeepBoardCopy
} from './utils/chessLogic';

const LEADERBOARD_STORAGE_KEY = 'chessLeaderboard';

const App: React.FC = () => {
  const [gameMode, setGameMode] = useState<GameMode>(null);
  const [isGameSetupComplete, setIsGameSetupComplete] = useState<boolean>(false);
  
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
  const [gameStatus, setGameStatus] = useState<GameStatus>({ message: `Setting up...`, isGameOver: false });
  
  const [capturedByWhite, setCapturedByWhite] = useState<Piece[]>([]); 
  const [capturedByBlack, setCapturedByBlack] = useState<Piece[]>([]); 

  const [isComputerThinking, setIsComputerThinking] = useState<boolean>(false);

  const [leaderboardData, setLeaderboardData] = useState<LeaderboardEntry[]>([]);
  const [currentGameStartTime, setCurrentGameStartTime] = useState<number | null>(null);

  // Load leaderboard from localStorage on initial mount
  useEffect(() => {
    try {
      const storedLeaderboard = localStorage.getItem(LEADERBOARD_STORAGE_KEY);
      if (storedLeaderboard) {
        setLeaderboardData(JSON.parse(storedLeaderboard));
      }
    } catch (error) {
      console.error("Failed to load leaderboard from localStorage:", error);
      // Initialize with empty if error or not found
      setLeaderboardData([]);
    }
  }, []);

  // Save leaderboard to localStorage whenever it changes
  useEffect(() => {
    try {
      localStorage.setItem(LEADERBOARD_STORAGE_KEY, JSON.stringify(leaderboardData));
    } catch (error) {
      console.error("Failed to save leaderboard to localStorage:", error);
    }
  }, [leaderboardData]);


  const getCurrentPlayerRealName = useCallback(() => {
    return currentPlayer === PlayerColor.WHITE ? player1Name : player2Name;
  }, [currentPlayer, player1Name, player2Name]);

  const getOpponentPlayerName = useCallback(() => { 
    return currentPlayer === PlayerColor.WHITE ? player2Name : player1Name;
  }, [currentPlayer, player1Name, player2Name]);
  
  const resetGame = useCallback(() => {
    setGameMode(null); // This will take user back to InitialScreen
    setIsGameSetupComplete(false);
    
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
    setGameStatus({ message: `Setting up...`, isGameOver: false });
    setIsComputerThinking(false);
    setCurrentGameStartTime(null); // Reset game start time
  }, []);

  const updateGameStatus = useCallback((
    board: BoardState, 
    actingPlayer: PlayerColor, 
    currentCR: CastlingRights, 
    currentEPT: Position | null,
    moveMessagePreamble?: string 
  ) => {
    const opponentColor = actingPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
    const actingPlayerName = actingPlayer === PlayerColor.WHITE ? player1Name : player2Name;
    const opponentPlayerName = actingPlayer === PlayerColor.WHITE ? player2Name : player1Name;
    
    let newKingInCheckPos: Position | null = null;
    let statusMsg = `${moveMessagePreamble ? moveMessagePreamble + " " : ""}${opponentPlayerName}'s turn.`;
    let isGameOver = false;
    let winner: PlayerColor | undefined = undefined;
    let winnerName: string | undefined = undefined;

    if (isKingInCheck(board, opponentColor)) {
      newKingInCheckPos = findKingPosition(board, opponentColor);
      statusMsg = `${moveMessagePreamble ? moveMessagePreamble + " " : ""}${opponentPlayerName} is in Check!`;
      if (isCheckmate(board, opponentColor, currentCR, currentEPT)) {
        statusMsg = `Magnificent Checkmate! ${actingPlayerName} conquers the board!`;
        isGameOver = true;
        winner = actingPlayer;
        winnerName = actingPlayerName;
      }
    } else {
       if (isStalemate(board, opponentColor, currentCR, currentEPT)) {
        statusMsg = "A hard-fought Stalemate! The game is a draw.";
        isGameOver = true;
      }
    }
    
    setKingInCheckPosition(newKingInCheckPos);
    const newGameStatus: GameStatus = { message: statusMsg, isGameOver, winner, winnerName };
    setGameStatus(newGameStatus);

    if (newGameStatus.isGameOver && newGameStatus.winnerName && currentGameStartTime) {
        const gameEndTime = Date.now();
        const newEntry: LeaderboardEntry = {
            id: gameEndTime.toString() + "-" + Math.random().toString(36).substring(2,7), // Reasonably unique ID
            winnerName: newGameStatus.winnerName,
            gameStartTime: currentGameStartTime,
            gameEndTime: gameEndTime,
        };
        setLeaderboardData(prev => [...prev, newEntry]);
        setCurrentGameStartTime(null); // Reset for next game
    }


  }, [player1Name, player2Name, currentGameStartTime]);

  const applyMove = useCallback((from: Position, to: Position, promotionType?: PieceType) => {
    const movingPiece = boardState[from[0]][from[1]];
    if (!movingPiece) return;

    const { 
      newBoard, 
      newCastlingRights, 
      newEnPassantTarget, 
      promotionSquare: promSq,
      capturedPiece 
    } = performMakeMove(boardState, from, to, castlingRights, enPassantTarget, promotionType);

    let moveMessagePreamble = "";
    if (capturedPiece) {
      if (currentPlayer === PlayerColor.WHITE) {
        setCapturedByWhite(prev => [...prev, capturedPiece]);
      } else {
        setCapturedByBlack(prev => [...prev, capturedPiece]);
      }
      const capturedSymbol = PIECE_SYMBOLS[capturedPiece.color][capturedPiece.type];
      const movingSymbol = PIECE_SYMBOLS[movingPiece.color][movingPiece.type];
      moveMessagePreamble = `${getCurrentPlayerRealName()}'s ${movingSymbol} captured ${getOpponentPlayerName()}'s ${capturedSymbol}.`;
    }
    
    setBoardState(newBoard);
    setCastlingRights(newCastlingRights);
    setEnPassantTarget(newEnPassantTarget);
    
    if (promSq && !promotionType) { 
      setPromotionSquare(promSq);
    } else {
      const nextPlayer = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      updateGameStatus(newBoard, currentPlayer, newCastlingRights, newEnPassantTarget, moveMessagePreamble);
      // Only switch player if game not over and no promotion pending
      if (!gameStatus.isGameOver && !promSq) { 
          setCurrentPlayer(nextPlayer);
      }
    }
    
    setSelectedPiecePosition(null);
    setPossibleMoves([]);

  }, [boardState, currentPlayer, castlingRights, enPassantTarget, updateGameStatus, getCurrentPlayerRealName, getOpponentPlayerName, gameStatus.isGameOver]);


  const handleSquareClick = useCallback((pos: Position) => {
    if (gameStatus.isGameOver || promotionSquare || (gameMode === 'computer' && currentPlayer === PlayerColor.BLACK && isComputerThinking)) return;

    const piece = boardState[pos[0]][pos[1]];

    if (selectedPiecePosition) {
      if (possibleMoves.some(move => move[0] === pos[0] && move[1] === pos[1])) {
        applyMove(selectedPiecePosition, pos);
      } else { 
        setSelectedPiecePosition(null);
        setPossibleMoves([]);
        if (piece && piece.color === currentPlayer) {
          setSelectedPiecePosition(pos);
          const moves = getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget);
          setPossibleMoves(moves);
        }
      }
    } else if (piece && piece.color === currentPlayer) {
      setSelectedPiecePosition(pos);
      const moves = getPossibleMoves(boardState, pos, currentPlayer, castlingRights, enPassantTarget);
      setPossibleMoves(moves);
    }
  }, [boardState, currentPlayer, selectedPiecePosition, possibleMoves, castlingRights, enPassantTarget, gameStatus.isGameOver, promotionSquare, applyMove, gameMode, isComputerThinking]);

  const handlePromotion = useCallback((pieceType: PieceType) => {
    if (!promotionSquare) return; 
    
    const tempBoard = createDeepBoardCopy(boardState);
    const pawnToPromote = tempBoard[promotionSquare[0]][promotionSquare[1]];

    if(pawnToPromote && pawnToPromote.type === PieceType.PAWN) {
      tempBoard[promotionSquare[0]][promotionSquare[1]] = {
        ...pawnToPromote,
        type: pieceType,
        id: pawnToPromote.id.replace(/P\\d*$/, pieceType) 
      };
      setBoardState(tempBoard);
      
      const nextPlayer = currentPlayer === PlayerColor.WHITE ? PlayerColor.BLACK : PlayerColor.WHITE;
      const preamble = `${getCurrentPlayerRealName()} promoted Pawn to ${PIECE_SYMBOLS[currentPlayer][pieceType]}!`;
      updateGameStatus(tempBoard, currentPlayer, castlingRights, enPassantTarget, preamble);
      if(!gameStatus.isGameOver) { // Check if promotion itself ended game (unlikely but good check)
          setCurrentPlayer(nextPlayer);
      }
    }
    
    setPromotionSquare(null);
    setSelectedPiecePosition(null); 
    setPossibleMoves([]);

  }, [boardState, promotionSquare, currentPlayer, castlingRights, enPassantTarget, updateGameStatus, getCurrentPlayerRealName, gameStatus.isGameOver]);
  
  useEffect(() => {
    if (gameMode === 'computer' && currentPlayer === PlayerColor.BLACK && !gameStatus.isGameOver && !promotionSquare && !isComputerThinking) {
      setIsComputerThinking(true);
      setGameStatus(prev => ({ ...prev, message: `${AI_PLAYER_NAME} is thinking...`}));
      
      getComputerMove(boardState, PlayerColor.BLACK, castlingRights, enPassantTarget)
        .then((aiMove: AIMove | null) => {
          if (aiMove) {
            const pieceAtFrom = boardState[aiMove.from[0]][aiMove.from[1]];
            if (pieceAtFrom && pieceAtFrom.color === PlayerColor.BLACK) {
                const AIsPossibleMoves = getPossibleMoves(boardState, aiMove.from, PlayerColor.BLACK, castlingRights, enPassantTarget);
                if (AIsPossibleMoves.some(m => m[0] === aiMove.to[0] && m[1] === aiMove.to[1])) {
                    applyMove(aiMove.from, aiMove.to, aiMove.promotion);
                } else {
                    console.error("AI suggested an invalid move. From:", aiMove.from, "To:", aiMove.to, "Promotion:", aiMove.promotion, "Possible moves for piece:", AIsPossibleMoves);
                    setGameStatus(prev => ({...prev, message: "AI error. White's turn."}));
                    if (!gameStatus.isGameOver) setCurrentPlayer(PlayerColor.WHITE);
                }
            } else {
                 console.error("AI tried to move an empty square or opponent's piece.");
                 setGameStatus(prev => ({...prev, message: "AI error. White's turn."}));
                 if (!gameStatus.isGameOver) setCurrentPlayer(PlayerColor.WHITE);
            }
          } else {
             setGameStatus(prev => ({...prev, message: "AI could not make a move. White's turn."}));
             if (!gameStatus.isGameOver) setCurrentPlayer(PlayerColor.WHITE);
          }
        })
        .catch(error => {
          console.error("Error getting AI move:", error);
          setGameStatus(prev => ({...prev, message: "Error with AI. White's turn."}));
          if (!gameStatus.isGameOver) setCurrentPlayer(PlayerColor.WHITE);
        })
        .finally(() => {
          setIsComputerThinking(false);
        });
    }
  }, [currentPlayer, gameMode, gameStatus.isGameOver, promotionSquare, boardState, castlingRights, enPassantTarget, applyMove, isComputerThinking]); // Removed gameStatus from dep array, handled by specific gameOver checks

   useEffect(() => {
    if (isGameSetupComplete && !gameStatus.isGameOver) {
        setGameStatus(prev => ({ ...prev, message: `${getCurrentPlayerRealName()}'s turn` }));
    } else if (!isGameSetupComplete && !gameMode) { // Only set to "Setting up..." if truly at the beginning
        setGameStatus({ message: 'Welcome! Choose a mode.', isGameOver: false });
    } else if (!isGameSetupComplete && gameMode) {
        setGameStatus({ message: 'Enter player names...', isGameOver: false });
    }
  }, [isGameSetupComplete, gameMode, player1Name, player2Name, currentPlayer, getCurrentPlayerRealName, gameStatus.isGameOver]);


  const handleGameSetup = (p1Name: string, p2Name?: string) => {
    setPlayer1Name(p1Name.trim() || "Player 1");
    if (gameMode === 'friend') {
      setPlayer2Name(p2Name?.trim() || "Player 2");
    } else {
      setPlayer2Name(AI_PLAYER_NAME);
    }
    setIsGameSetupComplete(true);
    setCurrentGameStartTime(Date.now()); // Set game start time
    // Initial game message will be set by the useEffect above
  };
  
  if (!gameMode) {
    // const handleClearLeaderboard = () => setLeaderboardData([]); // For dev
    return <InitialScreen leaderboardData={leaderboardData} onSelectMode={setGameMode} /* onClearLeaderboard={handleClearLeaderboard} */ />;
  }

  if (!isGameSetupComplete) {
    return <PlayerNameEntry gameMode={gameMode} onSetupComplete={handleGameSetup} />;
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-2 sm:p-3 selection:bg-yellow-300 selection:text-yellow-900">
      <header className="mb-3 sm:mb-4 text-center">
        {/* Title is also on InitialScreen, consider if this is needed or should be different */}
        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-bold text-slate-700 tracking-tight">
          Classic Chess Game
        </h1>
      </header>
      
      <main className="flex flex-col items-center space-y-3 sm:space-y-4 w-full max-w-max">
        <div className="w-full flex justify-between items-start px-1 md:px-0 max-w-md md:max-w-xl lg:max-w-2xl">
            <CapturedPiecesDisplay pieces={capturedByBlack} playerName={player2Name} capturingPlayerColor={PlayerColor.WHITE} />
            <div className="text-center mx-2">
                <p className={`font-semibold text-sm ${currentPlayer === PlayerColor.BLACK ? 'text-teal-600' : 'text-slate-500'}`}>{player2Name}</p>
            </div>
        </div>

        <Board
          boardState={boardState}
          onSquareClick={handleSquareClick}
          selectedPiecePosition={selectedPiecePosition}
          possibleMoves={possibleMoves}
          currentPlayer={currentPlayer}
          kingInCheckPosition={kingInCheckPosition}
        />

        <div className="w-full flex justify-between items-end px-1 md:px-0 max-w-md md:max-w-xl lg:max-w-2xl">
             <div className="text-center mx-2">
                 <p className={`font-semibold text-sm ${currentPlayer === PlayerColor.WHITE ? 'text-red-700' : 'text-slate-500'}`}>{player1Name}</p>
            </div>
            <CapturedPiecesDisplay pieces={capturedByWhite} playerName={player1Name} capturingPlayerColor={PlayerColor.BLACK} />
        </div>
        
        <GameInfo 
            currentPlayerName={isComputerThinking ? AI_PLAYER_NAME : getCurrentPlayerRealName()}
            gameStatus={gameStatus} 
            onReset={resetGame}
            isGameOver={gameStatus.isGameOver}
            isComputerThinking={isComputerThinking && gameMode === 'computer'}
            gameMode={gameMode}
        />

      </main>
      {promotionSquare && ( 
        <PromotionModal 
            playerColor={boardState[promotionSquare[0]][promotionSquare[1]]?.color || currentPlayer} 
            onPromote={handlePromotion} />
      )}
       <footer className="mt-4 sm:mt-6 text-center text-xs text-slate-500">
        <p>Select a piece, then its destination. Good luck!</p>
        <p>&copy; {new Date().getFullYear()} Joyonto Karmakar. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default App;
